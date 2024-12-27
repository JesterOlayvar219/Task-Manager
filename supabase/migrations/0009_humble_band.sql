/*
  # Fix Chat Message Handling

  1. Changes
    - Simplify message tables structure
    - Update RLS policies
    - Fix message type constraints
  
  2. Security
    - Ensure proper access control for messages
    - Allow message creation for authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for channel messages" ON channel_messages;
DROP POLICY IF EXISTS "Enable insert access for channel messages" ON channel_messages;
DROP POLICY IF EXISTS "Enable read access for messages" ON messages;
DROP POLICY IF EXISTS "Enable insert access for messages" ON messages;

-- Update channel_messages table
ALTER TABLE channel_messages
  DROP COLUMN IF EXISTS type,
  DROP COLUMN IF EXISTS recipient;

-- Create new policies for channel_messages
CREATE POLICY "Enable read access for channel messages"
  ON channel_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for channel messages"
  ON channel_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = sender);

-- Update messages table for personal messages
ALTER TABLE messages
  ALTER COLUMN type SET DEFAULT 'personal',
  ALTER COLUMN type SET NOT NULL,
  ALTER COLUMN participants SET NOT NULL;

-- Update personal messages policies
CREATE POLICY "Enable read access for messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = ANY(participants)
  );

CREATE POLICY "Enable insert access for messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid()::text = sender AND
    auth.uid()::text = ANY(participants)
  );