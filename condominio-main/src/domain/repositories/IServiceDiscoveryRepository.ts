import { Service, ServiceStatus } from '../entities/Service.entity';

export interface IServiceDiscoveryRepository {
  registerService(serviceName: string, serviceUrl: string, metadata?: Record<string, any>): Promise<Service>;
  getService(serviceName: string): Promise<Service | null>;
  getAllServices(): Promise<Service[]>;
  sendHeartbeat(serviceName: string, status?: ServiceStatus): Promise<void>;
  deregisterService(serviceName: string): Promise<void>;
}