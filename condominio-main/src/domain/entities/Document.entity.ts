export class DocumentEntity {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly fileName: string,
    public readonly fileSize: number,
    public readonly fileType: string,
    public readonly fileUrl: string,
    public readonly category: string,
    public readonly uploadedBy: string,
    public readonly isPublic: boolean,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  static create(data: {
    title: string;
    description: string | null;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
    category: string;
    uploadedBy: string;
    isPublic: boolean;
  }): typeof data {
    return data;
  }

  canBeViewedBy(userId: string): boolean {
    return this.isPublic || this.uploadedBy === userId;
  }

  canBeDeletedBy(userId: string): boolean {
    return this.uploadedBy === userId;
  }
}
