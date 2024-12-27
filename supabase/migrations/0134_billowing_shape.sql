-- Drop existing table and related objects
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

-- Create simplified policies with unique names
CREATE POLICY "ts_read_policy_v2"
  ON typing_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "ts_manage_policy_v2"
  ON typing_status FOR ALL
  TO authenticated
  USING (username = (SELECT username FROM users WHERE id = auth.uid()))
  WITH CHECK (username = (SELECT username FROM users WHERE id = auth.uid()));

-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_typing_status() RETURNS trigger AS $$
BEGIN
  DELETE FROM typing_status 
  WHERE updated_at < NOW() - INTERVAL '3 seconds';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cleanup
CREATE TRIGGER cleanup_old_typing_status
  AFTER INSERT OR UPDATE ON typing_status
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_typing_status();