
DROP POLICY "Anyone can insert contact" ON public.contact_log;
CREATE POLICY "Authenticated users can insert own contact" ON public.contact_log
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
