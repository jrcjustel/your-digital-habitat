
-- 1. Add estado field to npl_assets
ALTER TABLE public.npl_assets ADD COLUMN IF NOT EXISTS estado text DEFAULT 'disponible';

-- 2. Waitlist table
CREATE TABLE public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES public.npl_assets(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  email text NOT NULL,
  full_name text NOT NULL,
  phone text,
  position integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamptz NOT NULL DEFAULT now(),
  notified_at timestamptz,
  UNIQUE(asset_id, user_id)
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own waitlist entries" ON public.waitlist FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can join waitlist" ON public.waitlist FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND email IS NOT NULL AND full_name IS NOT NULL);
CREATE POLICY "Users can remove themselves from waitlist" ON public.waitlist FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage waitlist" ON public.waitlist FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_waitlist_asset ON public.waitlist(asset_id, position);
CREATE INDEX idx_waitlist_user ON public.waitlist(user_id);

-- 3. Activity log table
CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view activity log" ON public.activity_log FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can insert activity log" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX idx_activity_log_user ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON public.activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created ON public.activity_log(created_at DESC);

-- 4. Investor-asset matching table
CREATE TABLE public.investor_asset_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL,
  asset_id uuid REFERENCES public.npl_assets(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL DEFAULT 0,
  criteria jsonb DEFAULT '{}'::jsonb,
  notified boolean DEFAULT false,
  viewed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(investor_id, asset_id)
);

ALTER TABLE public.investor_asset_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches" ON public.investor_asset_matches FOR SELECT TO authenticated USING (auth.uid() = investor_id);
CREATE POLICY "Admins can manage matches" ON public.investor_asset_matches FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_matches_investor ON public.investor_asset_matches(investor_id, score DESC);
CREATE INDEX idx_matches_asset ON public.investor_asset_matches(asset_id);

-- 5. Matching function: scores investors against an asset
CREATE OR REPLACE FUNCTION public.match_investors_to_asset(p_asset_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  asset_rec record;
  inv record;
  score integer;
  criteria jsonb;
  match_count integer := 0;
BEGIN
  SELECT * INTO asset_rec FROM npl_assets WHERE id = p_asset_id;
  IF NOT FOUND THEN RETURN 0; END IF;

  FOR inv IN SELECT * FROM profiles WHERE nda_signed = true LOOP
    score := 0;
    criteria := '{}'::jsonb;

    -- Geographic match (40 points max)
    IF inv.comunidad_autonoma IS NOT NULL AND inv.comunidad_autonoma = asset_rec.comunidad_autonoma THEN
      score := score + 25;
      criteria := criteria || '{"ccaa_match": true}'::jsonb;
    END IF;
    IF inv.provincias_interes IS NOT NULL AND asset_rec.provincia = ANY(inv.provincias_interes) THEN
      score := score + 15;
      criteria := criteria || '{"provincia_match": true}'::jsonb;
    END IF;

    -- Asset type match (25 points)
    IF inv.tipos_activo_preferidos IS NOT NULL AND asset_rec.tipo_activo = ANY(inv.tipos_activo_preferidos) THEN
      score := score + 25;
      criteria := criteria || '{"tipo_match": true}'::jsonb;
    END IF;

    -- Price range match (20 points)
    IF inv.presupuesto_min IS NOT NULL AND inv.presupuesto_max IS NOT NULL 
       AND asset_rec.precio_orientativo >= inv.presupuesto_min 
       AND asset_rec.precio_orientativo <= inv.presupuesto_max THEN
      score := score + 20;
      criteria := criteria || '{"precio_match": true}'::jsonb;
    ELSIF inv.presupuesto_max IS NOT NULL AND inv.presupuesto_max > 0
       AND asset_rec.precio_orientativo <= inv.presupuesto_max THEN
      score := score + 10;
      criteria := criteria || '{"precio_partial": true}'::jsonb;
    END IF;

    -- Investor level bonus (15 points)
    IF inv.investor_level = 'profesional' THEN score := score + 15;
    ELSIF inv.investor_level = 'avanzado' THEN score := score + 10;
    ELSIF inv.investor_level = 'intermedio' THEN score := score + 5;
    END IF;

    -- Only store if score > 20
    IF score > 20 THEN
      INSERT INTO investor_asset_matches (investor_id, asset_id, score, criteria)
      VALUES (inv.user_id, p_asset_id, score, criteria)
      ON CONFLICT (investor_id, asset_id) DO UPDATE SET score = EXCLUDED.score, criteria = EXCLUDED.criteria;
      match_count := match_count + 1;
    END IF;
  END LOOP;

  RETURN match_count;
END;
$$;

-- 6. Add estado index
CREATE INDEX idx_npl_assets_estado ON public.npl_assets(estado);
