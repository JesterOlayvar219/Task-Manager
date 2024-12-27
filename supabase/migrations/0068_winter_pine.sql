-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_profile_updated ON public.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS sync_user_profile();

-- Create improved function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_val TEXT;
  display_name_val TEXT;
  role_val TEXT;
BEGIN
  -- Get values from metadata or defaults
  username_val := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  display_name_val := COALESCE(
    NEW.raw_user_meta_data->>'displayName',
    username_val
  );

  role_val := COALESCE(
    NEW.raw_user_meta_data->>'role',
    'developer'
  );

  -- First check if user already exists
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    -- Update existing user
    UPDATE public.users
    SET
      username = username_val,
      "displayName" = display_name_val,
      role = role_val,
      last_active = NEW.last_sign_in_at
    WHERE id = NEW.id;
  ELSE
    -- Insert new user
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
      role_val,
      NEW.created_at,
      NEW.last_sign_in_at
    );
  END IF;

  -- Update auth metadata
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'username', username_val,
    'displayName', display_name_val,
    'role', role_val
  )
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create improved function to sync profile updates
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if relevant fields changed
  IF (NEW.username IS DISTINCT FROM OLD.username) OR
     (NEW."displayName" IS DISTINCT FROM OLD."displayName") OR
     (NEW.role IS DISTINCT FROM OLD.role) THEN
    
    -- Update auth.users metadata
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_build_object(
      'username', NEW.username,
      'displayName', NEW."displayName",
      'role', NEW.role
    )
    WHERE id = NEW.id::uuid;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER on_user_profile_updated
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_profile();

-- Clean up any duplicate users
DELETE FROM public.users a
WHERE a.ctid <> (
  SELECT min(b.ctid)
  FROM public.users b 
  WHERE a.id = b.id
);

-- Ensure proper constraints
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_pkey,
  ADD PRIMARY KEY (id);

-- Update existing users to ensure consistency
UPDATE auth.users au
SET raw_user_meta_data = jsonb_build_object(
  'username', u.username,
  'displayName', u."displayName",
  'role', u.role
)
FROM public.users u
WHERE au.id = u.id::uuid;