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
    -- Must be authenticated and be the sender
    sender = (SELECT username FROM users WHERE id = auth.uid()) AND
    (
      -- For personal messages, sender must be recipient
      (type = 'personal' AND sender = recipient) OR
      -- For channel messages, must have channel_id
      (type = 'channel' AND channel_id IS NOT NULL)
    )
  );

-- Add type check constraint
ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_type_check,
  ADD CONSTRAINT messages_type_check 
  CHECK (type IN ('channel', 'personal'));

-- Add channel_id constraint
ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_channel_check,
  ADD CONSTRAINT messages_channel_check
  CHECK (
    (type = 'channel' AND channel_id IS NOT NULL) OR
    (type = 'personal' AND channel_id IS NULL)
  );