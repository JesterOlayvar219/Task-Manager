/*
  # Fix Column Types for Messages and Notifications

  1. Changes
    - Drop foreign key constraints
    - Change recipient and sender columns to TEXT type
    - Drop NOT NULL constraint from recipient
    - Recreate policies with updated column references
  
  2. Security
    - Maintain same security rules with updated column types
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for notifications" ON notifications;
DROP POLICY IF EXISTS "Enable update access for notifications" ON notifications;
DROP POLICY IF EXISTS "Enable read access for messages" ON messages;
DROP POLICY IF EXISTS "Enable insert access for messages" ON messages;

-- Drop foreign key constraints
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_recipient_fkey;

ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_sender_fkey;

-- Modify columns
ALTER TABLE notifications
  ALTER COLUMN recipient TYPE TEXT,
  ALTER COLUMN recipient DROP NOT NULL;

ALTER TABLE messages
  ALTER COLUMN sender TYPE TEXT,
  ALTER COLUMN recipient TYPE TEXT,
  ALTER COLUMN recipient DROP NOT NULL;

-- Recreate policies
CREATE POLICY "Enable read access for notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (recipient = auth.uid()::text);

CREATE POLICY "Enable update access for notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (recipient = auth.uid()::text);

CREATE POLICY "Enable read access for messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    type = 'channel' OR
    auth.uid()::text = ANY(participants) OR
    sender = auth.uid()::text OR
    recipient = auth.uid()::text
  );

CREATE POLICY "Enable insert access for messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender = auth.uid()::text);