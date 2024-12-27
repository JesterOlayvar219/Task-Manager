/*
  # Fix Message and Channel Handling

  1. Changes
    - Add channel_messages table for channel-specific messages
    - Update messages table for personal messages only
    - Fix column types and constraints
    - Update RLS policies
  
  2. Security
    - Separate policies for channel and personal messages
    - Ensure proper access control
*/

-- Create channel_messages table for channel messages
CREATE TABLE IF NOT EXISTS channel_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  sender TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- Update messages table for personal messages
ALTER TABLE messages
  DROP COLUMN IF EXISTS channel_id,
  ALTER COLUMN type DROP NOT NULL,
  ALTER COLUMN type SET DEFAULT 'personal';

-- Enable RLS
ALTER TABLE channel_messages ENABLE ROW LEVEL SECURITY;

-- Channel messages policies
CREATE POLICY "Enable read access for channel messages"
  ON channel_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for channel messages"
  ON channel_messages FOR INSERT
  TO authenticated
  WITH CHECK (sender = auth.uid()::text);

-- Update messages policies for personal messages
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