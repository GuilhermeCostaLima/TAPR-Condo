import { supabase } from '@/integrations/supabase/client';
import { IStorageRepository } from '@/domain/repositories/IStorageRepository';

export class SupabaseStorageRepository implements IStorageRepository {
  async upload(bucket: string, path: string, file: File): Promise<{ error: Error | null }> {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    return { error: error ? new Error(error.message) : null };
  }

  async download(bucket: string, path: string): Promise<{ data: Blob | null; error: Error | null }> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    return { 
      data: data || null, 
      error: error ? new Error(error.message) : null 
    };
  }

  async getSignedUrl(bucket: string, path: string, expiresIn: number): Promise<{ signedUrl: string; error: Error | null }> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    return { 
      signedUrl: data?.signedUrl || '', 
      error: error ? new Error(error.message) : null 
    };
  }

  async delete(bucket: string, path: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    return { error: error ? new Error(error.message) : null };
  }
}
