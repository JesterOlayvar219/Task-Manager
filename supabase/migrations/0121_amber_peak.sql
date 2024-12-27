-- Drop existing tables and start fresh
DROP TABLE IF EXISTS private_chat_members CASCADE;
DROP TABLE IF EXISTS private_chats CASCADE;

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
CREATE INDEX idx_private_chats_creator ON private_chats(creator_id);
CREATE INDEX idx_private_chat_members_user ON private_chat_members(user_id);

-- Enable RLS
ALTER TABLE private_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_chat_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for private_chats
CREATE POLICY "Users can read their chats"
  ON private_chats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM private_chat_members
      WHERE private_chat_id = id
      AND user_id = (SELECT username FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can create chats"
  ON private_chats FOR INSERT
  TO authenticated
  WITH CHECK (
    creator_id = (SELECT username FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Creators can update chats"
  ON private_chats FOR UPDATE
  TO authenticated
  USING (
    creator_id = (SELECT username FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Creators can delete chats"
  ON private_chats FOR DELETE
  TO authenticated
  USING (
    creator_id = (SELECT username FROM users WHERE id = auth.uid())
  );

-- RLS policies for private_chat_members
CREATE POLICY "Members can read chat members"
  ON private_chat_members FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT username FROM users WHERE id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM private_chats
      WHERE id = private_chat_id
      AND creator_id = (SELECT username FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Creators can manage members"
  ON private_chat_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM private_chats
      WHERE id = private_chat_id
      AND creator_id = (SELECT username FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Creators can remove members"
  ON private_chat_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM private_chats
      WHERE id = private_chat_id
      AND creator_id = (SELECT username FROM users WHERE id = auth.uid())
    )
  );