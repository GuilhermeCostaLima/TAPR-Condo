export type AppRole = 'resident' | 'admin' | 'super_admin';

export interface Profile {
  id: string;
  user_id: string;
  apartment_number: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Reservation {
  id: string;
  user_id: string;
  apartment_number: string;
  resident_name: string;
  date: string;
  time_slot: string;
  event: string;
  contact: string;
  observations: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  cancellation_reason: string | null;
  requested_at: string;
  created_at: string;
  updated_at: string;
}

// Database response type (with potential string status)
export interface DatabaseReservation {
  id: string;
  user_id: string;
  apartment_number: string;
  resident_name: string;
  date: string;
  time_slot: string;
  event: string;
  contact: string;
  observations: string | null;
  status: string;
  cancellation_reason: string | null;
  requested_at: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  description: string | null;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  category: string;
  uploaded_by: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_active: boolean;
  created_by: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CondominiumSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: 'string' | 'number' | 'boolean' | 'json';
  description: string | null;
  updated_by: string;
  created_at: string;
  updated_at: string;
}