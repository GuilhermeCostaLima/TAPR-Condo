// Dependency Injection Container - Ports and Adapters Pattern

import { SupabaseReservationRepository } from '../repositories/supabase/SupabaseReservationRepository';
import { SupabaseAuthRepository } from '../repositories/supabase/SupabaseAuthRepository';
import { SupabaseStorageRepository } from '../repositories/supabase/SupabaseStorageRepository';
import { SupabaseProfileRepository } from '../repositories/supabase/SupabaseProfileRepository';
import { SupabaseUserRoleRepository } from '../repositories/supabase/SupabaseUserRoleRepository';

import { CreateReservationUseCase } from '@/application/use-cases/reservations/CreateReservationUseCase';
import { ListReservationsUseCase } from '@/application/use-cases/reservations/ListReservationsUseCase';
import { UpdateReservationStatusUseCase } from '@/application/use-cases/reservations/UpdateReservationStatusUseCase';

import { SignInUseCase } from '@/application/use-cases/auth/SignInUseCase';
import { SignUpUseCase } from '@/application/use-cases/auth/SignUpUseCase';
import { SignOutUseCase } from '@/application/use-cases/auth/SignOutUseCase';

import { GetProfileUseCase } from '@/application/use-cases/profiles/GetProfileUseCase';

import { ListUserRolesUseCase } from '@/application/use-cases/roles/ListUserRolesUseCase';
import { AddUserRoleUseCase } from '@/application/use-cases/roles/AddUserRoleUseCase';
import { RemoveUserRoleUseCase } from '@/application/use-cases/roles/RemoveUserRoleUseCase';

// Repository Instances (Adapters)
const reservationRepository = new SupabaseReservationRepository();
const authRepository = new SupabaseAuthRepository();
const storageRepository = new SupabaseStorageRepository();
const profileRepository = new SupabaseProfileRepository();
const userRoleRepository = new SupabaseUserRoleRepository();

// Use Case Instances (Application Layer)
export const createReservationUseCase = new CreateReservationUseCase(reservationRepository);
export const listReservationsUseCase = new ListReservationsUseCase(reservationRepository);
export const updateReservationStatusUseCase = new UpdateReservationStatusUseCase(reservationRepository);

export const signInUseCase = new SignInUseCase(authRepository);
export const signUpUseCase = new SignUpUseCase(authRepository);
export const signOutUseCase = new SignOutUseCase(authRepository);

export const getProfileUseCase = new GetProfileUseCase(profileRepository);

export const listUserRolesUseCase = new ListUserRolesUseCase(userRoleRepository);
export const addUserRoleUseCase = new AddUserRoleUseCase(userRoleRepository);
export const removeUserRoleUseCase = new RemoveUserRoleUseCase(userRoleRepository);

// Export repositories for direct access when needed
export const repositories = {
  reservation: reservationRepository,
  auth: authRepository,
  storage: storageRepository,
  profile: profileRepository,
  userRole: userRoleRepository
};
