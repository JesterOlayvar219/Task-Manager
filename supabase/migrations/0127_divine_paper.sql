-- Drop existing policies
DROP POLICY IF EXISTS "Read private chats" ON private_chats;
DROP POLICY IF EXISTS "Create private chats" ON private_chats;
DROP POLICY IF EXISTS "Update own private chats" ON private_chats;
DROP POLICY IF EXISTS "Delete own private chats" ON private_chats;
DROP POLICY IF EXISTS "Read chat members" ON private_chat_members;
DROP POLICY IF EXISTS "Manage chat members" ON private_chat_members;

-- Create simplified policies for private_chats
CREATE POLICY "Read private chats"
  ON private_chats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Create private chats"
  ON private_chats FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = (SELECT username FROM users WHERE id = auth.uid()));

CREATE POLICY "Update own private chats"
  ON private_chats FOR UPDATE
  TO authenticated
  USING (creator_id = (SELECT username FROM users WHERE id = auth.uid()));

CREATE POLICY "Delete own private chats"
  ON private_chats FOR DELETE
  TO authenticated
  USING (creator_id = (SELECT username FROM users WHERE id = auth.uid()));

-- Create simplified policies for private_chat_members
CREATE POLICY "Read chat members"
  ON private_chat_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Insert chat members"
  ON private_chat_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM private_chats
      WHERE id = private_chat_id
      AND creator_id = (SELECT username FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Delete chat members"
  ON private_chat_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM private_chats
      WHERE id = private_chat_id
      AND creator_id = (SELECT username FROM users WHERE id = auth.uid())
    )
  );