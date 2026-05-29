-- Schema for ExpenseManager

create extension if not exists pgcrypto;

-- accounts
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  balance numeric(14,2) not null default 0,
  currency text not null default 'VND',
  created_at timestamptz not null default now()
);

-- transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete cascade,
  amount numeric(14,2) not null,
  type text not null,
  note text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- user roles and settings
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'user' check (role in ('admin', 'user')),
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  currency text not null default 'VND',
  theme text not null default 'light' check (theme in ('light', 'dark', 'system')),
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- budgets
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
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

-- notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'system' check (type in ('system', 'budget', 'report', 'security')),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- admin activity log
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  target_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_role text;
begin
  resolved_role := case when lower(coalesce(new.email, '')) = lower('2212389@dlu.edu.vn') then 'admin' else 'user' end;

  insert into public.user_roles (user_id, email, role)
  values (new.id, new.email, resolved_role)
  on conflict (user_id) do update
    set email = excluded.email,
        role = excluded.role,
        updated_at = now();

  insert into public.user_settings (user_id, display_name)
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
for each row execute procedure public.handle_new_user_profile();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_user_roles_updated_at on public.user_roles;
create trigger touch_user_roles_updated_at
before update on public.user_roles
for each row execute procedure public.touch_updated_at();

drop trigger if exists touch_user_settings_updated_at on public.user_settings;
create trigger touch_user_settings_updated_at
before update on public.user_settings
for each row execute procedure public.touch_updated_at();

drop trigger if exists touch_budgets_updated_at on public.budgets;
create trigger touch_budgets_updated_at
before update on public.budgets
for each row execute procedure public.touch_updated_at();

create index if not exists idx_transactions_user on public.transactions (user_id);
create index if not exists idx_accounts_user on public.accounts (user_id);
create index if not exists idx_user_roles_email on public.user_roles (email);
create index if not exists idx_budgets_user on public.budgets (user_id);
create index if not exists idx_notifications_user on public.notifications (user_id, read_at);
create index if not exists idx_activity_logs_actor on public.activity_logs (actor_user_id, created_at desc);
create index if not exists idx_activity_logs_target on public.activity_logs (target_user_id, created_at desc);

alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.user_roles enable row level security;
alter table public.user_settings enable row level security;
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

drop policy if exists transactions_delete_own on public.transactions;
create policy transactions_delete_own on public.transactions
  for delete using (auth.uid() = user_id);

drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own on public.user_roles
  for select using (auth.uid() = user_id);

drop policy if exists user_roles_update_own on public.user_roles;
create policy user_roles_update_own on public.user_roles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists user_settings_select_own on public.user_settings;
create policy user_settings_select_own on public.user_settings
  for select using (auth.uid() = user_id);

drop policy if exists user_settings_insert_own on public.user_settings;
create policy user_settings_insert_own on public.user_settings
  for insert with check (auth.uid() = user_id);

drop policy if exists user_settings_update_own on public.user_settings;
create policy user_settings_update_own on public.user_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists budgets_select_own on public.budgets;
create policy budgets_select_own on public.budgets
  for select using (auth.uid() = user_id);

drop policy if exists budgets_insert_own on public.budgets;
create policy budgets_insert_own on public.budgets
  for insert with check (auth.uid() = user_id);

drop policy if exists budgets_update_own on public.budgets;
create policy budgets_update_own on public.budgets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists budgets_delete_own on public.budgets;
create policy budgets_delete_own on public.budgets
  for delete using (auth.uid() = user_id);

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
