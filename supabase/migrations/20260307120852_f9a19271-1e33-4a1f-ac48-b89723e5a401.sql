
-- Documents table: files shared with clients per asset
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint DEFAULT 0,
  mime_type text,
  category text NOT NULL DEFAULT 'general',
  npl_asset_id uuid REFERENCES public.npl_assets(id) ON DELETE CASCADE,
  property_id text,
  is_confidential boolean NOT NULL DEFAULT true,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read non-confidential documents
CREATE POLICY "Anyone can read public documents"
ON public.documents FOR SELECT
TO authenticated
USING (is_confidential = false);

-- Users with NDA signed can read confidential documents
CREATE POLICY "NDA users can read confidential documents"
ON public.documents FOR SELECT
TO authenticated
USING (
  is_confidential = true
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.nda_signed = true
  )
);

-- Admins can manage all documents
CREATE POLICY "Admins can manage documents"
ON public.documents FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('documents', 'documents', false, 52428800)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users can read
CREATE POLICY "Authenticated users can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Admins can upload documents
CREATE POLICY "Admins can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND public.has_role(auth.uid(), 'admin')
);

-- Admins can delete documents
CREATE POLICY "Admins can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND public.has_role(auth.uid(), 'admin')
);
