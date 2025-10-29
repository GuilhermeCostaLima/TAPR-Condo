export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export class ReservationEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly apartmentNumber: string,
    public readonly residentName: string,
    public readonly date: string,
    public readonly timeSlot: string,
    public readonly event: string,
    public readonly contact: string,
    public readonly observations: string | null,
    public readonly status: ReservationStatus,
    public readonly cancellationReason: string | null,
    public readonly requestedAt: string,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  static create(data: {
    userId: string;
    apartmentNumber: string;
    residentName: string;
    date: string;
    timeSlot: string;
    event: string;
    contact: string;
    observations: string | null;
    status: ReservationStatus;
    cancellationReason: string | null;
  }): typeof data & { requestedAt: string } {
    return {
      ...data,
      requestedAt: new Date().toISOString()
    };
  }

  isConfirmed(): boolean {
    return this.status === 'confirmed';
  }

  isPending(): boolean {
    return this.status === 'pending';
  }

  isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  canBeUpdatedBy(userId: string): boolean {
    return this.userId === userId;
  }
}
