-- Drop existing messages table
DROP TABLE IF EXISTS messages CASCADE;

-- Create new messages table with correct schema
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  sender TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  chat_type TEXT NOT NULL CHECK (chat_type IN ('channel', 'private')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_messages_chat ON messages(chat_id, chat_type);
CREATE INDEX idx_messages_sender ON messages(sender);
CREATE INDEX idx_messages_unread ON messages(chat_id, is_read, sender) WHERE NOT is_read;
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "messages_select"
  ON messages FOR SELECT
  TO authenticated
  USING (
    -- Can read channel messages
    (chat_type = 'channel') OR
    -- Can read private messages if sender or recipient
    (chat_type = 'private' AND (
      sender = (SELECT username FROM users WHERE id = auth.uid()) OR
      chat_id = (SELECT username FROM users WHERE id = auth.uid())
    ))
  );

CREATE POLICY "messages_insert"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Must be authenticated and be the sender
    sender = (SELECT username FROM users WHERE id = auth.uid()) AND
    -- For private messages, chat_id must be valid username
    (
      (chat_type = 'channel') OR
      (chat_type = 'private' AND EXISTS (
        SELECT 1 FROM users WHERE username = chat_id
      ))
    )
  );

CREATE POLICY "messages_update"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    -- Can only update messages where user is recipient
    chat_id = (SELECT username FROM users WHERE id = auth.uid())
  )
  WITH CHECK (
    -- Only allow updating is_read field
    is_read = true AND
    id = id AND
    content = content AND
    sender = sender AND
    chat_id = chat_id AND
    chat_type = chat_type AND
    created_at = created_at
  );