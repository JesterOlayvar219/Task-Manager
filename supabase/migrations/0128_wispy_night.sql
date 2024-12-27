-- Drop existing typing_status table and related objects
DROP TABLE IF EXISTS typing_status CASCADE;

-- Create typing_status table with simplified structure
CREATE TABLE typing_status (
  channel_id TEXT NOT NULL,
  username TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (channel_id, username)
);

-- Add index for cleanup
CREATE INDEX idx_typing_status_updated ON typing_status(updated_at);

-- Enable RLS
ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "typing_status_select"
  ON typing_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "typing_status_insert"
  ON typing_status FOR INSERT
  TO authenticated
  WITH CHECK (
    username = (SELECT username FROM users WHERE id = auth.uid())
  );

CREATE POLICY "typing_status_update"
  ON typing_status FOR UPDATE
  TO authenticated
  USING (
    username = (SELECT username FROM users WHERE id = auth.uid())
  );

CREATE POLICY "typing_status_delete"
  ON typing_status FOR DELETE
  TO authenticated
  USING (
    username = (SELECT username FROM users WHERE id = auth.uid())
  );