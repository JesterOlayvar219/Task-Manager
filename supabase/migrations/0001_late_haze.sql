/*
  # Initial Schema Setup

  1. Tables Created:
    - users
    - tasks
    - messages
    - resources
    - notifications

  2. Security:
    - RLS enabled on all tables
    - Policies set up for each table
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  profile_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  assignee UUID REFERENCES users(id),
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  files JSONB
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  sender UUID REFERENCES users(id),
  recipient TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  type TEXT NOT NULL,
  channel_id TEXT,
  participants TEXT[]
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT,
  username TEXT,
  password TEXT,
  access_users TEXT[] NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  recipient UUID REFERENCES users(id),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Users can read all tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Users can update their tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    auth.uid()::text = created_by::text OR 
    auth.uid()::text = assignee::text
  );

-- Messages policies
CREATE POLICY "Users can read their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    type = 'channel' OR
    auth.uid()::text = ANY(participants) OR
    auth.uid()::text = sender::text OR
    auth.uid()::text = recipient
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = sender::text);

-- Resources policies
CREATE POLICY "Users can read accessible resources"
  ON resources FOR SELECT
  TO authenticated
  USING (
    'Everyone' = ANY(access_users) OR
    auth.uid()::text = ANY(access_users)
  );

CREATE POLICY "Users can create resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their resources"
  ON resources FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = ANY(access_users));

-- Notifications policies
CREATE POLICY "Users can read their notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid()::text = recipient::text);

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = recipient::text);