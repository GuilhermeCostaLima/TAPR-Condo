import { ProfileEntity } from '../entities/Profile.entity';

export interface CreateProfileData {
  userId: string;
  apartmentNumber: string | null;
  displayName: string | null;
}

export interface UpdateProfileData {
  apartmentNumber?: string | null;
  displayName?: string | null;
}

export interface IProfileRepository {
  findAll(): Promise<ProfileEntity[]>;
  findById(id: string): Promise<ProfileEntity | null>;
  findByUserId(userId: string): Promise<ProfileEntity | null>;
  create(profile: CreateProfileData): Promise<ProfileEntity>;
  update(userId: string, profile: UpdateProfileData): Promise<void>;
}
