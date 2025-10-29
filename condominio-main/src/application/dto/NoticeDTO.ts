import { NoticeEntity } from '@/domain/entities/Notice.entity';
import { Notice } from '@/types/supabase';

export class NoticeDTO {
  static fromEntity(entity: NoticeEntity): Notice {
    return {
      id: entity.id,
      title: entity.title,
      content: entity.content,
      category: entity.category,
      priority: entity.priority,
      is_active: entity.isActive,
      created_by: entity.createdBy,
      expires_at: entity.expiresAt,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt
    };
  }

  static toEntity(dto: Notice): NoticeEntity {
    return new NoticeEntity(
      dto.id,
      dto.title,
      dto.content,
      dto.category,
      dto.priority,
      dto.is_active,
      dto.created_by,
      dto.expires_at,
      dto.created_at,
      dto.updated_at
    );
  }
}
