
-- Create storage bucket for dossier PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('dossiers', 'dossiers', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload dossiers
CREATE POLICY "Authenticated users can upload dossiers"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'dossiers');

-- Allow authenticated users to read their own dossiers
CREATE POLICY "Authenticated users can read dossiers"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'dossiers');

-- Allow authenticated users to delete their own dossiers
CREATE POLICY "Authenticated users can delete dossiers"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'dossiers');
