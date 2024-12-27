-- Create private_chat_messages table
CREATE TABLE private_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  private_chat_id UUID REFERENCES private_chats(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_private_chat_messages_chat ON private_chat_messages(private_chat_id);
CREATE INDEX idx_private_chat_messages_created ON private_chat_messages(created_at);

-- Enable RLS
ALTER TABLE private_chat_messages ENABLE ROW LEVEL SECURITY;

-- Private chat messages policies
CREATE POLICY "private_chat_messages_select"
  ON private_chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM private_chat_members
      WHERE private_chat_id = private_chat_messages.private_chat_id
      AND user_id = (SELECT username FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "private_chat_messages_insert"
  ON private_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender = (SELECT username FROM users WHERE id = auth.uid()) AND
    EXISTS (
      SELECT 1 FROM private_chat_members
      WHERE private_chat_id = private_chat_messages.private_chat_id
      AND user_id = sender
    )
  );