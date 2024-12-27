-- Drop existing function if it exists
DROP FUNCTION IF EXISTS mark_messages_as_read(text,text);

-- Add is_read column to messages table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'is_read'
  ) THEN
    ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add index for unread messages query performance
CREATE INDEX IF NOT EXISTS idx_messages_unread_status ON messages(sender, chat_id, is_read)
WHERE chat_type = 'private' AND NOT is_read;

-- Create function to mark messages as read and return count
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_sender TEXT, p_recipient TEXT)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  WITH updated_messages AS (
    UPDATE messages
    SET is_read = true
    WHERE 
      chat_type = 'private' AND
      sender = p_sender AND
      chat_id = p_recipient AND
      NOT is_read
    RETURNING id
  )
  SELECT COUNT(*) INTO updated_count FROM updated_messages;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION mark_messages_as_read TO authenticated;

-- Create view for unread message counts
CREATE OR REPLACE VIEW unread_message_counts AS
SELECT 
  chat_id,
  sender,
  COUNT(*) as unread_count
FROM messages
WHERE 
  chat_type = 'private' AND 
  NOT is_read
GROUP BY chat_id, sender;

-- Grant access to view
GRANT SELECT ON unread_message_counts TO authenticated;

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
    is_read = true AND
    id = id AND
    content = content AND
    sender = sender AND
    chat_id = chat_id AND
    chat_type = chat_type AND
    created_at = created_at
  );