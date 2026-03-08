
-- Analytics snapshots table for daily KPI tracking
CREATE TABLE public.analytics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  total_assets integer DEFAULT 0,
  published_assets integer DEFAULT 0,
  total_users integer DEFAULT 0,
  total_offers integer DEFAULT 0,
  pending_offers integer DEFAULT 0,
  total_leads integer DEFAULT 0,
  total_subscribers integer DEFAULT 0,
  avg_lead_score numeric DEFAULT 0,
  assets_by_type jsonb DEFAULT '{}'::jsonb,
  assets_by_province jsonb DEFAULT '{}'::jsonb,
  offers_by_status jsonb DEFAULT '{}'::jsonb,
  conversion_rate numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(snapshot_date)
);

ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage analytics snapshots"
  ON public.analytics_snapshots FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable pg_cron and pg_net for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
