import { supabase } from '@/integrations/supabase/client';
import { IAuthRepository, SignUpData, SignInData } from '@/domain/repositories/IAuthRepository';
import { User, Session } from '@supabase/supabase-js';

export class SupabaseAuthRepository implements IAuthRepository {
  async signUp(data: SignUpData): Promise<{ error: Error | null }> {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          apartment_number: data.role === 'admin' ? null : data.apartmentNumber,
          display_name: data.displayName,
          role: data.role
        }
      }
    });

    return { error: error ? new Error(error.message) : null };
  }

  async signIn(data: SignInData): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    return { error: error ? new Error(error.message) : null };
  }

  async signOut(): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signOut();
    return { error: error ? new Error(error.message) : null };
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return () => subscription.unsubscribe();
  }
}
