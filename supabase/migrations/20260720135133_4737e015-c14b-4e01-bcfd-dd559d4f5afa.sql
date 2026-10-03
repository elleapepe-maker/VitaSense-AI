CREATE POLICY "friends can view profile" ON public.profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.friendships f
    WHERE (
      (f.requester_id = auth.uid() AND f.addressee_id = profiles.id)
      OR (f.addressee_id = auth.uid() AND f.requester_id = profiles.id)
    )
  )
);