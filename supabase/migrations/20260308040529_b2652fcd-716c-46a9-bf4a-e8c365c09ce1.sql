
-- Gestores (zone managers) table
CREATE TABLE public.gestores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text NOT NULL,
  telefono text,
  whatsapp text,
  comunidades_autonomas text[] NOT NULL DEFAULT '{}',
  provincias text[] NOT NULL DEFAULT '{}',
  tipos_activo text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gestores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage gestores" ON public.gestores
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read active gestores" ON public.gestores
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Contact log table for tracking all incoming contacts and auto-responses
CREATE TABLE public.contact_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_name text,
  lead_email text,
  lead_phone text,
  channel text NOT NULL DEFAULT 'web',
  asset_id uuid REFERENCES public.npl_assets(id),
  asset_reference text,
  provincia text,
  comunidad_autonoma text,
  message text,
  ai_response text,
  gestor_id uuid REFERENCES public.gestores(id),
  gestor_notified boolean NOT NULL DEFAULT false,
  gestor_notified_at timestamptz,
  user_id uuid,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage contact log" ON public.contact_log
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own contacts" ON public.contact_log
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert contact" ON public.contact_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Trigger to update updated_at on gestores
CREATE TRIGGER update_gestores_updated_at
  BEFORE UPDATE ON public.gestores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
