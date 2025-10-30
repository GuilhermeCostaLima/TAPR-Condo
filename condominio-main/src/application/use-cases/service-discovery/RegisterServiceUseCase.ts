import { IServiceDiscoveryRepository } from '@/domain/repositories/IServiceDiscoveryRepository';
import { Service } from '@/domain/entities/Service.entity';

export class RegisterServiceUseCase {
  constructor(private serviceDiscoveryRepository: IServiceDiscoveryRepository) {}

  async execute(serviceName: string, serviceUrl: string, metadata?: Record<string, any>): Promise<Service> {
    return this.serviceDiscoveryRepository.registerService(serviceName, serviceUrl, metadata);
  }
}