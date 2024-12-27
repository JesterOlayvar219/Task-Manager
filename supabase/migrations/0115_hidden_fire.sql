-- Drop existing policies first
DROP POLICY IF EXISTS "typing_status_read_policy" ON typing_status;
DROP POLICY IF EXISTS "typing_status_insert_policy" ON typing_status;
DROP POLICY IF EXISTS "typing_status_update_policy" ON typing_status;
DROP POLICY IF EXISTS "typing_status_delete_policy" ON typing_status;

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS cleanup_old_typing_status ON typing_status;
DROP FUNCTION IF EXISTS cleanup_typing_status();

-- Create typing_status table if it doesn't exist
CREATE TABLE IF NOT EXISTS typing_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id TEXT NOT NULL,
  username TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, username)
);

-- Drop and recreate indexes
DROP INDEX IF EXISTS typing_status_channel_idx;
DROP INDEX IF EXISTS typing_status_updated_idx;

CREATE INDEX typing_status_channel_idx ON typing_status(channel_id);
CREATE INDEX typing_status_updated_idx ON typing_status(updated_at);

-- Create improved cleanup function
CREATE OR REPLACE FUNCTION cleanup_typing_status() RETURNS trigger AS $$
BEGIN
  -- Delete typing status older than 3 seconds
  DELETE FROM typing_status 
  WHERE updated_at < NOW() - INTERVAL '3 seconds';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger for cleanup
CREATE TRIGGER cleanup_old_typing_status
  AFTER INSERT OR UPDATE ON typing_status
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_typing_status();

-- Enable RLS
ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;

-- Create new policies with unique names
CREATE POLICY "ts_read_policy"
  ON typing_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "ts_insert_policy"
  ON typing_status FOR INSERT
  TO authenticated
  WITH CHECK (
    username = (SELECT username FROM users WHERE id = auth.uid())
  );

CREATE POLICY "ts_update_policy"
  ON typing_status FOR UPDATE
  TO authenticated
  USING (
    username = (SELECT username FROM users WHERE id = auth.uid())
  );

CREATE POLICY "ts_delete_policy"
  ON typing_status FOR DELETE
  TO authenticated
  USING (
    username = (SELECT username FROM users WHERE id = auth.uid()) OR
    updated_at < NOW() - INTERVAL '3 seconds'
  );