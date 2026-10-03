drop policy if exists "send dms to friends" on public.direct_messages;

create policy "send dms to friends or existing threads"
on public.direct_messages
for insert
to authenticated
with check (
  auth.uid() = sender_id
  and (
    exists (
      select 1 from public.friendships f
      where f.status = 'accepted'
        and ((f.requester_id = auth.uid() and f.addressee_id = direct_messages.recipient_id)
          or (f.addressee_id = auth.uid() and f.requester_id = direct_messages.recipient_id))
    )
    or exists (
      select 1 from public.direct_messages d
      where (d.sender_id = auth.uid() and d.recipient_id = direct_messages.recipient_id)
         or (d.recipient_id = auth.uid() and d.sender_id = direct_messages.recipient_id)
    )
  )
);