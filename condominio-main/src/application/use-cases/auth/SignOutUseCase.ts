import { IAuthRepository } from '@/domain/repositories/IAuthRepository';

export class SignOutUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<{ error: Error | null }> {
    return await this.authRepository.signOut();
  }
}
