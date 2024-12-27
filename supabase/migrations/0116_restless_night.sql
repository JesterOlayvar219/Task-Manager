-- Drop existing trigger and function first
DROP TRIGGER IF EXISTS cleanup_old_typing_status ON typing_status;
DROP FUNCTION IF EXISTS cleanup_typing_status();

-- Create improved cleanup function
CREATE OR REPLACE FUNCTION cleanup_typing_status() RETURNS trigger AS $$
BEGIN
  DELETE FROM typing_status 
  WHERE updated_at < NOW() - INTERVAL '3 seconds';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER cleanup_old_typing_status
  AFTER INSERT OR UPDATE ON typing_status
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_typing_status();

-- Drop and recreate indexes
DROP INDEX IF EXISTS idx_typing_status_channel;
DROP INDEX IF EXISTS idx_typing_status_updated;

CREATE INDEX idx_typing_status_channel ON typing_status(channel_id);
CREATE INDEX idx_typing_status_updated ON typing_status(updated_at);

-- Drop and recreate policies
DROP POLICY IF EXISTS "typing_status_read" ON typing_status;
DROP POLICY IF EXISTS "typing_status_insert" ON typing_status;
DROP POLICY IF EXISTS "typing_status_delete" ON typing_status;

CREATE POLICY "typing_status_read"
  ON typing_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "typing_status_insert"
  ON typing_status FOR INSERT
  TO authenticated
  WITH CHECK (
    username = (SELECT username FROM users WHERE id = auth.uid())
  );

CREATE POLICY "typing_status_delete"
  ON typing_status FOR DELETE
  TO authenticated
  USING (
    username = (SELECT username FROM users WHERE id = auth.uid())
  );