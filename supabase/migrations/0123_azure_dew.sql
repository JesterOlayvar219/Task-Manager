-- Create private_chats table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'private_chats') THEN
    CREATE TABLE private_chats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      creator_id TEXT NOT NULL,
      is_hidden BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT private_chats_name_length CHECK (char_length(name) BETWEEN 1 AND 100)
    );
  END IF;
END $$;

-- Create private_chat_members table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'private_chat_members') THEN
    CREATE TABLE private_chat_members (
      private_chat_id UUID REFERENCES private_chats(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL,
      joined_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (private_chat_id, user_id)
    );
  END IF;
END $$;

-- Add indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_private_chats_creator') THEN
    CREATE INDEX idx_private_chats_creator ON private_chats(creator_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_private_chat_members_user') THEN
    CREATE INDEX idx_private_chat_members_user ON private_chat_members(user_id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE private_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_chat_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Read private chats" ON private_chats;
DROP POLICY IF EXISTS "Create private chats" ON private_chats;
DROP POLICY IF EXISTS "Update own private chats" ON private_chats;
DROP POLICY IF EXISTS "Delete own private chats" ON private_chats;
DROP POLICY IF EXISTS "Read chat members" ON private_chat_members;
DROP POLICY IF EXISTS "Manage chat members" ON private_chat_members;

-- Create new policies
CREATE POLICY "Read private chats"
  ON private_chats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM private_chat_members
      WHERE private_chat_id = id
      AND user_id = (SELECT username FROM users WHERE id = auth.uid())
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

CREATE POLICY "Read chat members"
  ON private_chat_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM private_chat_members
      WHERE private_chat_id = private_chat_members.private_chat_id
      AND user_id = (SELECT username FROM users WHERE id = auth.uid())
    )
  );

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