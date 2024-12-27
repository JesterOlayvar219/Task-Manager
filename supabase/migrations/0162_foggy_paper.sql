-- Drop existing policies
DROP POLICY IF EXISTS "resources_select" ON resources;
DROP POLICY IF EXISTS "resources_insert" ON resources;
DROP POLICY IF EXISTS "resources_update" ON resources;
DROP POLICY IF EXISTS "resources_delete" ON resources;

-- Create improved RLS policies
CREATE POLICY "resources_select"
  ON resources FOR SELECT
  TO authenticated
  USING (
    'Everyone' = ANY(access_users) OR
    (SELECT username FROM users WHERE id = auth.uid()) = ANY(access_users)
  );

CREATE POLICY "resources_insert"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "resources_update"
  ON resources FOR UPDATE
  TO authenticated
  USING (
    (SELECT username FROM users WHERE id = auth.uid()) = ANY(access_users)
  );

CREATE POLICY "resources_delete"
  ON resources FOR DELETE
  TO authenticated
  USING (
    (SELECT username FROM users WHERE id = auth.uid()) = ANY(access_users)
  );

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_resources_access_users ON resources USING GIN(access_users);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at DESC);