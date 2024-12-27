-- Add is_read column to private_chat_messages table
ALTER TABLE private_chat_messages 
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Add index for unread messages
CREATE INDEX IF NOT EXISTS idx_private_chat_messages_unread 
  ON private_chat_messages(private_chat_id, is_read, sender) 
  WHERE NOT is_read;

-- Update RLS policies to allow marking messages as read
DROP POLICY IF EXISTS "private_chat_messages_update" ON private_chat_messages;

CREATE POLICY "private_chat_messages_update"
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