-- Drop existing trigger and function
DROP TRIGGER IF EXISTS cleanup_old_typing_status ON typing_status;
DROP FUNCTION IF EXISTS cleanup_typing_status();

-- Create improved cleanup function
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

-- Add delete policy
CREATE POLICY "typing_status_delete_policy"
  ON typing_status FOR DELETE
  TO authenticated
  USING (true);