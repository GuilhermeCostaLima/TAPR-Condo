import { IReservationRepository } from '@/domain/repositories/IReservationRepository';
import { ReservationEntity } from '@/domain/entities/Reservation.entity';
import { AppRole } from '@/domain/entities/UserRole.entity';
import { RoleService } from '@/domain/services/RoleService';

export interface ListReservationsInput {
  userId: string;
  userRoles: AppRole[];
}

export class ListReservationsUseCase {
  constructor(private reservationRepository: IReservationRepository) {}

  async execute(input: ListReservationsInput): Promise<ReservationEntity[]> {
    // Admins can see all reservations
    const isAdmin = input.userRoles.some(role => 
      RoleService.getRoleLevel(role) >= RoleService.getRoleLevel('admin')
    );

    if (isAdmin) {
      return await this.reservationRepository.findAll();
    }

    // Regular users can only see their own reservations
    return await this.reservationRepository.findByUserId(input.userId);
  }
}
