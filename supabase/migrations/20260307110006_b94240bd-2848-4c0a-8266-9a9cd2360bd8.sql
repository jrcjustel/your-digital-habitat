CREATE TABLE public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id TEXT NOT NULL,
  property_reference TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  offer_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert offers (public form)
CREATE POLICY "Anyone can submit offers" ON public.offers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users can view their own offers (future dashboard)
CREATE POLICY "Users can view own offers" ON public.offers
  FOR SELECT TO authenticated
  USING (email = (SELECT auth.jwt()->>'email'));
