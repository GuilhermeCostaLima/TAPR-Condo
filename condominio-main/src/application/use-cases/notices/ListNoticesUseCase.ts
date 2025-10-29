import { INoticeRepository } from '@/domain/repositories/INoticeRepository';
import { NoticeEntity } from '@/domain/entities/Notice.entity';

export class ListNoticesUseCase {
  constructor(private noticeRepository: INoticeRepository) {}

  async execute(): Promise<NoticeEntity[]> {
    return await this.noticeRepository.findAll();
  }
}
