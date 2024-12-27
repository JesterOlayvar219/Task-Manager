-- Drop existing policies
DROP POLICY IF EXISTS "Channel messages access" ON messages;

-- Create separate policies for different operations
CREATE POLICY "Read channel messages"
  ON messages FOR SELECT
  TO authenticated
  USING (type = 'channel');

CREATE POLICY "Insert channel messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    type = 'channel' AND
    sender = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_type_channel ON messages(type) WHERE type = 'channel';
CREATE INDEX IF NOT EXISTS idx_messages_sender_username ON messages(sender);