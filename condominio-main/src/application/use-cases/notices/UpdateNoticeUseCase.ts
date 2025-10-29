import { INoticeRepository } from '@/domain/repositories/INoticeRepository';
import { NoticePriority } from '@/domain/entities/Notice.entity';

export interface UpdateNoticeInput {
  noticeId: string;
  title?: string;
  content?: string;
  category?: string;
  priority?: NoticePriority;
  isActive?: boolean;
  expiresAt?: string | null;
}

export class UpdateNoticeUseCase {
  constructor(private noticeRepository: INoticeRepository) {}

  async execute(input: UpdateNoticeInput): Promise<void> {
    const { noticeId, ...updates } = input;
    await this.noticeRepository.update(noticeId, updates);
  }
}
