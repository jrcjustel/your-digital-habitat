
CREATE TABLE public.alert_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.npl_assets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  matched_criteria jsonb DEFAULT '{}'::jsonb,
  is_read boolean NOT NULL DEFAULT false,
  notified_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(alert_id, asset_id)
);

ALTER TABLE public.alert_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alert notifications"
  ON public.alert_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alert notifications"
  ON public.alert_notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications"
  ON public.alert_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all notifications"
  ON public.alert_notifications FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
