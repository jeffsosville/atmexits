-- Private buyer threads: every message and offer belongs to one buyer (by email),
-- so buyers only see their own conversation and offers. Safe to apply before deploy
-- (new nullable columns; old code ignores them).
alter table public.messages add column if not exists buyer_email text;
alter table public.offers   add column if not exists buyer_email text;
create index if not exists messages_room_buyer_idx on public.messages (deal_room_id, buyer_email);
create index if not exists offers_room_buyer_idx   on public.offers (deal_room_id, buyer_email);

-- Backfill: the only real buyer messages so far are Reed Parkhurst's (Aug 1)
update public.messages set buyer_email = 'bombedo@enterprise144.com'
where sender_name = 'Reed Parkhurst' and buyer_email is null;
