
create or replace function public.dm_review_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
    'Your rating ' || repeat('⭐', greatest(1, least(5, coalesce(r.rating, 5)))) ||
    case when coalesce(r.body, '') <> '' then E'\n"' || r.body || '"' else '' end ||
    E'\n\nMy reply: ' || NEW.body
  );
  return NEW;
end;
$$;

revoke all on function public.dm_review_reply() from anon, authenticated;

drop trigger if exists dm_review_reply_trg on public.review_replies;
create trigger dm_review_reply_trg
after insert on public.review_replies
for each row execute function public.dm_review_reply();

drop policy if exists "dm partners can view profile" on public.profiles;
create policy "dm partners can view profile"
on public.profiles for select
to authenticated
using (exists (
  select 1 from public.direct_messages d
  where (d.sender_id = auth.uid() and d.recipient_id = profiles.id)
     or (d.recipient_id = auth.uid() and d.sender_id = profiles.id)
));
