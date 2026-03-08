
-- =============================================
-- FASE 1B: CORREGIR RLS PERMISIVAS
-- =============================================

-- OFFERS: Actualmente "Anyone can submit offers" usa WITH CHECK (true)
-- Problema: cualquier usuario anónimo puede insertar ofertas sin control
-- Solución: Requerir que el email no esté vacío y los campos obligatorios estén completos
DROP POLICY "Anyone can submit offers" ON public.offers;
CREATE POLICY "Authenticated users can submit offers"
ON public.offers FOR INSERT
TO authenticated
WITH CHECK (
  email IS NOT NULL AND
  full_name IS NOT NULL AND
  offer_amount > 0 AND
  property_id IS NOT NULL
);

-- Permitir a admins gestionar todas las ofertas
CREATE POLICY "Admins can manage all offers"
ON public.offers FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- VALUATION_LEADS: Actualmente "Anyone can insert valuation leads" usa WITH CHECK (true)
-- Mantener público (formulario de valoración no requiere login) pero validar campos
DROP POLICY "Anyone can insert valuation leads" ON public.valuation_leads;
CREATE POLICY "Anyone can submit valuation leads with valid data"
ON public.valuation_leads FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL AND
  nombre IS NOT NULL AND
  direccion IS NOT NULL AND
  superficie_m2 > 0 AND
  tipo_inmueble IS NOT NULL
);
