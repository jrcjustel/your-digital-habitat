
-- Social posts table for managing social media content
CREATE TABLE public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL CHECK (channel IN ('twitter', 'telegram', 'whatsapp', 'linkedin')),
  content text NOT NULL,
  media_url text,
  asset_id uuid REFERENCES public.npl_assets(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed')),
  scheduled_at timestamptz,
  published_at timestamptz,
  ai_generated boolean DEFAULT false,
  metrics jsonb DEFAULT '{"impressions": 0, "clicks": 0, "engagement": 0, "leads": 0}'::jsonb,
  error_message text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage social posts"
  ON public.social_posts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
