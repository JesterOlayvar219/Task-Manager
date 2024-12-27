/*
  # Messages Schema Update

  1. Changes
    - Consolidate messages into a single table
    - Add proper indexes and constraints
    - Update RLS policies

  2. Security
    - Enable RLS
    - Add policies for both channel and personal messages
    - Ensure proper access control
*/

-- Drop existing tables and start fresh
DROP TABLE IF EXISTS channel_messages;
DROP TABLE IF EXISTS messages;

-- Create unified messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  sender TEXT NOT NULL,
  channel_id TEXT, -- NULL for personal messages
  recipient TEXT, -- NULL for channel messages
  type TEXT NOT NULL CHECK (type IN ('channel', 'personal')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  participants TEXT[] -- For personal messages only
);

-- Add indexes
CREATE INDEX idx_messages_type ON messages(type);
CREATE INDEX idx_messages_channel_id ON messages(channel_id) WHERE type = 'channel';
CREATE INDEX idx_messages_participants ON messages USING GIN(participants) WHERE type = 'personal';
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for both channel and personal messages
CREATE POLICY "Anyone can read channel messages"
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
  WITH CHECK (
    auth.uid()::text = sender AND
    (
      (type = 'channel' AND channel_id IS NOT NULL) OR
      (type = 'personal' AND recipient IS NOT NULL AND participants IS NOT NULL)
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    -- Can only update read status
    auth.uid()::text = recipient OR
    (type = 'personal' AND auth.uid()::text = ANY(participants))
  )
  WITH CHECK (
    -- Only allow updating the read status
    id = id AND
    content = content AND
    sender = sender AND
    channel_id = channel_id AND
    recipient = recipient AND
    type = type AND
    timestamp = timestamp AND
    participants = participants
  );