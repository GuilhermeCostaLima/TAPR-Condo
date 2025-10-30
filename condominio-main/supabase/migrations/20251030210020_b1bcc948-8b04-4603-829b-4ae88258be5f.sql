-- Fix security issues

-- 1. Remove public access to service_registry
DROP POLICY IF EXISTS "Service registry is viewable by everyone" ON public.service_registry;

-- Service registry should only be viewable by admins
CREATE POLICY "Only admins can view service registry"
ON public.service_registry
FOR SELECT
TO authenticated
USING (
  public.check_user_has_role(auth.uid(), 'admin'::app_role) OR 
  public.check_user_has_role(auth.uid(), 'super_admin'::app_role)
);