import { IUserRoleRepository } from '@/domain/repositories/IUserRoleRepository';
import { AppRole } from '@/domain/entities/UserRole.entity';

export interface RemoveUserRoleInput {
  userId: string;
  role: AppRole;
}

export class RemoveUserRoleUseCase {
  constructor(private userRoleRepository: IUserRoleRepository) {}

  async execute(input: RemoveUserRoleInput): Promise<void> {
    await this.userRoleRepository.removeRole(input.userId, input.role);
  }
}
