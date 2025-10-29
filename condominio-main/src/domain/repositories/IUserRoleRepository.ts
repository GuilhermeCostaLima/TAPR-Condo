import { UserRoleEntity, AppRole } from '../entities/UserRole.entity';

export interface IUserRoleRepository {
  findByUserId(userId: string): Promise<UserRoleEntity[]>;
  addRole(userId: string, role: AppRole): Promise<void>;
  removeRole(userId: string, role: AppRole): Promise<void>;
  hasRole(userId: string, role: AppRole): Promise<boolean>;
}
