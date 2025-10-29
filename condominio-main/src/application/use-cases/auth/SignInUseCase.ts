import { IAuthRepository } from '@/domain/repositories/IAuthRepository';

export interface SignInInput {
  email: string;
  password: string;
}

export class SignInUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(input: SignInInput): Promise<{ error: Error | null }> {
    return await this.authRepository.signIn({
      email: input.email,
      password: input.password
    });
  }
}
