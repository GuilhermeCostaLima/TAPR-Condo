-- Fix the handle_new_user function to properly reference the user_role type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, apartment_number, role, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'apartment_number',
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'role' = 'admin' THEN 'admin'::public.user_role
      ELSE 'resident'::public.user_role
    END,
    NEW.raw_user_meta_data ->> 'display_name'
  );
  RETURN NEW;
END;
$$;