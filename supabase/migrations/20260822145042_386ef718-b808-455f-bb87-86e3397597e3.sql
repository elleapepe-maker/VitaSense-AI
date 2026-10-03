DROP POLICY IF EXISTS "Public can view good reviews" ON public.reviews;

CREATE POLICY "Public can view featured reviews"
ON public.reviews FOR SELECT TO anon, authenticated
USING (feature_on_home = true);

CREATE OR REPLACE FUNCTION public.review_stats()
RETURNS TABLE (total bigint, average numeric, s1 bigint, s2 bigint, s3 bigint, s4 bigint, s5 bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::bigint,
         COALESCE(round(avg(rating)::numeric, 2), 0),
         count(*) FILTER (WHERE rating = 1)::bigint,
         count(*) FILTER (WHERE rating = 2)::bigint,
         count(*) FILTER (WHERE rating = 3)::bigint,
         count(*) FILTER (WHERE rating = 4)::bigint,
         count(*) FILTER (WHERE rating = 5)::bigint
  FROM public.reviews;
$$;

GRANT EXECUTE ON FUNCTION public.review_stats() TO anon, authenticated;