import { ReservationEntity } from '@/domain/entities/Reservation.entity';
import { Reservation } from '@/types/supabase';

export class ReservationDTO {
  static fromEntity(entity: ReservationEntity): Reservation {
    return {
      id: entity.id,
      user_id: entity.userId,
      apartment_number: entity.apartmentNumber,
      resident_name: entity.residentName,
      date: entity.date,
      time_slot: entity.timeSlot,
      event: entity.event,
      contact: entity.contact,
      observations: entity.observations,
      status: entity.status,
      cancellation_reason: entity.cancellationReason,
      requested_at: entity.requestedAt,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt
    };
  }

  static toEntity(dto: Reservation): ReservationEntity {
    return new ReservationEntity(
      dto.id,
      dto.user_id,
      dto.apartment_number,
      dto.resident_name,
      dto.date,
      dto.time_slot,
      dto.event,
      dto.contact,
      dto.observations,
      dto.status,
      dto.cancellation_reason,
      dto.requested_at,
      dto.created_at,
      dto.updated_at
    );
  }
}
