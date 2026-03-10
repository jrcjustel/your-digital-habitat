-- Allow admin users to insert/update/delete npl_assets (for scraping imports)
CREATE POLICY "Admins can manage npl_assets"
ON public.npl_assets
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Also allow service role inserts (edge functions use service role key, bypasses RLS)
-- No policy needed for service role as it bypasses RLS

-- Add unique constraint on asset_id for upsert support
CREATE UNIQUE INDEX IF NOT EXISTS idx_npl_assets_asset_id_unique ON public.npl_assets(asset_id) WHERE asset_id IS NOT NULL;