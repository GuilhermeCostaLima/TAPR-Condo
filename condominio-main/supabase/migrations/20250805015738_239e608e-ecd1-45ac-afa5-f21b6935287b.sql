-- Create documents table for file management
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  uploaded_by UUID NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notices table for announcements
CREATE TABLE public.notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'normal',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create condominium_settings table for system configuration
CREATE TABLE public.condominium_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  setting_type TEXT NOT NULL DEFAULT 'string',
  description TEXT,
  updated_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condominium_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents
CREATE POLICY "Admins can manage all documents" 
ON public.documents 
FOR ALL
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Users can view public documents" 
ON public.documents 
FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can view their own documents" 
ON public.documents 
FOR SELECT
USING (uploaded_by = auth.uid());

-- RLS Policies for notices
CREATE POLICY "Admins can manage all notices" 
ON public.notices 
FOR ALL
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Users can view active notices" 
ON public.notices 
FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- RLS Policies for settings
CREATE POLICY "Admins can manage all settings" 
ON public.condominium_settings 
FOR ALL
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Users can view public settings" 
ON public.condominium_settings 
FOR SELECT
USING (setting_key NOT LIKE 'admin_%');

-- Create triggers for updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notices_updated_at
  BEFORE UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_condominium_settings_updated_at
  BEFORE UPDATE ON public.condominium_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.condominium_settings (setting_key, setting_value, setting_type, description, updated_by) VALUES
('condominium_name', '"Meu Condomínio"', 'string', 'Nome do condomínio', '00000000-0000-0000-0000-000000000000'),
('address', '"Endereço não configurado"', 'string', 'Endereço completo do condomínio', '00000000-0000-0000-0000-000000000000'),
('admin_email', '"admin@condominio.com"', 'string', 'Email do administrador', '00000000-0000-0000-0000-000000000000'),
('reservation_time_slots', '["08:00-12:00", "12:00-16:00", "16:00-20:00", "20:00-00:00"]', 'json', 'Horários disponíveis para reserva', '00000000-0000-0000-0000-000000000000'),
('max_reservations_per_month', '4', 'number', 'Máximo de reservas por mês por morador', '00000000-0000-0000-0000-000000000000'),
('reservation_advance_days', '30', 'number', 'Dias de antecedência para fazer reserva', '00000000-0000-0000-0000-000000000000');