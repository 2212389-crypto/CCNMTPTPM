-- Supabase schema for Expense Manager
-- Auth + Database + RLS policies

create extension if not exists pgcrypto;

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null,
  balance numeric(14,2) not null default 0,
  currency text not null default 'VND',
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references accounts(id) on delete cascade,
  amount numeric(14,2) not null,
  type text not null,
  note text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'user' check (role in ('admin', 'user')),
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  currency text not null default 'VND',
  theme text not null default 'light' check (theme in ('light', 'dark', 'system')),
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text,
  scope text not null default 'monthly' check (scope in ('weekly', 'monthly', 'yearly', 'category')),
  limit_amount numeric(14,2) not null,
  spent_amount numeric(14,2) not null default 0,
  threshold_70 boolean not null default true,
  threshold_90 boolean not null default true,
  threshold_100 boolean not null default true,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null default 'system' check (type in ('system', 'budget', 'report', 'security')),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  target_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_role text;
begin
  resolved_role := case when lower(coalesce(new.email, '')) = lower('2212389@dlu.edu.vn') then 'admin' else 'user' end;

  insert into user_roles (user_id, email, role)
  values (new.id, new.email, resolved_role)
  on conflict (user_id) do update
    set email = excluded.email,
        role = excluded.role,
        updated_at = now();

  insert into user_settings (user_id, display_name)
  values (new.id, split_part(coalesce(new.email, 'user'), '@', 1))
  on conflict (user_id) do update
    set display_name = excluded.display_name,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure handle_new_user_profile();

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_user_roles_updated_at on user_roles;
create trigger touch_user_roles_updated_at before update on user_roles for each row execute procedure touch_updated_at();

drop trigger if exists touch_user_settings_updated_at on user_settings;
create trigger touch_user_settings_updated_at before update on user_settings for each row execute procedure touch_updated_at();

drop trigger if exists touch_budgets_updated_at on budgets;
create trigger touch_budgets_updated_at before update on budgets for each row execute procedure touch_updated_at();

alter table accounts enable row level security;
alter table transactions enable row level security;
alter table user_roles enable row level security;
alter table user_settings enable row level security;
alter table budgets enable row level security;
alter table notifications enable row level security;
alter table activity_logs enable row level security;

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from auth.users
    where id = auth.uid()
      and email = '2212389@dlu.edu.vn'
  );
$$;

drop policy if exists "accounts_select" on accounts;
create policy "accounts_select" on accounts
  for select using (auth.uid() = user_id or is_admin());

drop policy if exists "accounts_insert" on accounts;
create policy "accounts_insert" on accounts
  for insert with check (auth.uid() = user_id);

drop policy if exists "accounts_update" on accounts;
create policy "accounts_update" on accounts
  for update using (auth.uid() = user_id or is_admin())
  with check (auth.uid() = user_id or is_admin());

drop policy if exists "accounts_delete" on accounts;
create policy "accounts_delete" on accounts
  for delete using (auth.uid() = user_id or is_admin());

drop policy if exists "tx_select" on transactions;
create policy "tx_select" on transactions
  for select using (auth.uid() = user_id or is_admin());

drop policy if exists "tx_insert" on transactions;
create policy "tx_insert" on transactions
  for insert with check (auth.uid() = user_id);

drop policy if exists "tx_update" on transactions;
create policy "tx_update" on transactions
  for update using (auth.uid() = user_id or is_admin())
  with check (auth.uid() = user_id or is_admin());

drop policy if exists "tx_delete" on transactions;
create policy "tx_delete" on transactions
  for delete using (auth.uid() = user_id or is_admin());

drop policy if exists "budgets_select" on budgets;
create policy "budgets_select" on budgets
  for select using (auth.uid() = user_id or is_admin());

drop policy if exists "budgets_insert" on budgets;
create policy "budgets_insert" on budgets
  for insert with check (auth.uid() = user_id);

drop policy if exists "budgets_update" on budgets;
create policy "budgets_update" on budgets
  for update using (auth.uid() = user_id or is_admin())
  with check (auth.uid() = user_id or is_admin());

drop policy if exists "budgets_delete" on budgets;
create policy "budgets_delete" on budgets
  for delete using (auth.uid() = user_id or is_admin());

-- user_settings acts as the profiles table in this app
drop policy if exists "profiles_select" on user_settings;
create policy "profiles_select" on user_settings
  for select using (auth.uid() = user_id or is_admin());

drop policy if exists "profiles_update" on user_settings;
create policy "profiles_update" on user_settings
  for update using (auth.uid() = user_id or is_admin())
  with check (auth.uid() = user_id or is_admin());

drop policy if exists "profiles_delete" on user_settings;
create policy "profiles_delete" on user_settings
  for delete using (is_admin());
