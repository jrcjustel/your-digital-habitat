
-- Enum for channel types
CREATE TYPE public.channel_type AS ENUM ('whatsapp', 'telegram', 'whatsapp_channel', 'telegram_channel');

-- Subscribers table
CREATE TABLE public.channel_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  channel channel_type NOT NULL,
  external_id text, -- WhatsApp phone or Telegram chat_id
  display_name text,
  is_active boolean NOT NULL DEFAULT true,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  segments text[] NOT NULL DEFAULT '{}',
  subscribed_at timestamp with time zone NOT NULL DEFAULT now(),
  unsubscribed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(channel, external_id)
);

-- RLS
ALTER TABLE public.channel_subscribers ENABLE ROW LEVEL SECURITY;

-- Admins can manage all subscribers
CREATE POLICY "Admins can manage subscribers"
ON public.channel_subscribers FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
ON public.channel_subscribers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can subscribe themselves
CREATE POLICY "Users can subscribe"
ON public.channel_subscribers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions"
ON public.channel_subscribers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Broadcast messages log
CREATE TABLE public.broadcast_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel channel_type NOT NULL,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  sent_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  sent_at timestamp with time zone
);

ALTER TABLE public.broadcast_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage broadcasts"
ON public.broadcast_messages FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger for subscribers
CREATE TRIGGER update_channel_subscribers_updated_at
  BEFORE UPDATE ON public.channel_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
