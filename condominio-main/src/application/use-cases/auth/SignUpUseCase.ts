import { IAuthRepository } from '@/domain/repositories/IAuthRepository';

export interface SignUpInput {
  email: string;
  password: string;
  apartmentNumber?: string;
  displayName: string;
  role: 'resident' | 'admin';
}

export class SignUpUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(input: SignUpInput): Promise<{ error: Error | null }> {
    return await this.authRepository.signUp({
      email: input.email,
      password: input.password,
      apartmentNumber: input.apartmentNumber,
      displayName: input.displayName,
      role: input.role
    });
  }
}
