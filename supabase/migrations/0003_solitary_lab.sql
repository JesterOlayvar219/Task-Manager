/*
  # Fix Column Names and Add Missing Columns

  1. Changes
    - Rename accessUsers to access_users in resources table
    - Add missing columns and constraints
  
  2. Security
    - Update policies to use new column names
*/

-- Fix resources table
ALTER TABLE resources 
  DROP COLUMN IF EXISTS accessUsers,
  ADD COLUMN IF NOT EXISTS access_users TEXT[] NOT NULL DEFAULT ARRAY['Everyone'],
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT;

-- Update policies to use new column names
DROP POLICY IF EXISTS "Enable read access for resources" ON resources;
CREATE POLICY "Enable read access for resources"
  ON resources FOR SELECT
  TO authenticated
  USING (
    'Everyone' = ANY(access_users) OR
    auth.uid()::text = ANY(access_users)
  );

DROP POLICY IF EXISTS "Enable update access for resources" ON resources;
CREATE POLICY "Enable update access for resources"
  ON resources FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = ANY(access_users));

DROP POLICY IF EXISTS "Enable delete access for resources" ON resources;
CREATE POLICY "Enable delete access for resources"
  ON resources FOR DELETE
  TO authenticated
  USING (auth.uid()::text = ANY(access_users));