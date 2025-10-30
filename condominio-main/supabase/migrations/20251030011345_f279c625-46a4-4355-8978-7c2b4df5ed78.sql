-- Drop old function CASCADE (this will drop dependent policies)
DROP FUNCTION IF EXISTS public.get_user_role(uuid) CASCADE;

-- Create app_role enum if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('resident', 'admin', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.check_user_has_role(
  _user_id UUID,
  _role public.app_role
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Function to get user's highest role level
CREATE OR REPLACE FUNCTION public.get_user_role_level(_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    MAX(
      CASE role
        WHEN 'super_admin' THEN 3
        WHEN 'admin' THEN 2
        WHEN 'resident' THEN 1
        ELSE 0
      END
    ),
    0
  )
  FROM public.user_roles
  WHERE user_id = _user_id;
$$;

-- Function to check if user has minimum role level
CREATE OR REPLACE FUNCTION public.user_has_minimum_role(
  _user_id UUID,
  _min_role public.app_role
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT get_user_role_level(_user_id) >= 
    CASE _min_role
      WHEN 'super_admin' THEN 3
      WHEN 'admin' THEN 2
      WHEN 'resident' THEN 1
      ELSE 0
    END;
$$;

-- Recreate get_user_role function to return app_role and use user_roles table
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = user_uuid
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 3
      WHEN 'admin' THEN 2
      WHEN 'resident' THEN 1
      ELSE 0
    END DESC
  LIMIT 1;
$function$;

-- Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
  user_id,
  CASE 
    WHEN role::text = 'admin' THEN 'admin'::public.app_role
    WHEN role::text = 'super_admin' THEN 'super_admin'::public.app_role
    ELSE 'resident'::public.app_role
  END as role
FROM public.profiles
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_has_minimum_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (user_has_minimum_role(auth.uid(), 'admin'))
WITH CHECK (user_has_minimum_role(auth.uid(), 'admin'));

-- Recreate RLS Policies for profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_has_minimum_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_has_minimum_role(auth.uid(), 'admin'));

-- Recreate RLS Policies for reservations
CREATE POLICY "Admins can update all reservations"
ON public.reservations
FOR UPDATE
TO authenticated
USING (user_has_minimum_role(auth.uid(), 'admin'));

-- Recreate RLS Policies for documents
CREATE POLICY "Admins can manage all documents"
ON public.documents
FOR ALL
TO authenticated
USING (user_has_minimum_role(auth.uid(), 'admin'));

-- Recreate RLS Policies for notices
CREATE POLICY "Admins can manage all notices"
ON public.notices
FOR ALL
TO authenticated
USING (user_has_minimum_role(auth.uid(), 'admin'));

-- Recreate RLS Policies for condominium_settings
CREATE POLICY "Admins can manage all settings"
ON public.condominium_settings
FOR ALL
TO authenticated
USING (user_has_minimum_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can view condominium settings"
ON public.condominium_settings
FOR SELECT
TO authenticated
USING (user_has_minimum_role(auth.uid(), 'admin'));

-- Mark profiles.role as deprecated
COMMENT ON COLUMN public.profiles.role IS 'DEPRECATED: Use user_roles table instead. Kept for backward compatibility only.';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);