/*
  # Fix Chat Message Handling

  1. Changes
    - Update channel_messages schema
    - Add recipient field for notifications
    - Fix RLS policies
  
  2. Security
    - Ensure proper access control for messages
    - Allow channel message creation
*/

-- Update channel_messages table
ALTER TABLE channel_messages
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'channel',
  ADD COLUMN IF NOT EXISTS recipient TEXT;

-- Update RLS policies for channel messages
DROP POLICY IF EXISTS "Enable read access for channel messages" ON channel_messages;
CREATE POLICY "Enable read access for channel messages"
  ON channel_messages FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Enable insert access for channel messages" ON channel_messages;
CREATE POLICY "Enable insert access for channel messages"
  ON channel_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    type = 'channel' AND
    sender = auth.uid()::text
  );

-- Update messages table for personal messages only
ALTER TABLE messages
  ALTER COLUMN type SET DEFAULT 'personal',
  ALTER COLUMN type SET NOT NULL;

-- Update RLS policies for personal messages
DROP POLICY IF EXISTS "Enable read access for messages" ON messages;
CREATE POLICY "Enable read access for messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = ANY(participants) OR
    sender = auth.uid()::text OR
    recipient = auth.uid()::text
  );

DROP POLICY IF EXISTS "Enable insert access for messages" ON messages;
CREATE POLICY "Enable insert access for messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    type = 'personal' AND
    sender = auth.uid()::text
  );