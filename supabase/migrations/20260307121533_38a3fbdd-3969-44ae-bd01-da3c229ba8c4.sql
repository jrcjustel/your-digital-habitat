
-- Add postura_subasta and propiedad_sin_posesion fields to match Fencia's 4 transaction types
ALTER TABLE public.npl_assets 
ADD COLUMN IF NOT EXISTS postura_subasta boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS propiedad_sin_posesion boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS codigo_postal text,
ADD COLUMN IF NOT EXISTS anio_construccion integer,
ADD COLUMN IF NOT EXISTS vpo boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS judicializado boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS fase_judicial text,
ADD COLUMN IF NOT EXISTS referencia_fencia text,
ADD COLUMN IF NOT EXISTS valor_mercado numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS precio_orientativo numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS num_titulares integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS descripcion text,
ADD COLUMN IF NOT EXISTS deposito_porcentaje numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS comision_porcentaje numeric DEFAULT 0;
