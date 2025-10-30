-- Create RLS policies for reservations table

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can insert their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can insert any reservation" ON public.reservations;
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can update any reservation" ON public.reservations;
DROP POLICY IF EXISTS "Users can update their own pending reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can update all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can delete their own pending reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can delete any reservation" ON public.reservations;
DROP POLICY IF EXISTS "Users can create their own reservations" ON public.reservations;

-- Enable RLS if not already enabled
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- INSERT policies
CREATE POLICY "Users can insert their own reservations"
ON public.reservations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can insert any reservation"
ON public.reservations
FOR INSERT
TO authenticated
WITH CHECK (
  public.check_user_has_role(auth.uid(), 'admin'::app_role) OR 
  public.check_user_has_role(auth.uid(), 'super_admin'::app_role)
);

-- SELECT policies
CREATE POLICY "Users can view their own reservations"
ON public.reservations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reservations"
ON public.reservations
FOR SELECT
TO authenticated
USING (
  public.check_user_has_role(auth.uid(), 'admin'::app_role) OR 
  public.check_user_has_role(auth.uid(), 'super_admin'::app_role)
);

-- UPDATE policies
CREATE POLICY "Users can update their own pending reservations"
ON public.reservations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any reservation"
ON public.reservations
FOR UPDATE
TO authenticated
USING (
  public.check_user_has_role(auth.uid(), 'admin'::app_role) OR 
  public.check_user_has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  public.check_user_has_role(auth.uid(), 'admin'::app_role) OR 
  public.check_user_has_role(auth.uid(), 'super_admin'::app_role)
);

-- DELETE policies
CREATE POLICY "Users can delete their own pending reservations"
ON public.reservations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can delete any reservation"
ON public.reservations
FOR DELETE
TO authenticated
USING (
  public.check_user_has_role(auth.uid(), 'admin'::app_role) OR 
  public.check_user_has_role(auth.uid(), 'super_admin'::app_role)
);