-- Seed data for ExpenseManager (example user IDs)

insert into public.accounts (user_id, name, type, balance, currency)
values ('00000000-0000-0000-0000-000000000001', 'Ví tiền', 'cash', 1000000, 'VND')
on conflict do nothing;

insert into public.transactions (user_id, account_id, amount, type, note, occurred_at)
select '00000000-0000-0000-0000-000000000001', id, 500000, 'income', 'Tiền lương', now() from public.accounts where name = 'Ví tiền'
on conflict do nothing;
