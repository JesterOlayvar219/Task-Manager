-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_profile_updated ON public.users;

-- Create improved function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  display_name TEXT;
  username TEXT;
BEGIN
  -- Get username and display name from metadata or email
  username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  display_name := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );

  -- Insert into public.users table
  INSERT INTO public.users (
    id,
    username,
    "displayName",
    role,
    created_at,
    last_active
  ) VALUES (
    NEW.id,
    username,
    display_name,
    COALESCE(NEW.raw_user_meta_data->>'role', 'developer'),
    NEW.created_at,
    NEW.last_sign_in_at
  );

  -- Update auth metadata to ensure it's in sync
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'username', username,
    'displayName', display_name,
    'role', COALESCE(NEW.raw_user_meta_data->>'role', 'developer')
  )
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create improved function to sync profile updates
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Update auth.users metadata
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'username', NEW.username,
    'displayName', NEW."displayName",
    'role', NEW.role
  )
  WHERE id = NEW.id::uuid;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create trigger for profile updates
CREATE TRIGGER on_user_profile_updated
  AFTER UPDATE ON public.users
  FOR EACH ROW
  WHEN (
    NEW.username IS DISTINCT FROM OLD.username OR
    NEW."displayName" IS DISTINCT FROM OLD."displayName" OR
    NEW.role IS DISTINCT FROM OLD.role
  )
  EXECUTE FUNCTION sync_user_profile();

-- Update existing users to ensure consistency
UPDATE public.users u
SET "displayName" = username
WHERE "displayName" IS NULL;

-- Add NOT NULL constraint if not exists
ALTER TABLE public.users
  ALTER COLUMN "displayName" SET NOT NULL;