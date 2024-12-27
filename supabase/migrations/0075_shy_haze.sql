-- Drop existing triggers first to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_profile_updated ON public.users;

-- Create improved function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_val TEXT;
  display_name_val TEXT;
BEGIN
  -- Get username from metadata or generate from email
  username_val := COALESCE(
    NEW.raw_user_meta_data->>'username',
    generate_unique_username(split_part(NEW.email, '@', 1))
  );
  
  -- Set display name from metadata or username
  display_name_val := COALESCE(
    NEW.raw_user_meta_data->>'displayName',
    username_val
  );

  -- First update auth metadata to ensure it's set
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'username', username_val,
    'displayName', display_name_val,
    'role', 'developer'
  )
  WHERE id = NEW.id;

  -- Then insert into public.users table
  INSERT INTO public.users (
    id,
    username,
    "displayName",
    role,
    created_at,
    last_active
  ) VALUES (
    NEW.id,
    username_val,
    display_name_val,
    'developer',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    "displayName" = EXCLUDED."displayName",
    last_active = CURRENT_TIMESTAMP;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers with SECURITY DEFINER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER on_user_profile_updated
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_profile();

-- Fix any existing users with missing metadata
UPDATE auth.users au
SET raw_user_meta_data = COALESCE(
  au.raw_user_meta_data,
  jsonb_build_object(
    'username', u.username,
    'displayName', u."displayName",
    'role', u.role
  )
)
FROM public.users u
WHERE au.id = u.id::uuid
AND (au.raw_user_meta_data IS NULL OR au.raw_user_meta_data = '{}'::jsonb);