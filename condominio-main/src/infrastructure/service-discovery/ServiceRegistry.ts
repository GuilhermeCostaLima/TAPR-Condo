import { supabase } from '@/integrations/supabase/client';

/**
 * Service Registry - Integração frontend com Service Discovery
 * 
 * Implementa o padrão Service Discovery permitindo que microserviços
 * se registrem e descubram outros serviços dinamicamente.
 * Similar ao Netflix Eureka, mas adaptado para Supabase Edge Functions.
 */
export class ServiceRegistry {
  private static readonly DISCOVERY_FUNCTION = 'service-discovery';
  private static serviceCache: Map<string, { url: string; timestamp: number }> = new Map();
  private static readonly CACHE_TTL = 60000; // Cache de 1 minuto para reduzir chamadas

  /**
   * Registra um serviço no servidor de descoberta
   * Necessário para que outros serviços possam encontrá-lo
   */
  static async registerService(
    serviceName: string,
    serviceUrl: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Precisa estar autenticado para registrar serviços
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return { success: false, error: 'Sem sessão ativa' };
      }

      const { data, error } = await supabase.functions.invoke(
        this.DISCOVERY_FUNCTION,
        {
          method: 'POST',
          body: {
            service_name: serviceName,
            service_url: serviceUrl,
            status: 'UP',
            metadata: metadata || {},
            path: 'register'
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) {
        console.error('Service registration error:', error);
        return { success: false, error: error.message };
      }

      console.log(`Service ${serviceName} registered successfully`);
      return { success: true };
    } catch (error) {
      console.error('Service registry error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Descobre um serviço pelo nome
   * Usa cache para melhorar performance e reduzir chamadas ao servidor
   */
  static async discoverService(serviceName: string): Promise<{
    url: string | null;
    error?: string;
  }> {
    try {
      // Verifica cache primeiro - evita chamadas desnecessárias
      const cached = this.serviceCache.get(serviceName);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return { url: cached.url };
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return { url: null, error: 'No active session' };
      }

      const { data, error } = await supabase.functions.invoke(
        this.DISCOVERY_FUNCTION,
        {
          body: { service: serviceName },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error || !data?.service) {
        console.error(`Service ${serviceName} not found:`, error);
        return { url: null, error: error?.message || 'Service not found' };
      }

      // Salva no cache para próximas consultas
      this.serviceCache.set(serviceName, {
        url: data.service.service_url,
        timestamp: Date.now()
      });

      return { url: data.service.service_url };
    } catch (error) {
      console.error('Service discovery error:', error);
      return {
        url: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Busca todos os serviços registrados
   */
  static async getAllServices(): Promise<{
    services: any[];
    error?: string;
  }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return { services: [], error: 'No active session' };
      }

      const { data, error } = await supabase.functions.invoke(
        this.DISCOVERY_FUNCTION,
        {
          method: 'GET',
          body: { path: 'apps' },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) {
        console.error('Failed to fetch services:', error);
        return { services: [], error: error.message };
      }

      return { services: data?.applications?.application || [] };
    } catch (error) {
      console.error('Service registry error:', error);
      return {
        services: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Envia heartbeat para manter o serviço vivo
   * Deve ser chamado periodicamente (ex: a cada 30 segundos)
   */
  static async sendHeartbeat(
    serviceName: string,
    status: 'UP' | 'DOWN' | 'STARTING' | 'OUT_OF_SERVICE' = 'UP'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return { success: false, error: 'No active session' };
      }

      // Invoca a edge function com método PUT
      const { data, error } = await supabase.functions.invoke(
        this.DISCOVERY_FUNCTION,
        {
          method: 'PUT',
          body: {
            service_name: serviceName,
            status,
            path: 'heartbeat'
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) {
        console.error('Heartbeat error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Heartbeat error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Limpa o cache de serviços
   */
  static clearCache() {
    this.serviceCache.clear();
  }
}
