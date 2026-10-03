CREATE OR REPLACE FUNCTION public.dm_review_reply()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  r record;
begin
  select user_id, display_name, rating, body into r from public.reviews where id = NEW.review_id;
  if r.user_id is null or r.user_id = NEW.author_id then
    return NEW;
  end if;

  insert into public.direct_messages (sender_id, recipient_id, body)
  values (
    NEW.author_id,
    r.user_id,
    '↩ ' || repeat('⭐', greatest(1, least(5, coalesce(r.rating, 5)))) ||
    case when coalesce(r.body, '') <> '' then E'\n' || r.body else '' end ||
    E'\n\n' || NEW.body
  );
  return NEW;
end;
$function$;

REVOKE ALL ON FUNCTION public.dm_review_reply() FROM PUBLIC, anon, authenticated;

UPDATE public.direct_messages
SET body = regexp_replace(
      regexp_replace(body, '^Your rating ', '↩ '),
      E'\n\nMy reply: ', E'\n\n'
    )
WHERE body LIKE 'Your rating %';

UPDATE public.direct_messages
SET body = replace(replace(body, E'\n"', E'\n'), E'"\n\n', E'\n\n')
WHERE body LIKE '↩ %';