import { useEffect } from 'react';
import { ServiceRegistry } from '@/infrastructure/service-discovery/ServiceRegistry';

/**
 * Hook para inicializar Service Discovery
 * 
 * Registra automaticamente o frontend como um serviço e
 * mantém heartbeat periódico para indicar que está ativo
 */
export function useServiceDiscoveryInit() {
  useEffect(() => {
    let heartbeatInterval: NodeJS.Timeout;

    const initializeServiceDiscovery = async () => {
      try {
        // Registra o frontend como um serviço disponível
        const frontendUrl = window.location.origin;
        const { success, error } = await ServiceRegistry.registerService(
          'frontend-app',
          frontendUrl,
          {
            environment: import.meta.env.MODE,
            version: '1.0.0',
            features: ['reservations', 'documents', 'notices', 'residents']
          }
        );

        if (success) {
          console.log('[Service Discovery] Frontend registrado com sucesso');

          // Configura heartbeat a cada 30 segundos para manter o serviço ativo
          heartbeatInterval = setInterval(async () => {
            const { success: heartbeatSuccess } = await ServiceRegistry.sendHeartbeat(
              'frontend-app',
              'UP'
            );

            if (heartbeatSuccess) {
              console.log('[Service Discovery] Heartbeat sent');
            }
          }, 30000);
        } else {
          console.warn('[Service Discovery] Failed to register service:', error);
        }
      } catch (error) {
        console.error('[Service Discovery] Initialization error:', error);
      }
    };

    // Inicializa o service discovery quando o componente é montado
    initializeServiceDiscovery();

    // Cleanup quando o componente é desmontado
    return () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
    };
  }, []);
}
