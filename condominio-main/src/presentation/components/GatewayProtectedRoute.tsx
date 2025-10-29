import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useGateway } from '@/presentation/hooks/useGateway';
import { Skeleton } from '@/presentation/components/ui/skeleton';

interface GatewayProtectedRouteProps {
  children: ReactNode;
  fallbackPath?: string;
}

/**
 * Route protection component using gateway validation
 * Similar to Spring Security's authorization filter but for React Router
 */
export function GatewayProtectedRoute({ 
  children, 
  fallbackPath = '/auth' 
}: GatewayProtectedRouteProps) {
  const { isAuthorized, isLoading, error, requiredRole, userRole } = useGateway();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    console.warn('Gateway: Access denied', {
      error,
      requiredRole,
      userRole,
    });
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
