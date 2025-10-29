import { User, Session } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  apartmentNumber?: string;
  displayName: string;
  role: 'resident' | 'admin';
}

export interface SignInData {
  email: string;
  password: string;
}

export interface IAuthRepository {
  signUp(data: SignUpData): Promise<{ error: Error | null }>;
  signIn(data: SignInData): Promise<{ error: Error | null }>;
  signOut(): Promise<{ error: Error | null }>;
  getCurrentUser(): Promise<User | null>;
  getCurrentSession(): Promise<Session | null>;
  onAuthStateChange(callback: (event: string, session: Session | null) => void): () => void;
}
