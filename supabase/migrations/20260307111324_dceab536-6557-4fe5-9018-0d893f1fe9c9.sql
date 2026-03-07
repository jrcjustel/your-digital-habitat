CREATE TABLE public.npl_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio text,
  provincia text,
  tipo_activo text,
  direccion text,
  ref_catastral text,
  finca_registral text,
  registro_propiedad text,
  valor_activo numeric DEFAULT 0,
  deuda_ob numeric DEFAULT 0,
  servicer text,
  cartera text,
  publicado boolean DEFAULT false,
  ndg text,
  asset_id text,
  name_debtor text,
  persona_tipo text,
  rango_deuda text,
  comunidad_autonoma text,
  sqm numeric DEFAULT 0,
  estado_ocupacional text,
  tipo_procedimiento text,
  estado_judicial text,
  cesion_remate boolean DEFAULT false,
  cesion_credito boolean DEFAULT false,
  importe_preaprobado numeric DEFAULT 0,
  oferta_aprobada boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.npl_assets ENABLE ROW LEVEL SECURITY;

-- Public can see non-sensitive fields (municipio, provincia, tipo, etc.)
-- Sensitive fields (name_debtor, ndg, deuda) are gated in the frontend via NDA check
CREATE POLICY "Authenticated users can read npl_assets"
  ON public.npl_assets FOR SELECT TO authenticated
  USING (true);

-- Anon users can see basic listing data
CREATE POLICY "Anon users can read npl_assets"
  ON public.npl_assets FOR SELECT TO anon
  USING (true);

-- Only service role can insert/update (admin import)
-- No INSERT/UPDATE/DELETE policies for regular users