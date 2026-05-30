-- Migration: Add category support to transactions
-- Created: 2026-05-30

-- Add category column to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS category text DEFAULT 'Khác';

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  created_at timestamptz not null default now(),
  unique(user_id, name, type)
);

-- Add category_id foreign key to transactions (optional, for structured data)
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS category_id uuid references public.categories(id) on delete set null;

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_occurred ON public.transactions(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.accounts(user_id);

-- Insert default categories for all users
INSERT INTO public.categories (user_id, name, type)
SELECT DISTINCT user_id, 'Ăn uống', 'expense' FROM public.transactions WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c WHERE c.user_id = public.transactions.user_id AND c.name = 'Ăn uống' AND c.type = 'expense'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (user_id, name, type)
SELECT DISTINCT user_id, 'Di chuyển', 'expense' FROM public.transactions WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c WHERE c.user_id = public.transactions.user_id AND c.name = 'Di chuyển' AND c.type = 'expense'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (user_id, name, type)
SELECT DISTINCT user_id, 'Khác', 'expense' FROM public.transactions WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c WHERE c.user_id = public.transactions.user_id AND c.name = 'Khác' AND c.type = 'expense'
)
ON CONFLICT DO NOTHING;

-- RLS Policies for transactions
DROP POLICY IF EXISTS "Users can only view their own transactions" ON public.transactions;
CREATE POLICY "Users can only view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only create their own transactions" ON public.transactions;
CREATE POLICY "Users can only create their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only update their own transactions" ON public.transactions;
CREATE POLICY "Users can only update their own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only delete their own transactions" ON public.transactions;
CREATE POLICY "Users can only delete their own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for accounts
DROP POLICY IF EXISTS "Users can only view their own accounts" ON public.accounts;
CREATE POLICY "Users can only view their own accounts"
  ON public.accounts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only create their own accounts" ON public.accounts;
CREATE POLICY "Users can only create their own accounts"
  ON public.accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only delete their own accounts" ON public.accounts;
CREATE POLICY "Users can only delete their own accounts"
  ON public.accounts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for categories
DROP POLICY IF EXISTS "Users can only view their own categories" ON public.categories;
CREATE POLICY "Users can only view their own categories"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only create their own categories" ON public.categories;
CREATE POLICY "Users can only create their own categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
