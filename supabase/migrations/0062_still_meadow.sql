-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'displayName', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'developer'),
    NEW.created_at,
    NEW.last_sign_in_at
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create function to sync user profile updates
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

-- Create trigger for profile updates
DROP TRIGGER IF EXISTS on_user_profile_updated ON public.users;
CREATE TRIGGER on_user_profile_updated
  AFTER UPDATE ON public.users
  FOR EACH ROW
  WHEN (
    NEW.username IS DISTINCT FROM OLD.username OR
    NEW."displayName" IS DISTINCT FROM OLD."displayName" OR
    NEW.role IS DISTINCT FROM OLD.role
  )
  EXECUTE FUNCTION sync_user_profile();

-- Update existing users with auth data
DO $$
BEGIN
  UPDATE public.users u
  SET 
    "displayName" = COALESCE(
      (SELECT raw_user_meta_data->>'displayName' FROM auth.users WHERE id = u.id::uuid),
      u.username
    ),
    username = COALESCE(
      (SELECT raw_user_meta_data->>'username' FROM auth.users WHERE id = u.id::uuid),
      u.username
    ),
    role = COALESCE(
      (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = u.id::uuid),
      u.role
    )
  WHERE EXISTS (
    SELECT 1 FROM auth.users WHERE id = u.id::uuid
  );
END $$;