-- Drop existing tables and recreate with proper structure
DROP TABLE IF EXISTS typing_status CASCADE;
DROP TABLE IF EXISTS private_chat_members CASCADE;
DROP TABLE IF EXISTS private_chats CASCADE;

-- Create typing_status table
CREATE TABLE typing_status (
  channel_id TEXT NOT NULL,
  username TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (channel_id, username)
);

-- Create private_chats table
CREATE TABLE private_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create private_chat_members table
CREATE TABLE private_chat_members (
  private_chat_id UUID REFERENCES private_chats(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (private_chat_id, user_id)
);

-- Add indexes
CREATE INDEX idx_typing_status_updated ON typing_status(updated_at);
CREATE INDEX idx_private_chats_creator ON private_chats(creator_id);
CREATE INDEX idx_private_chat_members_user ON private_chat_members(user_id);

-- Enable RLS
ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_chat_members ENABLE ROW LEVEL SECURITY;

-- Typing status policies
CREATE POLICY "Anyone can read typing status"
  ON typing_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their typing status"
  ON typing_status FOR INSERT
  TO authenticated
  WITH CHECK (username = (SELECT username FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their typing status"
  ON typing_status FOR DELETE
  TO authenticated
  USING (username = (SELECT username FROM users WHERE id = auth.uid()));

-- Private chats policies
CREATE POLICY "Read private chats"
  ON private_chats FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT private_chat_id 
      FROM private_chat_members 
      WHERE user_id = (SELECT username FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Create private chats"
  ON private_chats FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = (SELECT username FROM users WHERE id = auth.uid()));

CREATE POLICY "Update own private chats"
  ON private_chats FOR UPDATE
  TO authenticated
  USING (creator_id = (SELECT username FROM users WHERE id = auth.uid()));

CREATE POLICY "Delete own private chats"
  ON private_chats FOR DELETE
  TO authenticated
  USING (creator_id = (SELECT username FROM users WHERE id = auth.uid()));

-- Private chat members policies
CREATE POLICY "Read chat members"
  ON private_chat_members FOR SELECT
  TO authenticated
  USING (
    private_chat_id IN (
      SELECT id FROM private_chats
      WHERE creator_id = (SELECT username FROM users WHERE id = auth.uid())
    ) OR
    user_id = (SELECT username FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Manage chat members"
  ON private_chat_members FOR ALL
  TO authenticated
  USING (
    private_chat_id IN (
      SELECT id FROM private_chats
      WHERE creator_id = (SELECT username FROM users WHERE id = auth.uid())
    )
  );

-- Create cleanup function for typing status
CREATE OR REPLACE FUNCTION cleanup_typing_status() RETURNS trigger AS $$
BEGIN
  DELETE FROM typing_status 
  WHERE updated_at < NOW() - INTERVAL '3 seconds';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cleanup
CREATE TRIGGER cleanup_old_typing_status
  AFTER INSERT OR UPDATE ON typing_status
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_typing_status();