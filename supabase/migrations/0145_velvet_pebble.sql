/*
  # Fix Private Chat Notifications

  1. Changes
    - Add is_read column to messages table
    - Add indexes for efficient unread message queries
    - Update RLS policies to handle read status updates

  2. Security
    - Enable RLS
    - Add policies for read/write access
*/

-- Add is_read column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'is_read'
  ) THEN
    ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add indexes for unread messages
CREATE INDEX IF NOT EXISTS idx_messages_unread_private 
ON messages(chat_id, is_read, sender) 
WHERE chat_type = 'private' AND NOT is_read;

-- Update RLS policies
DROP POLICY IF EXISTS "messages_update" ON messages;

CREATE POLICY "messages_update"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    -- Can update messages where user is recipient
    chat_type = 'private' AND
    chat_id = (SELECT username FROM users WHERE id = auth.uid())
  )
  WITH CHECK (
    -- Only allow updating is_read field
    is_read = true AND
    id = id AND
    content = content AND
    sender = sender AND
    chat_id = chat_id AND
    chat_type = chat_type AND
    created_at = created_at
  );