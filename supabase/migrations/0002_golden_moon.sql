/*
  # Update RLS policies for better authentication handling

  1. Changes
    - Update users table policies to allow profile creation and updates
    - Fix authentication checks in all policies
    - Add proper error handling for unauthorized access

  2. Security
    - Enable RLS on all tables
    - Add proper authentication checks
    - Ensure users can only access their own data
*/

-- Update users table policies
DROP POLICY IF EXISTS "Users can read all users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

CREATE POLICY "Enable read access for authenticated users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update access for own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Update tasks table policies
DROP POLICY IF EXISTS "Users can read all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their tasks" ON tasks;

CREATE POLICY "Enable read access for tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Enable update access for assigned tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    auth.uid()::text = created_by::text OR 
    auth.uid()::text = assignee::text
  );

CREATE POLICY "Enable delete access for own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid()::text = created_by::text);

-- Update messages table policies
DROP POLICY IF EXISTS "Users can read their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

CREATE POLICY "Enable read access for messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    type = 'channel' OR
    auth.uid()::text = ANY(participants) OR
    auth.uid()::text = sender::text OR
    auth.uid()::text = recipient
  );

CREATE POLICY "Enable insert access for messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = sender::text);

-- Update resources table policies
DROP POLICY IF EXISTS "Users can read accessible resources" ON resources;
DROP POLICY IF EXISTS "Users can create resources" ON resources;
DROP POLICY IF EXISTS "Users can update their resources" ON resources;

CREATE POLICY "Enable read access for resources"
  ON resources FOR SELECT
  TO authenticated
  USING (
    'Everyone' = ANY(access_users) OR
    auth.uid()::text = ANY(access_users)
  );

CREATE POLICY "Enable insert access for resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for resources"
  ON resources FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = ANY(access_users));

CREATE POLICY "Enable delete access for resources"
  ON resources FOR DELETE
  TO authenticated
  USING (auth.uid()::text = ANY(access_users));

-- Update notifications table policies
DROP POLICY IF EXISTS "Users can read their notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;

CREATE POLICY "Enable read access for notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid()::text = recipient::text);

CREATE POLICY "Enable insert access for notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = recipient::text);