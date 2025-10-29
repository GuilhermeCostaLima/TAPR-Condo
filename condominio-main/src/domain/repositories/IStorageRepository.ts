export interface IStorageRepository {
  upload(bucket: string, path: string, file: File): Promise<{ error: Error | null }>;
  download(bucket: string, path: string): Promise<{ data: Blob | null; error: Error | null }>;
  getSignedUrl(bucket: string, path: string, expiresIn: number): Promise<{ signedUrl: string; error: Error | null }>;
  delete(bucket: string, path: string): Promise<{ error: Error | null }>;
}
