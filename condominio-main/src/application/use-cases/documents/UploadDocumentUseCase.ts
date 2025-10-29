import { IDocumentRepository } from '@/domain/repositories/IDocumentRepository';
import { IStorageRepository } from '@/domain/repositories/IStorageRepository';
import { DocumentEntity } from '@/domain/entities/Document.entity';

export interface UploadDocumentInput {
  title: string;
  description: string;
  category: string;
  file: File;
  uploadedBy: string;
  isPublic: boolean;
}

export class UploadDocumentUseCase {
  constructor(
    private documentRepository: IDocumentRepository,
    private storageRepository: IStorageRepository
  ) {}

  async execute(input: UploadDocumentInput): Promise<DocumentEntity> {
    // Upload file to storage
    const fileExt = input.file.name.split('.').pop();
    const fileName = `${input.uploadedBy}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await this.storageRepository.upload(
      'documents',
      fileName,
      input.file
    );

    if (uploadError) {
      throw new Error('Failed to upload file: ' + uploadError.message);
    }

    // Create document record
    const document = DocumentEntity.create({
      title: input.title,
      description: input.description,
      category: input.category,
      fileName: input.file.name,
      fileType: input.file.type,
      fileUrl: `documents/${fileName}`,
      fileSize: input.file.size,
      uploadedBy: input.uploadedBy,
      isPublic: input.isPublic
    });

    return await this.documentRepository.create(document);
  }
}
