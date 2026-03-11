
-- =============================================
-- FASE 1: ROLES IKESA + BD COMPLETA
-- =============================================

-- 1. Ampliar enum app_role con roles del equipo Ikesa
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'comercial';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'analista';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'legal';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finanzas';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'marketing';
