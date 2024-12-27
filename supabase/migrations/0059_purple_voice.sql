/*
  # Fix User Creation Process

  1. Updates
    - Add trigger to handle user creation/updates
    - Ensure display_name is set from username
    - Add validation for required fields

  2. Security
    - Maintain existing RLS policies
    - Add validation constraints
*/

-- Create function to handle user creation/updates
CREATE OR REPLACE FUNCTION handle_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Set display_name to username if not provided
  IF NEW.display_name IS NULL THEN
    NEW.display_name := NEW.username;
  END IF;

  -- Ensure required fields
  IF NEW.username IS NULL THEN
    RAISE EXCEPTION 'Username is required';
  END IF;

  IF NEW.role IS NULL THEN
    RAISE EXCEPTION 'Role is required';
  END IF;

  -- Set timestamps if not provided
  IF NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;

  IF NEW.last_active IS NULL THEN
    NEW.last_active := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user profile management
DROP TRIGGER IF EXISTS manage_user_profile ON users;
CREATE TRIGGER manage_user_profile
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_profile();

-- Add validation constraints
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_username_check,
  ADD CONSTRAINT users_username_check CHECK (char_length(username) >= 3),
  DROP CONSTRAINT IF EXISTS users_role_check,
  ADD CONSTRAINT users_role_check CHECK (role IN (
    'admin', 'developer', 'researcher', 'media_buyer',
    'copywriter', 'designer', 'sales', 'accounting'
  ));

-- Update existing users to ensure consistency
UPDATE users
SET 
  display_name = username,
  last_active = COALESCE(last_active, created_at, NOW())
WHERE display_name IS NULL OR last_active IS NULL;