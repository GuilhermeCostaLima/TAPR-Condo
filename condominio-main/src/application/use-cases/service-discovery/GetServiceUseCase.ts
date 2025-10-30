import { IServiceDiscoveryRepository } from '@/domain/repositories/IServiceDiscoveryRepository';
import { Service } from '@/domain/entities/Service.entity';

export class GetServiceUseCase {
  constructor(private serviceDiscoveryRepository: IServiceDiscoveryRepository) {}

  async execute(serviceName: string): Promise<Service | null> {
    return this.serviceDiscoveryRepository.getService(serviceName);
  }
}