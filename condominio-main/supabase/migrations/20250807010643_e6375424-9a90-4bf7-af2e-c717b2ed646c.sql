-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  false, 
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'text/plain']
);

-- Create RLS policies for document storage
CREATE POLICY "Users can view documents they have access to" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND 
  (
    -- Public documents can be viewed by everyone
    EXISTS (
      SELECT 1 FROM public.documents d 
      WHERE d.file_url = CONCAT('documents/', name) 
      AND d.is_public = true
    ) OR
    -- Private documents can only be viewed by authenticated users
    auth.uid() IS NOT NULL
  )
);

CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own uploaded documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own uploaded documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);