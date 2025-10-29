import { DocumentEntity } from '../entities/Document.entity';

export interface CreateDocumentData {
  title: string;
  description: string | null;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  category: string;
  uploadedBy: string;
  isPublic: boolean;
}

export interface IDocumentRepository {
  findAll(): Promise<DocumentEntity[]>;
  findById(id: string): Promise<DocumentEntity | null>;
  findByCategory(category: string): Promise<DocumentEntity[]>;
  findPublic(): Promise<DocumentEntity[]>;
  create(document: CreateDocumentData): Promise<DocumentEntity>;
  delete(id: string): Promise<void>;
}
