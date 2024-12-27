-- First create new messages table
CREATE TABLE new_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  sender TEXT NOT NULL,
  chat_id TEXT NOT NULL, -- Channel ID or private chat ID
  chat_type TEXT NOT NULL CHECK (chat_type IN ('channel', 'private')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_messages_chat ON new_messages(chat_id, chat_type);
CREATE INDEX idx_messages_sender ON new_messages(sender);
CREATE INDEX idx_messages_unread ON new_messages(chat_id, is_read, sender) WHERE NOT is_read;
CREATE INDEX idx_messages_created ON new_messages(created_at);

-- Enable RLS
ALTER TABLE new_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "messages_select"
  ON new_messages FOR SELECT
  TO authenticated
  USING (
    -- Can read channel messages
    (chat_type = 'channel') OR
    -- Can read private messages if member of the chat
    (chat_type = 'private' AND
      EXISTS (
        SELECT 1 FROM private_chat_members
        WHERE private_chat_id::text = chat_id
        AND user_id = (SELECT username FROM users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "messages_insert"
  ON new_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender = (SELECT username FROM users WHERE id = auth.uid()) AND
    (
      -- Can send to channels
      (chat_type = 'channel') OR
      -- Can send to private chats if member
      (chat_type = 'private' AND
        EXISTS (
          SELECT 1 FROM private_chat_members
          WHERE private_chat_id::text = chat_id
          AND user_id = sender
        )
      )
    )
  );

CREATE POLICY "messages_update"
  ON new_messages FOR UPDATE
  TO authenticated
  USING (
    -- Can only update is_read status
    sender != (SELECT username FROM users WHERE id = auth.uid())
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

-- Migrate data from old tables
INSERT INTO new_messages (content, sender, chat_id, chat_type, is_read, created_at)
SELECT 
  content,
  sender,
  CASE 
    WHEN type = 'channel' THEN channel_id
    ELSE recipient
  END as chat_id,
  'channel' as chat_type, -- Convert all existing messages to channel type
  read as is_read,
  timestamp as created_at
FROM messages
WHERE type = 'channel'; -- Only migrate channel messages

-- Drop old tables
DROP TABLE IF EXISTS messages CASCADE;

-- Rename new table
ALTER TABLE new_messages RENAME TO messages;