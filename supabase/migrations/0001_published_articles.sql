create table if not exists public.teacher_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.teacher_emails enable row level security;

create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.teacher_emails
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

revoke all on function public.is_teacher() from public;
grant execute on function public.is_teacher() to authenticated;

-- El primer usuario que se cree en Authentication queda como docente.
-- Si ya existe un usuario, este bloque lo registra como docente.
create or replace function public.claim_first_teacher()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.teacher_emails) and new.email is not null then
    insert into public.teacher_emails (email)
    values (new.email)
    on conflict (email) do nothing;
  end if;
  return new;
end;
$$;

revoke all on function public.claim_first_teacher() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_claim_teacher on auth.users;
create trigger on_auth_user_created_claim_teacher
  after insert on auth.users
  for each row execute function public.claim_first_teacher();

insert into public.teacher_emails (email)
select email
from auth.users
where email is not null
  and not exists (select 1 from public.teacher_emails)
order by created_at
limit 1
on conflict (email) do nothing;

create table if not exists public.published_articles (
  slug text primary key,
  published_at timestamptz not null default now(),
  published_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists published_articles_published_at_idx
  on public.published_articles (published_at desc);

alter table public.published_articles enable row level security;

drop policy if exists "published articles are public" on public.published_articles;
create policy "published articles are public"
  on public.published_articles
  for select
  to anon, authenticated
  using (true);

drop policy if exists "teachers can publish" on public.published_articles;
create policy "teachers can publish"
  on public.published_articles
  for insert
  to authenticated
  with check (public.is_teacher());

drop policy if exists "teachers can update publications" on public.published_articles;
create policy "teachers can update publications"
  on public.published_articles
  for update
  to authenticated
  using (public.is_teacher())
  with check (public.is_teacher());

drop policy if exists "teachers can unpublish" on public.published_articles;
create policy "teachers can unpublish"
  on public.published_articles
  for delete
  to authenticated
  using (public.is_teacher());
