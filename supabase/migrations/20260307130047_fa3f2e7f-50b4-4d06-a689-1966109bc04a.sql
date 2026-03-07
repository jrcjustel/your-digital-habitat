CREATE TABLE public.valuation_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  direccion text NOT NULL,
  municipio text,
  provincia text,
  codigo_postal text,
  tipo_inmueble text NOT NULL,
  superficie_m2 numeric NOT NULL,
  habitaciones integer,
  banos integer,
  anio_construccion integer,
  estado text,
  planta integer,
  tiene_garaje boolean DEFAULT false,
  tiene_trastero boolean DEFAULT false,
  tiene_ascensor boolean DEFAULT false,
  nombre text NOT NULL,
  email text NOT NULL,
  telefono text,
  valor_estimado_min numeric,
  valor_estimado_max numeric,
  valor_estimado_medio numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.valuation_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert valuation leads" ON public.valuation_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view valuation leads" ON public.valuation_leads FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));