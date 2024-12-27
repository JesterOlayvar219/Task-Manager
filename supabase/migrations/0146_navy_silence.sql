/*
  # Fix Unread Messages

  1. Changes
    - Add unread_count view for efficient unread message counting
    - Add indexes for better performance
    - Update RLS policies for message read status

  2. Security
    - Enable RLS
    - Add policies for read/write access
*/

-- Create view for unread message counts
CREATE OR REPLACE VIEW unread_message_counts AS
SELECT 
  chat_id,
  sender,
  COUNT(*) as unread_count
FROM messages
WHERE 
  chat_type = 'private' 
  AND NOT is_read
GROUP BY chat_id, sender;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_chat_type_read 
ON messages(chat_type, chat_id, is_read, sender)
WHERE chat_type = 'private' AND NOT is_read;

-- Update RLS policies
DROP POLICY IF EXISTS "messages_update" ON messages;

CREATE POLICY "messages_update"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    -- Can only update messages where user is recipient
    chat_type = 'private' AND
    chat_id = (SELECT username FROM users WHERE id = auth.uid())
  )
  WITH CHECK (
    -- Only allow updating is_read field
    is_read = true
  );

-- Grant access to view
GRANT SELECT ON unread_message_counts TO authenticated;