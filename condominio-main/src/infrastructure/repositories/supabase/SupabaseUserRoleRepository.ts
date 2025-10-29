import { supabase } from '@/integrations/supabase/client';
import { IUserRoleRepository } from '@/domain/repositories/IUserRoleRepository';
import { UserRoleEntity, AppRole } from '@/domain/entities/UserRole.entity';

export class SupabaseUserRoleRepository implements IUserRoleRepository {
  async findByUserId(userId: string): Promise<UserRoleEntity[]> {
    const { data, error } = await (supabase as any)
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    
    return (data || []).map((r: any) => new UserRoleEntity(
      r.id,
      r.user_id,
      r.role as AppRole,
      r.created_at
    ));
  }

  async addRole(userId: string, role: AppRole): Promise<void> {
    const { error } = await (supabase as any)
      .from('user_roles')
      .insert({ user_id: userId, role });

    if (error) throw new Error(error.message);
  }

  async removeRole(userId: string, role: AppRole): Promise<void> {
    const { error } = await (supabase as any)
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);

    if (error) throw new Error(error.message);
  }

  async hasRole(userId: string, role: AppRole): Promise<boolean> {
    const { data, error } = await (supabase as any)
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', role)
      .single();

    return !error && !!data;
  }
}
