export type ServiceStatus = 'UP' | 'DOWN' | 'STARTING' | 'OUT_OF_SERVICE';

export interface Service {
  id: string;
  service_name: string;
  service_url: string;
  status: ServiceStatus;
  metadata: Record<string, any>;
  last_heartbeat: string;
  created_at: string;
  updated_at: string;
}