import { supabase } from '@/integrations/supabase/client';

/**
 * Gateway Client - Frontend integration with gateway edge function
 * Similar to Spring Cloud Gateway but adapted for Supabase Edge Functions
 */
export class GatewayClient {
  private static readonly GATEWAY_FUNCTION = 'gateway';

  /**
   * Validates if user has access to a specific route
   * Similar to AuthorizationFilter.filter() from gateway-service
   */
  static async validateAccess(path: string): Promise<{
    authorized: boolean;
    user_role?: string;
    required_role?: string;
    error?: string;
  }> {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return {
          authorized: false,
          error: 'No active session',
        };
      }

      // Call gateway edge function
      const { data, error } = await supabase.functions.invoke(this.GATEWAY_FUNCTION, {
        body: { path },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Gateway validation error:', error);
        return {
          authorized: false,
          error: error.message,
        };
      }

      return {
        authorized: data.authorized || false,
        user_role: data.user_role,
        required_role: data.required_role,
      };
    } catch (error) {
      console.error('Gateway client error:', error);
      return {
        authorized: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Proxy request through gateway with role validation
   */
  static async proxyRequest(
    path: string,
    method: string = 'GET',
    body?: any
  ): Promise<Response> {
    const validation = await this.validateAccess(path);

    if (!validation.authorized) {
      throw new Error(validation.error || 'Access denied');
    }

    // If authorized, proceed with the actual request
    // This is where you would route to different services/endpoints
    return new Response(
      JSON.stringify({
        message: 'Request authorized',
        ...validation,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
