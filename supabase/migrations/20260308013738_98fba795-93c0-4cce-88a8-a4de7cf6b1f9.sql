
-- Fix overly permissive INSERT policy on activity_log
DROP POLICY "System can insert activity log" ON public.activity_log;
CREATE POLICY "Authenticated users can log activity" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
