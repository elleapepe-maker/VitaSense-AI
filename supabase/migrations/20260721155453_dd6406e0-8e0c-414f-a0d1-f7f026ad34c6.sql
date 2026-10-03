
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS feature_on_home boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "Public can view good reviews" ON public.reviews;
CREATE POLICY "Public can view good reviews"
  ON public.reviews FOR SELECT
  USING (rating >= 4 AND body IS NOT NULL AND length(trim(body)) > 0 AND feature_on_home = true);
