
-- =============================================
-- FASE 2A: ENRIQUECER PERFILES DE INVERSOR
-- =============================================

-- Tipo de persona
CREATE TYPE public.persona_tipo AS ENUM ('fisica', 'juridica');

-- Perfil de inversor
CREATE TYPE public.investor_level AS ENUM ('principiante', 'intermedio', 'avanzado', 'profesional');

-- Añadir campos al perfil existente
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS persona_tipo persona_tipo DEFAULT 'fisica',
  ADD COLUMN IF NOT EXISTS empresa text,
  ADD COLUMN IF NOT EXISTS cif_nif text,
  ADD COLUMN IF NOT EXISTS comunidad_autonoma text,
  ADD COLUMN IF NOT EXISTS ciudad text,
  ADD COLUMN IF NOT EXISTS investor_level investor_level DEFAULT 'principiante',
  ADD COLUMN IF NOT EXISTS presupuesto_min numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS presupuesto_max numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS intereses text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tipos_activo_preferidos text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS provincias_interes text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS acepta_marketing boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS origen text,
  ADD COLUMN IF NOT EXISTS notas_admin text,
  ADD COLUMN IF NOT EXISTS ultima_actividad timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS num_ofertas integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS num_favoritos integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lead_score integer DEFAULT 0;

-- Índices para segmentación y búsquedas admin
CREATE INDEX idx_profiles_comunidad ON public.profiles (comunidad_autonoma);
CREATE INDEX idx_profiles_investor_level ON public.profiles (investor_level);
CREATE INDEX idx_profiles_lead_score ON public.profiles (lead_score DESC);
CREATE INDEX idx_profiles_ultima_actividad ON public.profiles (ultima_actividad DESC);

-- Función para calcular lead score automáticamente
CREATE OR REPLACE FUNCTION public.calculate_lead_score(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  score integer := 0;
  profile_rec record;
  fav_count integer;
  offer_count integer;
  alert_count integer;
  chat_count integer;
BEGIN
  -- Datos del perfil
  SELECT * INTO profile_rec FROM profiles WHERE user_id = p_user_id;
  IF NOT FOUND THEN RETURN 0; END IF;

  -- Perfil completado
  IF profile_rec.phone IS NOT NULL THEN score := score + 5; END IF;
  IF profile_rec.empresa IS NOT NULL THEN score := score + 5; END IF;
  IF profile_rec.comunidad_autonoma IS NOT NULL THEN score := score + 3; END IF;
  IF profile_rec.nda_signed THEN score := score + 15; END IF;
  IF profile_rec.persona_tipo = 'juridica' THEN score := score + 10; END IF;
  IF profile_rec.presupuesto_max > 100000 THEN score := score + 10; END IF;

  -- Actividad
  SELECT count(*) INTO fav_count FROM favorites WHERE user_id = p_user_id;
  score := score + LEAST(fav_count * 2, 20);

  SELECT count(*) INTO offer_count FROM offers WHERE email = (SELECT email FROM auth.users WHERE id = p_user_id);
  score := score + LEAST(offer_count * 10, 30);

  SELECT count(*) INTO alert_count FROM alerts WHERE user_id = p_user_id AND is_active = true;
  score := score + LEAST(alert_count * 5, 15);

  SELECT count(*) INTO chat_count FROM chat_conversations WHERE user_id = p_user_id;
  score := score + LEAST(chat_count * 3, 15);

  RETURN LEAST(score, 100);
END;
$$;

-- Función para actualizar lead score y contadores de un perfil
CREATE OR REPLACE FUNCTION public.refresh_profile_stats(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fav_count integer;
  offer_count integer;
  new_score integer;
BEGIN
  SELECT count(*) INTO fav_count FROM favorites WHERE user_id = p_user_id;
  SELECT count(*) INTO offer_count FROM offers WHERE email = (SELECT email FROM auth.users WHERE id = p_user_id);
  
  new_score := calculate_lead_score(p_user_id);

  UPDATE profiles
  SET num_favoritos = fav_count,
      num_ofertas = offer_count,
      lead_score = new_score,
      ultima_actividad = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Trigger: actualizar stats cuando se añade un favorito
CREATE OR REPLACE FUNCTION public.on_favorite_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM refresh_profile_stats(NEW.user_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM refresh_profile_stats(OLD.user_id);
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_favorite_change
AFTER INSERT OR DELETE ON public.favorites
FOR EACH ROW EXECUTE FUNCTION public.on_favorite_change();

-- Política para que admins vean todos los perfiles (para CRM)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Política para que admins actualicen perfiles (notas, lead_score)
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
