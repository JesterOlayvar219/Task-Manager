-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read channel messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Create improved policies
CREATE POLICY "Channel messages access"
  ON messages FOR ALL
  TO authenticated
  USING (
    type = 'channel'
  )
  WITH CHECK (
    type = 'channel' AND
    sender = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient);