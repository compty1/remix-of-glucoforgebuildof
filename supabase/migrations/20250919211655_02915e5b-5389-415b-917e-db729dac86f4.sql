-- Insert the superadmin user into user_roles table
-- First, we need to get the user_id for shanealecompte@gmail.com from auth.users
-- Since we can't directly reference auth.users in our migration, we'll create a function to handle this

-- Create a function to safely add admin role to a user by email
CREATE OR REPLACE FUNCTION public.add_admin_by_email(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Get the user_id from auth.users (this requires SECURITY DEFINER)
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    -- If user exists, insert admin role
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END;
$$;

-- Add shanealecompte@gmail.com as admin
SELECT public.add_admin_by_email('shanealecompte@gmail.com');