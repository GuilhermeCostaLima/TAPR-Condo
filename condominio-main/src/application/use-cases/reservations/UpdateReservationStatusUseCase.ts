import { IReservationRepository } from '@/domain/repositories/IReservationRepository';
import { ReservationStatus } from '@/domain/entities/Reservation.entity';

export interface UpdateReservationStatusInput {
  reservationId: string;
  status: ReservationStatus;
  cancellationReason?: string;
}

export class UpdateReservationStatusUseCase {
  constructor(private reservationRepository: IReservationRepository) {}

  async execute(input: UpdateReservationStatusInput): Promise<void> {
    await this.reservationRepository.updateStatus(
      input.reservationId,
      input.status,
      input.cancellationReason
    );
  }
}
