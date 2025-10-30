import { supabase } from '@/integrations/supabase/client';
import { IServiceDiscoveryRepository } from '@/domain/repositories/IServiceDiscoveryRepository';
import { Service, ServiceStatus } from '@/domain/entities/Service.entity';

export class SupabaseServiceDiscoveryRepository implements IServiceDiscoveryRepository {
  private readonly edgeFunctionUrl = 'https://syhwqrkxebtngmzorghy.supabase.co/functions/v1/service-discovery';

  async registerService(
    serviceName: string, 
    serviceUrl: string, 
    metadata?: Record<string, any>
  ): Promise<Service> {
    const { data, error } = await supabase.functions.invoke('service-discovery/register', {
      body: {
        service_name: serviceName,
        service_url: serviceUrl,
        status: 'UP' as ServiceStatus,
        metadata: metadata || {},
      },
    });

    if (error) throw error;
    return data.service;
  }

  async getService(serviceName: string): Promise<Service | null> {
    const { data, error } = await supabase.functions.invoke(`service-discovery?service=${serviceName}`);

    if (error) return null;
    return data.service;
  }

  async getAllServices(): Promise<Service[]> {
    const { data, error } = await supabase.functions.invoke('service-discovery/apps');

    if (error) throw error;
    
    // Convert Eureka format to our format
    return data.applications.application.map((app: any) => ({
      id: app.instance[0].instanceId,
      service_name: app.name,
      service_url: app.instance[0].ipAddr,
      status: app.instance[0].status,
      metadata: app.instance[0].metadata,
      last_heartbeat: new Date(app.instance[0].lastUpdatedTimestamp).toISOString(),
      created_at: new Date(app.instance[0].lastDirtyTimestamp).toISOString(),
      updated_at: new Date(app.instance[0].lastUpdatedTimestamp).toISOString(),
    }));
  }

  async sendHeartbeat(serviceName: string, status?: ServiceStatus): Promise<void> {
    const { error } = await supabase.functions.invoke('service-discovery/heartbeat', {
      body: {
        service_name: serviceName,
        status: status || 'UP',
      },
    });

    if (error) throw error;
  }

  async deregisterService(serviceName: string): Promise<void> {
    const { error } = await supabase.functions.invoke(`service-discovery?service=${serviceName}`, {
      method: 'DELETE',
    });

    if (error) throw error;
  }
}