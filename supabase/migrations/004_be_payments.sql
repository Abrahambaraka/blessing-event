-- =============================================================================
-- Blessing Event — Paiements & idempotence webhook
-- Exécuter après 001_ticketing.sql
-- =============================================================================

create table if not exists public.be_payments (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.be_orders(id) on delete cascade,
  transaction_id text unique not null,
  provider text not null check (provider in ('cinetpay', 'mock', 'free')),
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'failed')),
  amount numeric(12, 2),
  currency text,
  webhook_payload jsonb,
  email_sent_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists be_payments_order_id_idx on public.be_payments(order_id);
create index if not exists be_payments_status_idx on public.be_payments(status);
create index if not exists be_payments_order_status_idx on public.be_payments(order_id, status);

alter table public.be_payments enable row level security;

drop policy if exists "be_payments_admin" on public.be_payments;
create policy "be_payments_admin" on public.be_payments
  for all to authenticated
  using (public.be_is_admin())
  with check (public.be_is_admin());

comment on table public.be_payments is 'Journal paiements CinetPay/mock — idempotence webhook';
