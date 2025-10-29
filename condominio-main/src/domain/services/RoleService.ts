import { AppRole, UserRoleEntity } from '../entities/UserRole.entity';

// Role Type enum with hierarchical levels (inspired by gateway-service RoleType.java)
export enum RoleType {
  RESIDENT = 1,
  ADMIN = 2,
  SUPER_ADMIN = 3,
}

export class RoleService {
  static hasMinimumRole(userRoles: UserRoleEntity[], minRole: AppRole): boolean {
    const minLevel = this.getRoleLevel(minRole);
    return userRoles.some(roleEntity => roleEntity.getRoleLevel() >= minLevel);
  }

  static hasRole(userRoles: UserRoleEntity[], targetRole: AppRole): boolean {
    return userRoles.some(roleEntity => roleEntity.role === targetRole);
  }

  static getRoleLevel(role: AppRole): number {
    const levels: Record<AppRole, number> = {
      'resident': RoleType.RESIDENT,
      'admin': RoleType.ADMIN,
      'super_admin': RoleType.SUPER_ADMIN,
    };
    return levels[role] || 0;
  }

  /**
   * Checks if user role covers (has permission for) the required role
   * Similar to RoleType.covers() from gateway-service
   */
  static covers(userRoles: UserRoleEntity[], requiredRole: AppRole): boolean {
    return this.hasMinimumRole(userRoles, requiredRole);
  }

  static getRoleLabel(role: AppRole): string {
    const labels: Record<AppRole, string> = {
      resident: 'Morador',
      admin: 'Administrador',
      super_admin: 'Super Admin'
    };
    return labels[role];
  }

  static getHighestRole(userRoles: UserRoleEntity[]): UserRoleEntity | null {
    if (userRoles.length === 0) return null;
    
    return userRoles.reduce((highest, current) => {
      return current.getRoleLevel() > highest.getRoleLevel() ? current : highest;
    });
  }

  /**
   * Maps route paths to required roles (similar to AuthorizationFilter.routeRole)
   */
  static getRequiredRoleForPath(path: string): AppRole | null {
    const routeRoleMap: Record<string, AppRole> = {
      '/admin': 'admin',
      '/settings': 'admin',
      '/residents': 'admin',
      '/': 'resident',
    };

    for (const [route, role] of Object.entries(routeRoleMap)) {
      if (path.startsWith(route)) {
        return role;
      }
    }

    return null; // Public route
  }

  /**
   * Checks if user is authorized to access a specific path
   */
  static isAuthorizedForPath(userRoles: UserRoleEntity[], path: string): boolean {
    const requiredRole = this.getRequiredRoleForPath(path);
    
    if (!requiredRole) {
      return true; // Public route
    }

    return this.covers(userRoles, requiredRole);
  }
}
