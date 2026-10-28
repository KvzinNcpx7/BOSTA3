-- Additive migration. Run AFTER 001. Does not change leagues, rankings or accounts.
begin;
create table if not exists public.game_saves (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 1048576),
 revision bigint not null default 1 check (revision > 0),
 updated_at timestamptz not null default now()
);
alter table public.game_saves enable row level security;
revoke all on public.game_saves from anon, authenticated;
grant select on public.game_saves to authenticated;
drop policy if exists private_save_read on public.game_saves;
create policy private_save_read on public.game_saves for select to authenticated using(owner_id=auth.uid());
-- Optimistic lock: a stale browser cannot overwrite a newer revision.
create or replace function public.save_game(p_owner uuid, p_expected bigint, p_payload jsonb)
returns bigint language plpgsql security definer set search_path = '' as $$
declare next_revision bigint;
begin
 if auth.uid() is null or p_owner is distinct from auth.uid() then raise exception 'Authentication required'; end if;
 if p_expected < 0 or p_expected is null then raise exception 'Invalid revision'; end if;
 if p_payload is null or jsonb_typeof(p_payload) <> 'object' or octet_length(p_payload::text) > 1048576
    or (p_payload->>'version') is distinct from '2' then raise exception 'Invalid save'; end if;
 if p_expected = 0 then
  insert into public.game_saves(owner_id,payload) values(p_owner,p_payload)
   on conflict(owner_id) do nothing returning revision into next_revision;
 else
  update public.game_saves set payload=p_payload,revision=revision+1,updated_at=now()
   where owner_id=p_owner and revision=p_expected returning revision into next_revision;
 end if;
 if next_revision is null then raise exception 'SAVE_CONFLICT'; end if;
 return next_revision;
end; $$;
revoke all on function public.save_game(uuid,bigint,jsonb) from public,anon;
grant execute on function public.save_game(uuid,bigint,jsonb) to authenticated;
commit;
