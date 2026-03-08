
-- 1. Asset images table
CREATE TABLE public.asset_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES public.npl_assets(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_cover boolean NOT NULL DEFAULT false,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now(),
  uploaded_by uuid
);

ALTER TABLE public.asset_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view images
CREATE POLICY "Anyone can view asset images"
  ON public.asset_images FOR SELECT
  USING (true);

-- Admins can manage images
CREATE POLICY "Admins can manage asset images"
  ON public.asset_images FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Bids table for real-time auction system
CREATE TABLE public.bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES public.npl_assets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'active',
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  representacion text DEFAULT 'propio',
  persona_tipo text DEFAULT 'fisica',
  empresa text,
  cif text,
  represented_name text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Users can view own bids
CREATE POLICY "Users can view own bids"
  ON public.bids FOR SELECT
  USING (auth.uid() = user_id);

-- Users can place bids
CREATE POLICY "Users can place bids"
  ON public.bids FOR INSERT
  WITH CHECK (auth.uid() = user_id AND amount > 0);

-- Admins can manage all bids
CREATE POLICY "Admins can manage all bids"
  ON public.bids FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public can see bid count and highest bid (no personal info)
CREATE POLICY "Anyone can see bid stats"
  ON public.bids FOR SELECT
  USING (true);

-- 3. Auction settings per asset
CREATE TABLE public.auction_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES public.npl_assets(id) ON DELETE CASCADE UNIQUE,
  auction_type text NOT NULL DEFAULT 'private_sale',
  start_date timestamptz,
  end_date timestamptz,
  min_bid numeric DEFAULT 0,
  bid_increment numeric DEFAULT 500,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.auction_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view auction settings"
  ON public.auction_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage auction settings"
  ON public.auction_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Enable realtime for bids
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;

-- 5. Storage bucket for asset images
INSERT INTO storage.buckets (id, name, public)
VALUES ('asset-images', 'asset-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: anyone can view
CREATE POLICY "Anyone can view asset images storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'asset-images');

-- Storage policy: admins can upload
CREATE POLICY "Admins can upload asset images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'asset-images' AND public.has_role(auth.uid(), 'admin'));

-- Storage policy: admins can delete
CREATE POLICY "Admins can delete asset images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'asset-images' AND public.has_role(auth.uid(), 'admin'));
