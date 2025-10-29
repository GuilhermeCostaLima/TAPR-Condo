import { ProfileEntity } from '@/domain/entities/Profile.entity';
import { Profile } from '@/types/supabase';

export class ProfileDTO {
  static fromEntity(entity: ProfileEntity): Profile {
    return {
      id: entity.id,
      user_id: entity.userId,
      apartment_number: entity.apartmentNumber,
      display_name: entity.displayName,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt
    };
  }

  static toEntity(dto: Profile): ProfileEntity {
    return new ProfileEntity(
      dto.id,
      dto.user_id,
      dto.apartment_number,
      dto.display_name,
      dto.created_at,
      dto.updated_at
    );
  }
}
