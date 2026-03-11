
-- Table to store historical/sold assets
CREATE TABLE public.oportunidades_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  npl_asset_id uuid NOT NULL,
  asset_id text,
  ref_catastral text,
  municipio text,
  provincia text,
  comunidad_autonoma text,
  tipo_activo text,
  direccion text,
  servicer text,
  cartera text,
  valor_activo numeric DEFAULT 0,
  valor_mercado numeric DEFAULT 0,
  precio_orientativo numeric DEFAULT 0,
  deuda_ob numeric DEFAULT 0,
  sqm numeric DEFAULT 0,
  estado_ocupacional text,
  tipo_procedimiento text,
  estado_judicial text,
  fase_judicial text,
  motivo text NOT NULL DEFAULT 'vendido',
  fecha_cierre timestamp with time zone NOT NULL DEFAULT now(),
  snapshot_data jsonb DEFAULT '{}',
  imported_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.oportunidades_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage historico"
  ON public.oportunidades_historico FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Team can read historico"
  ON public.oportunidades_historico FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'analista'::app_role) OR
    has_role(auth.uid(), 'comercial'::app_role) OR
    has_role(auth.uid(), 'finanzas'::app_role) OR
    has_role(auth.uid(), 'legal'::app_role)
  );

-- Index for fast lookups
CREATE INDEX idx_historico_asset_id ON public.oportunidades_historico(asset_id);
CREATE INDEX idx_historico_ref_catastral ON public.oportunidades_historico(ref_catastral);
CREATE INDEX idx_historico_fecha ON public.oportunidades_historico(fecha_cierre DESC);
