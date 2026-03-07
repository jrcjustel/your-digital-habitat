
-- Allow authenticated users to INSERT their own documents
CREATE POLICY "Users can upload their own documents"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = uploaded_by);

-- Allow users to view their own uploaded documents
CREATE POLICY "Users can view their own documents"
ON public.documents
FOR SELECT
TO authenticated
USING (uploaded_by = auth.uid());

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own documents"
ON public.documents
FOR DELETE
TO authenticated
USING (uploaded_by = auth.uid());

-- Storage: allow authenticated users to upload to documents bucket
CREATE POLICY "Users can upload to documents bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Storage: allow users to read their own uploaded files
CREATE POLICY "Users can read own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage: allow users to delete their own files
CREATE POLICY "Users can delete own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage: allow admins to read all documents
CREATE POLICY "Admins can read all documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin'));
