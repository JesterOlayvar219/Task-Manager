-- Drop existing policies
DROP POLICY IF EXISTS "Read messages" ON messages;
DROP POLICY IF EXISTS "Insert messages" ON messages;

-- Create improved policies
CREATE POLICY "Read messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    -- Can read channel messages
    type = 'channel' OR
    -- Can read personal messages where user is sender or recipient
    (type = 'personal' AND (
      sender = (SELECT username FROM users WHERE id = auth.uid()) OR
      recipient = (SELECT username FROM users WHERE id = auth.uid())
    ))
  );

CREATE POLICY "Insert messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender = (SELECT username FROM users WHERE id = auth.uid())
  );

-- Add type check constraint
ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_type_check,
  ADD CONSTRAINT messages_type_check 
  CHECK (type IN ('channel', 'personal'));