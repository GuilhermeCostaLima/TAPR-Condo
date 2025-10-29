import { NoticeEntity } from '../entities/Notice.entity';

export interface CreateNoticeData {
  title: string;
  content: string;
  category: string;
  priority: string;
  isActive: boolean;
  createdBy: string;
  expiresAt: string | null;
}

export interface UpdateNoticeData {
  title?: string;
  content?: string;
  category?: string;
  priority?: string;
  isActive?: boolean;
  expiresAt?: string | null;
}

export interface INoticeRepository {
  findAll(): Promise<NoticeEntity[]>;
  findById(id: string): Promise<NoticeEntity | null>;
  findActive(): Promise<NoticeEntity[]>;
  create(notice: CreateNoticeData): Promise<NoticeEntity>;
  update(id: string, notice: UpdateNoticeData): Promise<void>;
  toggleActive(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}
