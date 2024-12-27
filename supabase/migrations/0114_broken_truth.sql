-- Drop existing typing_status table and related objects
DROP TABLE IF EXISTS typing_status CASCADE;

-- Create typing_status table
CREATE TABLE typing_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id TEXT NOT NULL,
  username TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, username)
);

-- Add indexes for performance
CREATE INDEX idx_typing_status_channel ON typing_status(channel_id);
CREATE INDEX idx_typing_status_updated ON typing_status(updated_at);

-- Create function to clean up old typing status
CREATE OR REPLACE FUNCTION cleanup_typing_status() RETURNS trigger AS $$
BEGIN
  -- Delete typing status older than 3 seconds
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

-- Enable RLS
ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;

-- Create policies with unique names
CREATE POLICY "typing_status_read_policy"
  ON typing_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "typing_status_insert_policy"
  ON typing_status FOR INSERT
  TO authenticated
  WITH CHECK (
    username = (SELECT username FROM users WHERE id = auth.uid())
  );

CREATE POLICY "typing_status_update_policy"
  ON typing_status FOR UPDATE
  TO authenticated
  USING (
    username = (SELECT username FROM users WHERE id = auth.uid())
  );

CREATE POLICY "typing_status_delete_policy"
  ON typing_status FOR DELETE
  TO authenticated
  USING (
    username = (SELECT username FROM users WHERE id = auth.uid()) OR
    updated_at < NOW() - INTERVAL '3 seconds'
  );

-- Add constraint to ensure channel_id is not empty
ALTER TABLE typing_status
  ADD CONSTRAINT typing_status_channel_id_check
  CHECK (channel_id != '');