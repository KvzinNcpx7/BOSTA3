-- Execute once in the Supabase SQL Editor. No service-role key belongs in the site.
begin;
create table public.players (
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 3 and 40),
 avatar text not null check (char_length(avatar) between 1 and 12),
 title text not null check (char_length(title) between 1 and 80),
 wealth numeric(20,2) not null check (wealth >= 0 and wealth <= 1000000000000000),
 xp bigint not null check (xp between 0 and 1000000000000),
 updated_at timestamptz not null default now()
);
create table public.clubs (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(name) between 3 and 50),
 owner_id uuid not null references auth.users(id) on delete cascade,
 invite_code text not null unique default replace(gen_random_uuid()::text,'-',''),
 created_at timestamptz not null default now()
);
create table public.club_members (
 club_id uuid references public.clubs(id) on delete cascade,
 player_id uuid references auth.users(id) on delete cascade,
 primary key(club_id,player_id)
);
alter table public.players enable row level security;
alter table public.clubs enable row level security;
alter table public.club_members enable row level security;
create function public.is_club_member(target uuid) returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.club_members where club_id=target and player_id=auth.uid());
$$;
revoke all on function public.is_club_member(uuid) from public,anon;
grant execute on function public.is_club_member(uuid) to authenticated;
create policy own_player_read on public.players for select to authenticated using (id=auth.uid());
create policy own_player_insert on public.players for insert to authenticated with check(id=auth.uid());
create policy own_player_update on public.players for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy member_club_read on public.clubs for select to authenticated using(public.is_club_member(id));
create policy own_membership_read on public.club_members for select to authenticated using(player_id=auth.uid());
-- All membership writes go through these checked RPCs, never direct table access.
create function public.create_club(club_name text) returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid; actor uuid:=auth.uid();
begin
 if actor is null then raise exception 'Authentication required'; end if;
 perform pg_advisory_xact_lock(hashtext(actor::text));
 if (select count(*) from public.club_members where player_id=actor)>=20 then raise exception 'Club limit reached'; end if;
 if char_length(trim(club_name)) not between 3 and 50 then raise exception 'Invalid name'; end if;
 insert into public.clubs(name,owner_id) values(trim(club_name),actor) returning id into new_id;
 insert into public.club_members values(new_id,actor);
 return new_id;
end; $$;
create function public.join_club(code text) returns uuid language plpgsql security definer set search_path = '' as $$
declare target uuid; actor uuid:=auth.uid();
begin
 if actor is null then raise exception 'Authentication required'; end if;
 perform pg_advisory_xact_lock(hashtext(actor::text));
 select id into target from public.clubs where invite_code=lower(trim(code));
 if target is null then raise exception 'Invalid invitation'; end if;
 if public.is_club_member(target) then return target; end if;
 if (select count(*) from public.club_members where player_id=actor)>=20 then raise exception 'Club limit reached'; end if;
 insert into public.club_members values(target,actor);
 return target;
end; $$;
create function public.club_ranking(club_id uuid) returns table(id uuid,name text,avatar text,title text,wealth numeric,xp bigint,updated_at timestamptz) language plpgsql stable security definer set search_path = '' as $$
begin
 if auth.uid() is null or not public.is_club_member(club_id) then raise exception 'Membership required'; end if;
 return query select p.id,p.name,p.avatar,p.title,p.wealth,p.xp,p.updated_at from public.players p join public.club_members m on m.player_id=p.id where m.club_id=club_ranking.club_id order by p.wealth desc,p.xp desc,p.id limit 100;
end; $$;
revoke all on function public.create_club(text),public.join_club(text),public.club_ranking(uuid) from public,anon;
grant execute on function public.create_club(text),public.join_club(text),public.club_ranking(uuid) to authenticated;
grant select,insert,update on public.players to authenticated;
grant select on public.clubs,public.club_members to authenticated;
revoke all on public.players,public.clubs,public.club_members from anon;
revoke insert,update,delete on public.clubs,public.club_members from authenticated;
commit;
