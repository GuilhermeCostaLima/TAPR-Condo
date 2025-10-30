import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Headers CORS necessários para permitir requisições do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ServiceRegistration {
  service_name: string;
  service_url: string;
  status?: 'UP' | 'DOWN' | 'STARTING' | 'OUT_OF_SERVICE';
  metadata?: Record<string, any>;
}

interface HeartbeatRequest {
  service_name: string;
  status?: 'UP' | 'DOWN' | 'STARTING' | 'OUT_OF_SERVICE';
}

Deno.serve(async (req) => {
  // Tratamento de requisições preflight do CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Conecta ao Supabase usando credenciais de serviço (acesso total)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extrai o path da URL e do body para determinar a ação
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(p => p);
    const path = pathSegments[pathSegments.length - 1] || '';
    const body = req.method !== 'GET' ? await req.json().catch(() => ({})) : {};
    const requestPath = body.path || path;

    console.log(`Service Discovery - Request: ${req.method} ${requestPath}`, body);

    // Endpoint: GET /apps - Retorna todos os serviços registrados
    if (req.method === 'GET' && requestPath === 'apps') {
      const { data: services, error } = await supabase
        .from('service_registry')
        .select('*')
        .order('service_name');

      if (error) {
        console.error('Error fetching services:', error);
        throw error;
      }

      console.log(`Found ${services?.length || 0} registered services`);
      // Formata resposta no padrão Eureka para compatibilidade
      return new Response(
        JSON.stringify({
          applications: {
            versions__delta: '1',
            apps__hashcode: '',
            application: services?.map(s => ({
              name: s.service_name,
              instance: [{
                instanceId: s.id,
                hostName: new URL(s.service_url).hostname,
                app: s.service_name,
                ipAddr: s.service_url,
                status: s.status,
                port: { '$': parseInt(new URL(s.service_url).port || '80'), '@enabled': 'true' },
                lastUpdatedTimestamp: new Date(s.updated_at).getTime(),
                lastDirtyTimestamp: new Date(s.created_at).getTime(),
                metadata: s.metadata,
              }]
            })) || []
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Endpoint: GET /?service=nome - Busca serviço específico
    if (req.method === 'GET' && url.searchParams.has('service')) {
      const serviceName = url.searchParams.get('service')!;
      
      const { data: service, error } = await supabase
        .from('service_registry')
        .select('*')
        .eq('service_name', serviceName)
        .eq('status', 'UP')
        .single();

      if (error) {
        console.error(`Service ${serviceName} not found:`, error);
        return new Response(
          JSON.stringify({ error: 'Service not found or not available' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Service ${serviceName} found: ${service.service_url}`);

      return new Response(
        JSON.stringify({ service }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Endpoint: POST /register - Registra novo serviço
    if (req.method === 'POST' && requestPath === 'register') {
      const registration: ServiceRegistration = body;
      
      if (!registration.service_name || !registration.service_url) {
        return new Response(
          JSON.stringify({ error: 'service_name and service_url are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`Registrando serviço: ${registration.service_name}`);

      // Upsert para atualizar se já existir, inserir se novo
      const { data, error } = await supabase
        .from('service_registry')
        .upsert({
          service_name: registration.service_name,
          service_url: registration.service_url,
          status: registration.status || 'UP',
          metadata: registration.metadata || {},
          last_heartbeat: new Date().toISOString(),
        }, {
          onConflict: 'service_name'
        })
        .select()
        .single();

      if (error) {
        console.error('Error registering service:', error);
        throw error;
      }

      console.log(`Service ${registration.service_name} registered successfully`);

      return new Response(
        JSON.stringify({ 
          message: 'Service registered successfully',
          service: data 
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Endpoint: PUT /heartbeat - Atualiza status do serviço
    if (req.method === 'PUT' && requestPath === 'heartbeat') {
      const heartbeat: HeartbeatRequest = body;
      
      if (!heartbeat.service_name) {
        return new Response(
          JSON.stringify({ error: 'service_name is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`Heartbeat from service: ${heartbeat.service_name}`);

      const { error } = await supabase
        .from('service_registry')
        .update({
          last_heartbeat: new Date().toISOString(),
          status: heartbeat.status || 'UP',
        })
        .eq('service_name', heartbeat.service_name);

      if (error) {
        console.error('Error updating heartbeat:', error);
        throw error;
      }

      console.log(`Heartbeat updated for ${heartbeat.service_name}`);

      return new Response(
        JSON.stringify({ message: 'Heartbeat received' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Endpoint: DELETE /?service=nome - Remove serviço do registro
    if (req.method === 'DELETE' && url.searchParams.has('service')) {
      const serviceName = url.searchParams.get('service')!;
      
      console.log(`Deregistering service: ${serviceName}`);

      const { error } = await supabase
        .from('service_registry')
        .delete()
        .eq('service_name', serviceName);

      if (error) {
        console.error('Error deregistering service:', error);
        throw error;
      }

      console.log(`Service ${serviceName} deregistered`);

      return new Response(
        JSON.stringify({ message: 'Service deregistered successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Service Discovery Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});