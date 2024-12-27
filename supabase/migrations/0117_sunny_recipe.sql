-- Drop existing table and related objects
DROP TABLE IF EXISTS typing_status CASCADE;

-- Create typing_status table with optimized structure
CREATE TABLE typing_status (
  channel_id TEXT NOT NULL,
  username TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (channel_id, username)
);

-- Add index for cleanup queries
CREATE INDEX idx_typing_status_updated ON typing_status(updated_at);

-- Create cleanup function that runs more frequently
CREATE OR REPLACE FUNCTION cleanup_typing_status() RETURNS trigger AS $$
BEGIN
  -- Delete typing status older than 2 seconds for more responsive cleanup
  DELETE FROM typing_status 
  WHERE updated_at < NOW() - INTERVAL '2 seconds';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs on both insert and update
CREATE TRIGGER cleanup_old_typing_status
  AFTER INSERT OR UPDATE ON typing_status
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_typing_status();

-- Enable RLS
ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;

-- Create policies with simpler names and better permissions
CREATE POLICY "read_typing_status"
  ON typing_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "manage_typing_status"
  ON typing_status FOR ALL
  TO authenticated
  USING (username = (SELECT username FROM users WHERE id = auth.uid()))
  WITH CHECK (username = (SELECT username FROM users WHERE id = auth.uid()));