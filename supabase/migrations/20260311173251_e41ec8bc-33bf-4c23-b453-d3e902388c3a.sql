
-- 5. Tabla inversiones
CREATE TABLE public.inversiones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidad_id uuid NOT NULL REFERENCES public.npl_assets(id) ON DELETE CASCADE,
  inversion_total numeric NOT NULL DEFAULT 0,
  precio_compra numeric NOT NULL DEFAULT 0,
  gastos_totales numeric NOT NULL DEFAULT 0,
  valor_venta_estimado numeric DEFAULT 0,
  tir numeric DEFAULT 0,
  roi numeric DEFAULT 0,
  margen_neto numeric DEFAULT 0,
  duracion_meses integer DEFAULT 12,
  estado text NOT NULL DEFAULT 'activa',
  fecha_inversion timestamptz NOT NULL DEFAULT now(),
  fecha_cierre timestamptz,
  notas text,
  creado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inversiones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and finanzas can manage inversiones"
  ON public.inversiones FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'finanzas') OR
    public.has_role(auth.uid(), 'analista')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'finanzas') OR
    public.has_role(auth.uid(), 'analista')
  );

CREATE POLICY "Comercial can read inversiones"
  ON public.inversiones FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'comercial')
  );

CREATE INDEX idx_inversiones_oportunidad ON public.inversiones(oportunidad_id);
CREATE INDEX idx_inversiones_estado ON public.inversiones(estado);

-- 6. Tabla historial_cambios
CREATE TABLE public.historial_cambios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entidad_tipo text NOT NULL,
  entidad_id uuid NOT NULL,
  campo_modificado text NOT NULL,
  valor_anterior text,
  valor_nuevo text,
  usuario_id uuid,
  usuario_nombre text,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.historial_cambios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage historial"
  ON public.historial_cambios FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Team can read historial"
  ON public.historial_cambios FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'analista') OR
    public.has_role(auth.uid(), 'comercial') OR
    public.has_role(auth.uid(), 'finanzas') OR
    public.has_role(auth.uid(), 'legal')
  );

-- Insertar historial automáticamente
CREATE POLICY "Team can insert historial"
  ON public.historial_cambios FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'comercial') OR
    public.has_role(auth.uid(), 'analista') OR
    public.has_role(auth.uid(), 'finanzas') OR
    public.has_role(auth.uid(), 'legal')
  );

CREATE INDEX idx_historial_entidad ON public.historial_cambios(entidad_tipo, entidad_id);
CREATE INDEX idx_historial_fecha ON public.historial_cambios(created_at DESC);
