-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_profile_updated ON public.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS sync_user_profile();

-- Create function to generate unique username
CREATE OR REPLACE FUNCTION generate_unique_username(base_username TEXT)
RETURNS TEXT AS $$
DECLARE
  new_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Start with base username
  new_username := base_username;
  
  -- Keep trying until we find a unique username
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = new_username) LOOP
    counter := counter + 1;
    new_username := base_username || counter;
  END LOOP;
  
  RETURN new_username;
END;
$$ LANGUAGE plpgsql;

-- Create improved function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  username_val TEXT;
  display_name_val TEXT;
  role_val TEXT;
BEGIN
  -- Get base username from email or metadata
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  -- Generate unique username
  username_val := generate_unique_username(base_username);
  
  -- Set display name
  display_name_val := COALESCE(
    NEW.raw_user_meta_data->>'displayName',
    username_val
  );

  -- Set role
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

-- Ensure proper constraints
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_pkey,
  ADD PRIMARY KEY (id);

-- Add unique constraint on username
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_username_key,
  ADD CONSTRAINT users_username_key UNIQUE (username);

-- Update existing users to ensure consistency
UPDATE auth.users au
SET raw_user_meta_data = jsonb_build_object(
  'username', u.username,
  'displayName', u."displayName",
  'role', u.role
)
FROM public.users u
WHERE au.id = u.id::uuid;