import { ReservationEntity, ReservationStatus } from '../entities/Reservation.entity';

export interface CreateReservationData {
  userId: string;
  apartmentNumber: string;
  residentName: string;
  date: string;
  timeSlot: string;
  event: string;
  contact: string;
  observations: string | null;
  status: ReservationStatus;
  cancellationReason: string | null;
  requestedAt: string;
}

export interface IReservationRepository {
  findAll(): Promise<ReservationEntity[]>;
  findById(id: string): Promise<ReservationEntity | null>;
  findByUserId(userId: string): Promise<ReservationEntity[]>;
  findByDate(date: string): Promise<ReservationEntity[]>;
  create(reservation: CreateReservationData): Promise<ReservationEntity>;
  updateStatus(id: string, status: ReservationStatus, cancellationReason?: string): Promise<void>;
  delete(id: string): Promise<void>;
}
