/*
  # Fix Chat Message Handling

  1. Changes
    - Add missing columns to channel_messages
    - Update RLS policies
    - Fix message type constraints
  
  2. Security
    - Ensure proper access control
    - Allow channel message creation
*/

-- Update channel_messages table
ALTER TABLE channel_messages
  ALTER COLUMN type SET DEFAULT 'channel',
  ALTER COLUMN type SET NOT NULL;

-- Drop and recreate channel messages policies
DROP POLICY IF EXISTS "Enable read access for channel messages" ON channel_messages;
CREATE POLICY "Enable read access for channel messages"
  ON channel_messages FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Enable insert access for channel messages" ON channel_messages;
CREATE POLICY "Enable insert access for channel messages"
  ON channel_messages FOR INSERT
  TO authenticated
  WITH CHECK (sender = auth.uid()::text);

-- Update messages table for personal messages
ALTER TABLE messages
  ALTER COLUMN type SET DEFAULT 'personal',
  ALTER COLUMN type SET NOT NULL;

-- Update personal messages policies
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
  WITH CHECK (sender = auth.uid()::text);