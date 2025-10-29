import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Role hierarchy similar to gateway-service RoleType.java
enum RoleType {
  RESIDENT = 1,
  SYNDICATE = 2,
  MANAGER = 3,
  ADMIN = 4,
}

type UserRole = 'resident' | 'syndicate' | 'manager' | 'admin';

// Route protection map (similar to AuthorizationFilter.routeRole)
const routeRoleMap: Record<string, UserRole> = {
  '/admin': 'admin',
  '/settings': 'manager',
  '/residents': 'syndicate',
  '/reservations': 'resident',
  '/documents': 'resident',
  '/notices': 'resident',
};

const roleHierarchy: Record<UserRole, RoleType> = {
  resident: RoleType.RESIDENT,
  syndicate: RoleType.SYNDICATE,
  manager: RoleType.MANAGER,
  admin: RoleType.ADMIN,
};

function covers(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

function getRequiredRoleForPath(path: string): UserRole | null {
  for (const [route, role] of Object.entries(routeRoleMap)) {
    if (path.startsWith(route)) {
      return role;
    }
  }
  return null; // Public route
}

function unauthorized(message: string = 'Unauthorized') {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status: 401, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

function forbidden(message: string = 'Forbidden') {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status: 403, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path') || '/';

    console.log('Gateway: Checking authorization for path:', path);

    // Check if route requires protection
    const requiredRole = getRequiredRoleForPath(path);
    
    if (!requiredRole) {
      console.log('Gateway: Public route, allowing access');
      return new Response(
        JSON.stringify({ 
          authorized: true, 
          message: 'Public route',
          path 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify JWT token exists
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Gateway: Missing or invalid Authorization header');
      return unauthorized('Missing or invalid Authorization header');
    }

    const token = authHeader.substring(7);

    // Create Supabase client with the user's token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    );

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('Gateway: Invalid JWT token', authError);
      return unauthorized('Invalid JWT token');
    }

    console.log('Gateway: User authenticated:', user.id);

    // Get user roles from user_roles table
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('Gateway: Error fetching user roles:', rolesError);
      return new Response(
        JSON.stringify({ error: 'Error fetching user roles' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!userRoles || userRoles.length === 0) {
      console.log('Gateway: User has no roles assigned');
      return forbidden('User has no roles assigned');
    }

    // Get highest role (similar to getting max level)
    const highestRole = userRoles
      .map(r => r.role as UserRole)
      .reduce((highest, current) => {
        return roleHierarchy[current] > roleHierarchy[highest] ? current : highest;
      }, 'resident' as UserRole);

    console.log('Gateway: User role:', highestRole, 'Required role:', requiredRole);

    // Check if user role covers required role
    if (!covers(highestRole, requiredRole)) {
      console.log('Gateway: Insufficient permissions');
      return forbidden(`Insufficient permissions. Required: ${requiredRole}, User has: ${highestRole}`);
    }

    console.log('Gateway: Authorization successful');

    return new Response(
      JSON.stringify({ 
        authorized: true, 
        user_id: user.id,
        user_role: highestRole,
        required_role: requiredRole,
        path
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Gateway: Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});