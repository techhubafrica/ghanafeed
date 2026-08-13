DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
REVOKE INSERT, SELECT, UPDATE, DELETE ON public.newsletter_subscribers FROM anon, authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT newsletter_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 254);