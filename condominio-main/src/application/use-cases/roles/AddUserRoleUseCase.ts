import { IUserRoleRepository } from '@/domain/repositories/IUserRoleRepository';
import { AppRole } from '@/domain/entities/UserRole.entity';

export interface AddUserRoleInput {
  userId: string;
  role: AppRole;
}

export class AddUserRoleUseCase {
  constructor(private userRoleRepository: IUserRoleRepository) {}

  async execute(input: AddUserRoleInput): Promise<void> {
    await this.userRoleRepository.addRole(input.userId, input.role);
  }
}
