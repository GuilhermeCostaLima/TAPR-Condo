import { IUserRoleRepository } from '@/domain/repositories/IUserRoleRepository';
import { UserRoleEntity } from '@/domain/entities/UserRole.entity';

export interface ListUserRolesInput {
  userId: string;
}

export class ListUserRolesUseCase {
  constructor(private userRoleRepository: IUserRoleRepository) {}

  async execute(input: ListUserRolesInput): Promise<UserRoleEntity[]> {
    return await this.userRoleRepository.findByUserId(input.userId);
  }
}
