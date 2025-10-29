export type AppRole = 'resident' | 'admin' | 'super_admin';

export class UserRoleEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly role: AppRole,
    public readonly createdAt: string
  ) {}

  static create(userId: string, role: AppRole): { userId: string; role: AppRole } {
    return { userId, role };
  }

  getRoleLevel(): number {
    const levels: Record<AppRole, number> = {
      'resident': 1,
      'admin': 2,
      'super_admin': 3
    };
    return levels[this.role] || 0;
  }

  hasMinimumLevel(targetRole: AppRole): boolean {
    const targetLevel = this.getRoleLevelFromRole(targetRole);
    return this.getRoleLevel() >= targetLevel;
  }

  private getRoleLevelFromRole(role: AppRole): number {
    const levels: Record<AppRole, number> = {
      'resident': 1,
      'admin': 2,
      'super_admin': 3
    };
    return levels[role] || 0;
  }
}
