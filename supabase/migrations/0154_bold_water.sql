-- Drop existing function first
DROP FUNCTION IF EXISTS mark_messages_as_read(text,text);

-- Create improved function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_recipient TEXT, p_chat_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  marked_count INTEGER;
BEGIN
  WITH updated_messages AS (
    UPDATE messages
    SET is_read = true
    WHERE 
      chat_type = 'private' AND
      chat_id = p_recipient AND
      sender = p_chat_id AND
      NOT is_read
    RETURNING id
  )
  SELECT COUNT(*) INTO marked_count FROM updated_messages;
  
  RETURN marked_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION mark_messages_as_read TO authenticated;

-- Drop and recreate view for unread message counts
DROP VIEW IF EXISTS unread_message_counts;
CREATE VIEW unread_message_counts AS
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