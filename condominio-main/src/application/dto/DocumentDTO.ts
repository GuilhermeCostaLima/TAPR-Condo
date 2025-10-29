import { DocumentEntity } from '@/domain/entities/Document.entity';
import { Document } from '@/types/supabase';

export class DocumentDTO {
  static fromEntity(entity: DocumentEntity): Document {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      file_name: entity.fileName,
      file_size: entity.fileSize,
      file_type: entity.fileType,
      file_url: entity.fileUrl,
      category: entity.category,
      uploaded_by: entity.uploadedBy,
      is_public: entity.isPublic,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt
    };
  }

  static toEntity(dto: Document): DocumentEntity {
    return new DocumentEntity(
      dto.id,
      dto.title,
      dto.description,
      dto.file_name,
      dto.file_size,
      dto.file_type,
      dto.file_url,
      dto.category,
      dto.uploaded_by,
      dto.is_public,
      dto.created_at,
      dto.updated_at
    );
  }
}
