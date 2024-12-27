-- Drop existing tables if they exist
DROP TABLE IF EXISTS private_chat_messages CASCADE;
DROP TABLE IF EXISTS private_chat_members CASCADE;
DROP TABLE IF EXISTS private_chats CASCADE;

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

-- Add indexes for better performance
CREATE INDEX idx_private_chats_creator ON private_chats(creator_id);
CREATE INDEX idx_private_chat_members_user ON private_chat_members(user_id);
CREATE INDEX idx_private_chat_messages_chat ON private_chat_messages(private_chat_id);
CREATE INDEX idx_private_chat_messages_created ON private_chat_messages(created_at);

-- Enable RLS
ALTER TABLE private_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_chat_messages ENABLE ROW LEVEL SECURITY;

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
  USING (true);

CREATE POLICY "Manage chat members"
  ON private_chat_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM private_chats
      WHERE id = private_chat_id
      AND creator_id = (SELECT username FROM users WHERE id = auth.uid())
    )
  );

-- Private chat messages policies
CREATE POLICY "Read chat messages"
  ON private_chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM private_chat_members
      WHERE private_chat_id = private_chat_messages.private_chat_id
      AND user_id = (SELECT username FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Send chat messages"
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