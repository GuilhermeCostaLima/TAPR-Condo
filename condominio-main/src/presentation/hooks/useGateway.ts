import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GatewayClient } from '@/infrastructure/gateway/GatewayClient';
import { useAuth } from '@/presentation/contexts/AuthContext';

/**
 * Hook for gateway-based route protection
 * Integrates with the gateway edge function for authorization
 */
export function useGateway() {
  const location = useLocation();
  const { user } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [requiredRole, setRequiredRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!user) {
        setIsAuthorized(false);
        setError('Not authenticated');
        return;
      }

      const result = await GatewayClient.validateAccess(location.pathname);
      
      setIsAuthorized(result.authorized);
      setUserRole(result.user_role || null);
      setRequiredRole(result.required_role || null);
      setError(result.error || null);
    };

    checkAuthorization();
  }, [location.pathname, user]);

  return {
    isAuthorized,
    userRole,
    requiredRole,
    error,
    isLoading: isAuthorized === null,
  };
}
