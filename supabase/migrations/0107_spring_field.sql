-- Drop existing policies
DROP POLICY IF EXISTS "Read channel messages" ON messages;
DROP POLICY IF EXISTS "Insert channel messages" ON messages;

-- Create improved policies
CREATE POLICY "Read messages"
  ON messages FOR SELECT
  TO authenticated
  USING (true); -- Allow reading all messages

CREATE POLICY "Insert messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Add NOT NULL constraints
ALTER TABLE messages
  ALTER COLUMN type SET NOT NULL,
  ALTER COLUMN sender SET NOT NULL,
  ALTER COLUMN recipient SET NOT NULL;

-- Add type check constraint
ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_type_check,
  ADD CONSTRAINT messages_type_check 
  CHECK (type IN ('channel', 'personal'));

-- Drop existing indexes first
DROP INDEX IF EXISTS idx_messages_type;
DROP INDEX IF EXISTS idx_messages_type_channel;
DROP INDEX IF EXISTS idx_messages_sender;
DROP INDEX IF EXISTS idx_messages_sender_username;
DROP INDEX IF EXISTS idx_messages_recipient;

-- Create new indexes
CREATE INDEX IF NOT EXISTS messages_type_idx ON messages(type);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON messages(sender);
CREATE INDEX IF NOT EXISTS messages_recipient_idx ON messages(recipient);