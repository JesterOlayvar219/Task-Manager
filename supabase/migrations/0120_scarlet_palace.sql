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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  private_chat_id UUID REFERENCES private_chats(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_private_chats_creator ON private_chats(creator_id);
CREATE INDEX idx_private_chat_members_chat ON private_chat_members(private_chat_id);
CREATE INDEX idx_private_chat_members_user ON private_chat_members(user_id);

-- Enable RLS
ALTER TABLE private_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_chat_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for private_chats
CREATE POLICY "Users can read chats they are members of"
  ON private_chats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM private_chat_members
      WHERE private_chat_id = id
      AND user_id = (SELECT username FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can create private chats"
  ON private_chats FOR INSERT
  TO authenticated
  WITH CHECK (
    creator_id = (SELECT username FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Chat creators can update visibility"
  ON private_chats FOR UPDATE
  TO authenticated
  USING (
    creator_id = (SELECT username FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Chat creators can delete chats"
  ON private_chats FOR DELETE
  TO authenticated
  USING (
    creator_id = (SELECT username FROM users WHERE id = auth.uid())
  );

-- RLS policies for private_chat_members
CREATE POLICY "Users can see chat members"
  ON private_chat_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM private_chat_members pcm
      WHERE pcm.private_chat_id = private_chat_id
      AND pcm.user_id = (SELECT username FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Chat creators can manage members"
  ON private_chat_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM private_chats
      WHERE id = private_chat_id
      AND creator_id = (SELECT username FROM users WHERE id = auth.uid())
    )
  );