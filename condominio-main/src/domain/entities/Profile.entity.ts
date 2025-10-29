export class ProfileEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly apartmentNumber: string | null,
    public readonly displayName: string | null,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  static create(data: {
    userId: string;
    apartmentNumber: string | null;
    displayName: string | null;
  }): typeof data {
    return data;
  }

  hasApartment(): boolean {
    return !!this.apartmentNumber;
  }

  getDisplayName(): string {
    return this.displayName || 'Nome não informado';
  }
}
