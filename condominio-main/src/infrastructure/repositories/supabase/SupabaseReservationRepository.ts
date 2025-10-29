import { supabase } from '@/integrations/supabase/client';
import { IReservationRepository, CreateReservationData } from '@/domain/repositories/IReservationRepository';
import { ReservationEntity, ReservationStatus } from '@/domain/entities/Reservation.entity';
import { ReservationDTO } from '@/application/dto/ReservationDTO';
import { Reservation } from '@/types/supabase';

export class SupabaseReservationRepository implements IReservationRepository {
  async findAll(): Promise<ReservationEntity[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    
    return (data || []).map(r => ReservationDTO.toEntity(r as Reservation));
  }

  async findById(id: string): Promise<ReservationEntity | null> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    
    return data ? ReservationDTO.toEntity(data as Reservation) : null;
  }

  async findByUserId(userId: string): Promise<ReservationEntity[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    
    return (data || []).map(r => ReservationDTO.toEntity(r as Reservation));
  }

  async findByDate(date: string): Promise<ReservationEntity[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('date', date);

    if (error) throw new Error(error.message);
    
    return (data || []).map(r => ReservationDTO.toEntity(r as Reservation));
  }

  async create(reservation: CreateReservationData): Promise<ReservationEntity> {
    const { data, error } = await supabase
      .from('reservations')
      .insert([{
        user_id: reservation.userId,
        apartment_number: reservation.apartmentNumber,
        resident_name: reservation.residentName,
        date: reservation.date,
        time_slot: reservation.timeSlot,
        event: reservation.event,
        contact: reservation.contact,
        observations: reservation.observations,
        status: reservation.status,
        cancellation_reason: reservation.cancellationReason,
        requested_at: reservation.requestedAt
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    return ReservationDTO.toEntity(data as Reservation);
  }

  async updateStatus(id: string, status: ReservationStatus, cancellationReason?: string): Promise<void> {
    const updateData: any = { status };
    if (cancellationReason) {
      updateData.cancellation_reason = cancellationReason;
    }

    const { error } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
