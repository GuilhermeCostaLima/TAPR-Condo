export type NoticePriority = 'low' | 'normal' | 'high' | 'urgent';

export class NoticeEntity {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly content: string,
    public readonly category: string,
    public readonly priority: NoticePriority,
    public readonly isActive: boolean,
    public readonly createdBy: string,
    public readonly expiresAt: string | null,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  static create(data: {
    title: string;
    content: string;
    category: string;
    priority: NoticePriority;
    isActive: boolean;
    createdBy: string;
    expiresAt: string | null;
  }): typeof data {
    return data;
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date(this.expiresAt) < new Date();
  }

  isVisibleToUsers(): boolean {
    return this.isActive && !this.isExpired();
  }

  canBeEditedBy(userId: string): boolean {
    return this.createdBy === userId;
  }
}
