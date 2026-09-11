-- Lock down public (anon-key) access to ATMExits data.
-- APPLY ONLY AFTER the fix/lock-down-admin code is deployed: the old admin
-- pages read these tables with the public key and will stop working.
--
-- Server code (API routes, getServerSideProps) uses the service role key,
-- which bypasses RLS, so buyer NDA / deal room / offer flows are unaffected.
-- The only remaining browser-side access is the seller portal (Supabase auth),
-- which gets owner-scoped policies below.

-- listings_pending: submissions contain seller name/email/phone in notes
drop policy if exists "Service role can read all listings" on public.listings_pending;
drop policy if exists "Service role can update listings" on public.listings_pending;
drop policy if exists "Anyone can submit a listing" on public.listings_pending; -- /api/submit-listing uses service role
create policy "Sellers read own listings" on public.listings_pending
  for select to authenticated using (seller_id = auth.uid());

-- ndas
drop policy if exists "Service role reads NDAs" on public.ndas;
drop policy if exists "Anyone can insert NDA" on public.ndas; -- /api/nda-submit uses service role
create policy "Sellers read NDAs on own listings" on public.ndas
  for select to authenticated using (
    exists (select 1 from public.deal_rooms d where d.listing_id = ndas.listing_id and d.seller_id = auth.uid())
  );

-- deal_rooms
drop policy if exists "Anyone can select deal rooms" on public.deal_rooms;
drop policy if exists "Anyone can insert deal room" on public.deal_rooms;
create policy "Sellers read own deal rooms" on public.deal_rooms
  for select to authenticated using (seller_id = auth.uid());

-- messages
drop policy if exists "Anyone can read messages" on public.messages;
drop policy if exists "Anyone can insert messages" on public.messages; -- /api/deal-room/message uses service role
create policy "Sellers read messages in own deal rooms" on public.messages
  for select to authenticated using (
    exists (select 1 from public.deal_rooms d where d.id = messages.deal_room_id and d.seller_id = auth.uid())
  );
create policy "Sellers post in own deal rooms" on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid()
    and exists (select 1 from public.deal_rooms d where d.id = messages.deal_room_id and d.seller_id = auth.uid())
  );

-- offers
drop policy if exists "Anyone can read offers" on public.offers;
drop policy if exists "Anyone can insert offers" on public.offers; -- /api/deal-room/offer uses service role
create policy "Sellers read offers in own deal rooms" on public.offers
  for select to authenticated using (
    exists (select 1 from public.deal_rooms d where d.id = offers.deal_room_id and d.seller_id = auth.uid())
  );

-- users: "insert anything" policy lets anyone create arbitrary rows (including role='admin').
-- users_self_manage already allows a signed-in user to insert/update their own row.
drop policy if exists "Anyone can insert their own user record" on public.users;
