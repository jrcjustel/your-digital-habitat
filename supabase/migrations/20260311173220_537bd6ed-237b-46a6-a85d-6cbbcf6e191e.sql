
-- 3. Tabla auxiliar oportunidades_extra (campos adicionales no presentes en npl_assets)
CREATE TABLE public.oportunidades_extra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  npl_asset_id uuid NOT NULL UNIQUE REFERENCES public.npl_assets(id) ON DELETE CASCADE,
  gastos_fiscales numeric DEFAULT 0,
  gastos_judiciales numeric DEFAULT 0,
  gastos_notariales numeric DEFAULT 0,
  gastos_reforma numeric DEFAULT 0,
  notas text,
  fecha_publicacion timestamptz,
  score_inversion integer DEFAULT 0,
  riesgo_judicial integer DEFAULT 0,
  liquidez_score integer DEFAULT 0,
  tir_estimada numeric DEFAULT 0,
  roi_estimado numeric DEFAULT 0,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.oportunidades_extra ENABLE ROW LEVEL SECURITY;

-- Lectura para autenticados
CREATE POLICY "Authenticated can read oportunidades_extra"
  ON public.oportunidades_extra FOR SELECT TO authenticated
  USING (true);

-- Escritura para roles con permiso
CREATE POLICY "Writers can manage oportunidades_extra"
  ON public.oportunidades_extra FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'comercial') OR
    public.has_role(auth.uid(), 'analista')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'comercial') OR
    public.has_role(auth.uid(), 'analista')
  );

-- 4. Vista unificada oportunidades
CREATE OR REPLACE VIEW public.oportunidades AS
SELECT
  n.id,
  n.asset_id AS referencia,
  n.tipo_activo,
  n.precio_orientativo AS precio_compra,
  n.valor_mercado,
  n.valor_activo,
  n.deuda_ob AS deuda_pendiente,
  n.comunidad_autonoma,
  n.provincia,
  n.municipio,
  n.direccion,
  n.codigo_postal,
  n.ref_catastral,
  n.sqm AS superficie_m2,
  n.estado,
  n.estado_ocupacional,
  n.estado_judicial,
  n.fase_judicial,
  n.tipo_procedimiento,
  n.servicer,
  n.cartera,
  n.cesion_credito,
  n.cesion_remate,
  n.judicializado,
  n.vpo,
  n.publicado,
  n.descripcion,
  n.created_at,
  -- Campos extra
  COALESCE(e.gastos_fiscales, 0) AS gastos_fiscales,
  COALESCE(e.gastos_judiciales, 0) AS gastos_judiciales,
  COALESCE(e.gastos_notariales, 0) AS gastos_notariales,
  COALESCE(e.gastos_reforma, 0) AS gastos_reforma,
  e.notas,
  e.fecha_publicacion,
  COALESCE(e.score_inversion, 0) AS score_inversion,
  COALESCE(e.riesgo_judicial, 0) AS riesgo_judicial,
  COALESCE(e.liquidez_score, 0) AS liquidez_score,
  COALESCE(e.tir_estimada, 0) AS tir_estimada,
  COALESCE(e.roi_estimado, 0) AS roi_estimado,
  -- Cálculos derivados
  CASE WHEN n.valor_mercado > 0 AND n.precio_orientativo > 0
    THEN ROUND(((n.valor_mercado - n.precio_orientativo) / n.precio_orientativo * 100)::numeric, 2)
    ELSE 0
  END AS margen_bruto_pct,
  CASE WHEN n.valor_mercado > 0 AND n.precio_orientativo > 0
    THEN ROUND((n.valor_mercado - n.precio_orientativo - COALESCE(e.gastos_fiscales, 0) - COALESCE(e.gastos_judiciales, 0) - COALESCE(e.gastos_notariales, 0) - COALESCE(e.gastos_reforma, 0))::numeric, 2)
    ELSE 0
  END AS margen_neto
FROM public.npl_assets n
LEFT JOIN public.oportunidades_extra e ON e.npl_asset_id = n.id;

-- Índices para rendimiento
CREATE INDEX idx_oportunidades_extra_asset ON public.oportunidades_extra(npl_asset_id);
CREATE INDEX idx_npl_tipo_activo ON public.npl_assets(tipo_activo);
CREATE INDEX idx_npl_comunidad ON public.npl_assets(comunidad_autonoma);
CREATE INDEX idx_npl_estado ON public.npl_assets(estado);
CREATE INDEX idx_npl_provincia ON public.npl_assets(provincia);
CREATE INDEX idx_npl_publicado ON public.npl_assets(publicado);
