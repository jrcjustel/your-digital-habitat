ALTER TABLE public.profiles 
  ADD COLUMN nda_signed boolean NOT NULL DEFAULT false,
  ADD COLUMN nda_signed_at timestamp with time zone;