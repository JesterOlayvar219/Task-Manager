-- Create private_chat_messages table with proper structure
CREATE TABLE IF NOT EXISTS private_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  private_chat_id UUID REFERENCES private_chats(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_private_chat_messages_chat ON private_chat_messages(private_chat_id);
CREATE INDEX IF NOT EXISTS idx_private_chat_messages_sender ON private_chat_messages(sender);
CREATE INDEX IF NOT EXISTS idx_private_chat_messages_unread 
  ON private_chat_messages(private_chat_id, is_read, sender) 
  WHERE NOT is_read;

-- Enable RLS
ALTER TABLE private_chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first
DROP POLICY IF EXISTS "private_chat_messages_select" ON private_chat_messages;
DROP POLICY IF EXISTS "private_chat_messages_insert" ON private_chat_messages;
DROP POLICY IF EXISTS "private_chat_messages_update" ON private_chat_messages;
DROP POLICY IF EXISTS "private_chat_messages_select_v2" ON private_chat_messages;
DROP POLICY IF EXISTS "private_chat_messages_insert_v2" ON private_chat_messages;
DROP POLICY IF EXISTS "private_chat_messages_update_v2" ON private_chat_messages;

-- Create new policies with unique names
CREATE POLICY "pcm_select_policy"
  ON private_chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM private_chat_members
      WHERE private_chat_id = private_chat_messages.private_chat_id
      AND user_id = (SELECT username FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "pcm_insert_policy"
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

CREATE POLICY "pcm_update_policy"
  ON private_chat_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM private_chat_members
      WHERE private_chat_id = private_chat_messages.private_chat_id
      AND user_id = (SELECT username FROM users WHERE id = auth.uid())
    )
  )
  WITH CHECK (
    -- Only allow updating is_read status
    is_read IS NOT NULL AND
    id = id AND
    private_chat_id = private_chat_id AND
    sender = sender AND
    content = content AND
    created_at = created_at
  );