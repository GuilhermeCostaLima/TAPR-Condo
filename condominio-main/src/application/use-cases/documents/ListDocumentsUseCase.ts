import { IDocumentRepository } from '@/domain/repositories/IDocumentRepository';
import { DocumentEntity } from '@/domain/entities/Document.entity';

export class ListDocumentsUseCase {
  constructor(private documentRepository: IDocumentRepository) {}

  async execute(): Promise<DocumentEntity[]> {
    return await this.documentRepository.findAll();
  }
}
