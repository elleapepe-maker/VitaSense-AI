REVOKE ALL ON FUNCTION public.notify_direct_message() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_review_reply() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.reviews_alias_name() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.reviews_set_updated_at() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.has_active_subscription(uuid, text) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.review_stats() FROM anon;
GRANT EXECUTE ON FUNCTION public.review_stats() TO anon, authenticated;