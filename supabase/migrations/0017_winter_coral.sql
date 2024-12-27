/*
  # Messages and Tasks Schema Update

  1. Changes
    - Drop and recreate messages table with proper structure
    - Add indexes for performance
    - Set up RLS policies
  
  2. Security
    - Enable RLS
    - Add policies for reading and sending messages
*/

-- Drop existing messages table
DROP TABLE IF EXISTS messages;

-- Create new messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('channel', 'personal')),
  channel_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  participants TEXT[]
);

-- Add indexes for performance
CREATE INDEX idx_messages_type_recipient ON messages(type, recipient);
CREATE INDEX idx_messages_sender ON messages(sender);
CREATE INDEX idx_messages_participants ON messages USING GIN(participants);
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    (type = 'channel') OR
    (type = 'personal' AND (
      auth.uid()::text = ANY(participants) OR
      auth.uid()::text = sender OR
      auth.uid()::text = recipient
    ))
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = sender);

CREATE POLICY "Users can mark messages as read"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = recipient)
  WITH CHECK (read IS TRUE);