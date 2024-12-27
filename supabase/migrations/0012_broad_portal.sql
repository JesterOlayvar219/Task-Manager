/*
  # Messages Table Restructuring

  1. Changes
    - Drop existing message tables
    - Create unified messages table
    - Add proper indexes
    - Set up RLS policies

  2. Security
    - Enable RLS
    - Add policies for channel and personal messages
    - Ensure proper access control
*/

-- Drop existing tables and start fresh
DROP TABLE IF EXISTS channel_messages;
DROP TABLE IF EXISTS messages;

-- Create messages table that handles both channel and personal messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL, -- Channel ID for channel messages, User ID for personal messages
  type TEXT NOT NULL CHECK (type IN ('channel', 'personal')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  participants TEXT[] -- For personal messages only
);

-- Add indexes for performance
CREATE INDEX idx_messages_type_recipient ON messages(type, recipient);
CREATE INDEX idx_messages_sender ON messages(sender);
CREATE INDEX idx_messages_participants ON messages USING GIN(participants);
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Channel messages policy
CREATE POLICY "Channel messages are readable by all authenticated users"
  ON messages FOR SELECT
  TO authenticated
  USING (
    (type = 'channel') OR
    (type = 'personal' AND (
      auth.uid()::text = ANY(participants) OR
      sender = auth.uid()::text OR
      recipient = auth.uid()::text
    ))
  );

-- Insert policy
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid()::text = sender AND
    (
      (type = 'channel') OR
      (type = 'personal' AND auth.uid()::text = ANY(participants))
    )
  );

-- Update policy for marking messages as read
CREATE POLICY "Users can update messages they received"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    auth.uid()::text = recipient OR
    (type = 'personal' AND auth.uid()::text = ANY(participants))
  );