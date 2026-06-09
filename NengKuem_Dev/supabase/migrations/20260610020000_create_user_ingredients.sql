-- 냉큼 사용자별 식재료 저장 테이블입니다.
-- Supabase SQL Editor에서 이 파일 내용을 실행하면 로그인한 사용자별로 식재료가 분리 저장됩니다.

create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id text not null,
  name text not null,
  custom_name text,
  emoji text not null default '',
  rank integer,
  icon_src text,
  storage_section text not null check (storage_section in ('freezer', 'fridge')),
  expiry_date date,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ingredients_user_id_idx on public.ingredients (user_id);
create index if not exists ingredients_user_section_idx on public.ingredients (user_id, storage_section);
create index if not exists ingredients_user_expiry_idx on public.ingredients (user_id, expiry_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_ingredients_updated_at on public.ingredients;
create trigger set_ingredients_updated_at
before update on public.ingredients
for each row
execute function public.set_updated_at();

alter table public.ingredients enable row level security;

drop policy if exists "Users can read own ingredients" on public.ingredients;
create policy "Users can read own ingredients"
on public.ingredients
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own ingredients" on public.ingredients;
create policy "Users can create own ingredients"
on public.ingredients
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own ingredients" on public.ingredients;
create policy "Users can update own ingredients"
on public.ingredients
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own ingredients" on public.ingredients;
create policy "Users can delete own ingredients"
on public.ingredients
for delete
to authenticated
using (auth.uid() = user_id);
