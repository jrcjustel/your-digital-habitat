
-- Fix: hacer la vista security invoker para que respete RLS del usuario que consulta
ALTER VIEW public.oportunidades SET (security_invoker = true);
