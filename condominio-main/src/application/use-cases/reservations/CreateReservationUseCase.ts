import { IReservationRepository } from '@/domain/repositories/IReservationRepository';
import { ReservationEntity } from '@/domain/entities/Reservation.entity';

export interface CreateReservationInput {
  userId: string;
  apartmentNumber: string;
  residentName: string;
  date: string;
  timeSlot: string;
  event: string;
  contact: string;
  observations?: string;
}

export class CreateReservationUseCase {
  constructor(private reservationRepository: IReservationRepository) {}

  async execute(input: CreateReservationInput): Promise<ReservationEntity> {
    const reservation = ReservationEntity.create({
      userId: input.userId,
      apartmentNumber: input.apartmentNumber,
      residentName: input.residentName,
      date: input.date,
      timeSlot: input.timeSlot,
      event: input.event,
      contact: input.contact,
      observations: input.observations || null,
      status: 'pending',
      cancellationReason: null
    });

    return await this.reservationRepository.create(reservation);
  }
}
