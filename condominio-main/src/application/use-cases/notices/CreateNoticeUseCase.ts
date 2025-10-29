import { INoticeRepository } from '@/domain/repositories/INoticeRepository';
import { NoticeEntity, NoticePriority } from '@/domain/entities/Notice.entity';

export interface CreateNoticeInput {
  title: string;
  content: string;
  category: string;
  priority: NoticePriority;
  isActive: boolean;
  createdBy: string;
  expiresAt?: string;
}

export class CreateNoticeUseCase {
  constructor(private noticeRepository: INoticeRepository) {}

  async execute(input: CreateNoticeInput): Promise<NoticeEntity> {
    const notice = NoticeEntity.create({
      title: input.title,
      content: input.content,
      category: input.category,
      priority: input.priority,
      isActive: input.isActive,
      createdBy: input.createdBy,
      expiresAt: input.expiresAt || null
    });

    return await this.noticeRepository.create(notice);
  }
}
