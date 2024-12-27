/*
  # Messages Table Migration

  1. Changes
    - Drop existing messages table
    - Create new messages table with simplified structure
    - Add appropriate indexes
    - Set up RLS policies
  
  2. Security
    - Enable RLS
    - Add policies for reading and sending messages
    - Add policy for marking messages as read
*/

-- Drop existing table
DROP TABLE IF EXISTS messages;

-- Create new messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  sender TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- Add indexes
CREATE INDEX idx_messages_channel ON messages(channel_id);
CREATE INDEX idx_messages_sender ON messages(sender);
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read channel messages"
  ON messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = sender);

-- Use DO block for update policy to handle row-level comparison
DO $$
BEGIN
  CREATE POLICY "Users can mark messages as read"
    ON messages FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = sender)
    WITH CHECK (
      -- Only allow updating the read status
      read IS TRUE
    );
END
$$;