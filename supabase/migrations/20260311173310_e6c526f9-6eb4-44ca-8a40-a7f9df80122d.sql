
-- 7. Función has_permission: verifica permisos granulares del equipo Ikesa
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles_ikesa ri ON ri.nombre_rol = ur.role::text
    WHERE ur.user_id = _user_id
      AND (
        (_permission = 'leer' AND ri.puede_leer) OR
        (_permission = 'escribir' AND ri.puede_escribir) OR
        (_permission = 'exportar' AND ri.puede_exportar) OR
        (_permission = 'generar_pdf' AND ri.puede_generar_pdf) OR
        (_permission = 'administrar_usuarios' AND ri.puede_administrar_usuarios) OR
        (_permission = 'importar_excel' AND ri.puede_importar_excel) OR
        (_permission = 'ver_financiero' AND ri.puede_ver_financiero) OR
        (_permission = 'ver_legal' AND ri.puede_ver_legal)
      )
  )
$$;

-- 8. Función get_user_permissions: devuelve todos los permisos de un usuario
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT jsonb_build_object(
      'roles', (SELECT array_agg(ur.role::text) FROM public.user_roles ur WHERE ur.user_id = _user_id),
      'puede_leer', bool_or(ri.puede_leer),
      'puede_escribir', bool_or(ri.puede_escribir),
      'puede_exportar', bool_or(ri.puede_exportar),
      'puede_generar_pdf', bool_or(ri.puede_generar_pdf),
      'puede_administrar_usuarios', bool_or(ri.puede_administrar_usuarios),
      'puede_importar_excel', bool_or(ri.puede_importar_excel),
      'puede_ver_financiero', bool_or(ri.puede_ver_financiero),
      'puede_ver_legal', bool_or(ri.puede_ver_legal)
    )
    FROM public.user_roles ur
    JOIN public.roles_ikesa ri ON ri.nombre_rol = ur.role::text
    WHERE ur.user_id = _user_id),
    '{"roles": [], "puede_leer": false, "puede_escribir": false, "puede_exportar": false, "puede_generar_pdf": false, "puede_administrar_usuarios": false, "puede_importar_excel": false, "puede_ver_financiero": false, "puede_ver_legal": false}'::jsonb
  )
$$;

-- 9. Trigger updated_at para oportunidades_extra
CREATE TRIGGER set_updated_at_oportunidades_extra
  BEFORE UPDATE ON public.oportunidades_extra
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Trigger updated_at para inversiones
CREATE TRIGGER set_updated_at_inversiones
  BEFORE UPDATE ON public.inversiones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
