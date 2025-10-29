import { supabase } from '@/integrations/supabase/client';
import { IProfileRepository, CreateProfileData, UpdateProfileData } from '@/domain/repositories/IProfileRepository';
import { ProfileEntity } from '@/domain/entities/Profile.entity';
import { ProfileDTO } from '@/application/dto/ProfileDTO';
import { Profile } from '@/types/supabase';

export class SupabaseProfileRepository implements IProfileRepository {
  async findAll(): Promise<ProfileEntity[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('apartment_number');

    if (error) throw new Error(error.message);
    
    return (data || []).map(p => ProfileDTO.toEntity(p as Profile));
  }

  async findById(id: string): Promise<ProfileEntity | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    
    return data ? ProfileDTO.toEntity(data as Profile) : null;
  }

  async findByUserId(userId: string): Promise<ProfileEntity | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    
    return data ? ProfileDTO.toEntity(data as Profile) : null;
  }

  async create(profile: CreateProfileData): Promise<ProfileEntity> {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        user_id: profile.userId,
        apartment_number: profile.apartmentNumber,
        display_name: profile.displayName
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    return ProfileDTO.toEntity(data as Profile);
  }

  async update(userId: string, profile: UpdateProfileData): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        apartment_number: profile.apartmentNumber,
        display_name: profile.displayName
      })
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }
}
