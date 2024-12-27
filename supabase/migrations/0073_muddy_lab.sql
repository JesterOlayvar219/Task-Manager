-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_profile_updated ON public.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS sync_user_profile();
DROP FUNCTION IF EXISTS generate_unique_username();

-- Create function to generate unique username
CREATE OR REPLACE FUNCTION generate_unique_username(base_username TEXT)
RETURNS TEXT AS $$
DECLARE
  new_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Start with base username, limited to 20 chars
  new_username := substr(regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g'), 1, 20);
  
  -- Keep trying until we find a unique username
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = new_username) LOOP
    counter := counter + 1;
    new_username := substr(new_username, 1, 17) || counter;
  END LOOP;
  
  RETURN new_username;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_val TEXT;
  display_name_val TEXT;
BEGIN
  -- Generate username from email
  username_val := generate_unique_username(split_part(NEW.email, '@', 1));
  
  -- Set display name from metadata or username
  display_name_val := COALESCE(
    NEW.raw_user_meta_data->>'displayName',
    NEW.raw_user_meta_data->>'username',
    username_val
  );

  -- First update auth metadata
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
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to sync profile updates
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

-- Update existing users to ensure consistency
UPDATE auth.users au
SET raw_user_meta_data = jsonb_build_object(
  'username', u.username,
  'displayName', u."displayName",
  'role', u.role
)
FROM public.users u
WHERE au.id = u.id::uuid;