import { useState, useEffect, useCallback } from 'react';
import { Service, ServiceStatus } from '@/domain/entities/Service.entity';
import { SupabaseServiceDiscoveryRepository } from '@/infrastructure/repositories/supabase/SupabaseServiceDiscoveryRepository';
import { RegisterServiceUseCase } from '@/application/use-cases/service-discovery/RegisterServiceUseCase';
import { GetServiceUseCase } from '@/application/use-cases/service-discovery/GetServiceUseCase';

const serviceDiscoveryRepo = new SupabaseServiceDiscoveryRepository();
const registerServiceUseCase = new RegisterServiceUseCase(serviceDiscoveryRepo);
const getServiceUseCase = new GetServiceUseCase(serviceDiscoveryRepo);

export const useServiceDiscovery = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const registerService = useCallback(async (
    serviceName: string,
    serviceUrl: string,
    metadata?: Record<string, any>
  ) => {
    try {
      setLoading(true);
      const service = await registerServiceUseCase.execute(serviceName, serviceUrl, metadata);
      return service;
    } catch (error) {
      console.error('Failed to register service:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const discoverService = useCallback(async (serviceName: string) => {
    try {
      setLoading(true);
      const service = await getServiceUseCase.execute(serviceName);
      return service;
    } catch (error) {
      console.error('Failed to discover service:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendHeartbeat = useCallback(async (serviceName: string, status?: ServiceStatus) => {
    try {
      await serviceDiscoveryRepo.sendHeartbeat(serviceName, status);
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
      throw error;
    }
  }, []);

  const getAllServices = useCallback(async () => {
    try {
      setLoading(true);
      const allServices = await serviceDiscoveryRepo.getAllServices();
      setServices(allServices);
      return allServices;
    } catch (error) {
      console.error('Failed to get services:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    services,
    loading,
    registerService,
    discoverService,
    sendHeartbeat,
    getAllServices,
  };
};