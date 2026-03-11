
-- 2. Tabla roles_ikesa: permisos granulares por rol
CREATE TABLE public.roles_ikesa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_rol text NOT NULL UNIQUE,
  puede_leer boolean NOT NULL DEFAULT true,
  puede_escribir boolean NOT NULL DEFAULT false,
  puede_exportar boolean NOT NULL DEFAULT false,
  puede_generar_pdf boolean NOT NULL DEFAULT false,
  puede_administrar_usuarios boolean NOT NULL DEFAULT false,
  puede_importar_excel boolean NOT NULL DEFAULT false,
  puede_ver_financiero boolean NOT NULL DEFAULT false,
  puede_ver_legal boolean NOT NULL DEFAULT false,
  descripcion text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.roles_ikesa ENABLE ROW LEVEL SECURITY;

-- Solo admins gestionan roles_ikesa
CREATE POLICY "Admins can manage roles_ikesa"
  ON public.roles_ikesa FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Todos los autenticados pueden leer los roles (para saber sus permisos)
CREATE POLICY "Authenticated can read roles_ikesa"
  ON public.roles_ikesa FOR SELECT TO authenticated
  USING (true);

-- Insertar roles base del equipo Ikesa
INSERT INTO public.roles_ikesa (nombre_rol, puede_leer, puede_escribir, puede_exportar, puede_generar_pdf, puede_administrar_usuarios, puede_importar_excel, puede_ver_financiero, puede_ver_legal, descripcion) VALUES
  ('admin', true, true, true, true, true, true, true, true, 'Acceso total a la plataforma'),
  ('comercial', true, true, true, true, false, false, false, false, 'Gestión de oportunidades y clientes'),
  ('analista', true, false, true, true, false, false, true, false, 'Análisis de inversiones y scoring'),
  ('legal', true, false, true, true, false, false, false, true, 'Gestión jurídica y procedimientos'),
  ('finanzas', true, false, true, true, false, false, true, false, 'Control financiero y reportes'),
  ('marketing', true, false, true, false, false, false, false, false, 'Gestión de contenidos y comunicación'),
  ('cliente', true, false, false, false, false, false, false, false, 'Acceso a oportunidades publicadas');
