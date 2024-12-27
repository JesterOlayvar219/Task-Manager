-- Drop existing tables to start fresh
DROP TABLE IF EXISTS private_chat_messages CASCADE;
DROP TABLE IF EXISTS private_chat_members CASCADE;
DROP TABLE IF EXISTS private_chats CASCADE;
DROP TABLE IF EXISTS typing_status CASCADE;

-- Create private_chats table
CREATE TABLE private_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT private_chats_name_length CHECK (char_length(name) BETWEEN 1 AND 100)
);

-- Create private_chat_members table
CREATE TABLE private_chat_members (
  private_chat_id UUID REFERENCES private_chats(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (private_chat_id, user_id)
);

-- Create private_chat_messages table
CREATE TABLE private_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  private_chat_id UUID REFERENCES private_chats(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create typing_status table
CREATE TABLE typing_status (
  channel_id TEXT NOT NULL,
  username TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (channel_id, username)
);

-- Add indexes
CREATE INDEX idx_private_chats_creator ON private_chats(creator_id);
CREATE INDEX idx_private_chat_members_user ON private_chat_members(user_id);
CREATE INDEX idx_private_chat_messages_chat ON private_chat_messages(private_chat_id);
CREATE INDEX idx_private_chat_messages_created ON private_chat_messages(created_at);
CREATE INDEX idx_typing_status_updated ON typing_status(updated_at);

-- Enable RLS
ALTER TABLE private_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;

-- Private chats policies
CREATE POLICY "private_chats_select"
  ON private_chats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "private_chats_insert"
  ON private_chats FOR INSERT
  TO authenticated
  WITH CHECK (
    creator_id = (SELECT username FROM users WHERE id = auth.uid())
  );

CREATE POLICY "private_chats_update"
  ON private_chats FOR UPDATE
  TO authenticated
  USING (
    creator_id = (SELECT username FROM users WHERE id = auth.uid())
  );

CREATE POLICY "private_chats_delete"
  ON private_chats FOR DELETE
  TO authenticated
  USING (
    creator_id = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Private chat members policies
CREATE POLICY "private_chat_members_select"
  ON private_chat_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "private_chat_members_insert"
  ON private_chat_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "private_chat_members_delete"
  ON private_chat_members FOR DELETE
  TO authenticated
  USING (true);

-- Private chat messages policies
CREATE POLICY "private_chat_messages_select"
  ON private_chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM private_chat_members
      WHERE private_chat_id = private_chat_messages.private_chat_id
      AND user_id = (SELECT username FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "private_chat_messages_insert"
  ON private_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender = (SELECT username FROM users WHERE id = auth.uid()) AND
    EXISTS (
      SELECT 1 FROM private_chat_members
      WHERE private_chat_id = private_chat_messages.private_chat_id
      AND user_id = sender
    )
  );

-- Typing status policies
CREATE POLICY "typing_status_select"
  ON typing_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "typing_status_insert"
  ON typing_status FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "typing_status_delete"
  ON typing_status FOR DELETE
  TO authenticated
  USING (true);

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