import { IProfileRepository } from '@/domain/repositories/IProfileRepository';
import { ProfileEntity } from '@/domain/entities/Profile.entity';

export interface GetProfileInput {
  userId: string;
}

export class GetProfileUseCase {
  constructor(private profileRepository: IProfileRepository) {}

  async execute(input: GetProfileInput): Promise<ProfileEntity | null> {
    return await this.profileRepository.findByUserId(input.userId);
  }
}
