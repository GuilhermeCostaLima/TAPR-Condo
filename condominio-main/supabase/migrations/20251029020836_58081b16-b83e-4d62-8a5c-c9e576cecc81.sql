-- Create service_registry table for service discovery
CREATE TABLE IF NOT EXISTS public.service_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL UNIQUE,
  service_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'UP' CHECK (status IN ('UP', 'DOWN', 'STARTING', 'OUT_OF_SERVICE')),
  metadata JSONB DEFAULT '{}'::jsonb,
  last_heartbeat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_registry ENABLE ROW LEVEL SECURITY;

-- Allow public read access to service registry (for service discovery)
CREATE POLICY "Service registry is viewable by everyone"
ON public.service_registry
FOR SELECT
USING (true);

-- Only authenticated admins can register/update services
CREATE POLICY "Only admins can manage service registry"
ON public.service_registry
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create index for faster lookups
CREATE INDEX idx_service_registry_name ON public.service_registry(service_name);
CREATE INDEX idx_service_registry_status ON public.service_registry(status);

-- Add trigger for updated_at
CREATE TRIGGER update_service_registry_updated_at
BEFORE UPDATE ON public.service_registry
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();