-- Migration: 001_init
-- Horses + buyers tables, indexes, updated_at triggers, and RLS policies.
-- Run with: supabase db push  OR  paste into Supabase Dashboard SQL editor.

-- Enable required extensions
create extension if not exists "pgcrypto";

-- ENUMs (idempotent via DO blocks)
do $$ begin
  create type horse_status as enum ('active', 'sold', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type buyer_status as enum (
    'completed',
    'awaiting_payment',
    'awaiting_docs',
    'awaiting_form',
    'pending',
    'not_proceeding'
  );
exception when duplicate_object then null; end $$;

-- horses
create table if not exists public.horses (
  id                    uuid primary key default gen_random_uuid(),
  display_name          text not null check (length(display_name) between 1 and 120),
  total_shares          integer not null default 100 check (total_shares > 0),
  share_price_per_pct   numeric(10,2) not null default 0 check (share_price_per_pct >= 0),
  color                 text not null default '#2563EB' check (color ~* '^#[0-9A-F]{6}$'),
  status                horse_status not null default 'active',
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- buyers
create table if not exists public.buyers (
  id              uuid primary key default gen_random_uuid(),
  horse_id        uuid not null references public.horses(id) on delete cascade,
  first_name      text not null check (length(first_name) between 1 and 80),
  last_name       text,
  email           text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone           text,
  shares_pct      numeric(5,2) not null check (shares_pct > 0 and shares_pct <= 100),
  status          buyer_status not null default 'pending',
  invoice_amount  numeric(12,2) not null default 0 check (invoice_amount >= 0),
  paid_amount     numeric(12,2) not null default 0 check (paid_amount >= 0),
  remarks         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Indexes
create index if not exists horses_status_idx     on public.horses(status);
create index if not exists horses_created_at_idx on public.horses(created_at desc);

create index if not exists buyers_horse_id_idx      on public.buyers(horse_id);
create index if not exists buyers_status_idx        on public.buyers(status);
create index if not exists buyers_horse_status_idx  on public.buyers(horse_id, status);

-- updated_at trigger function (shared)
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger: horses
drop trigger if exists trg_horses_updated_at on public.horses;
create trigger trg_horses_updated_at
  before update on public.horses
  for each row execute function public.tg_set_updated_at();

-- Trigger: buyers
drop trigger if exists trg_buyers_updated_at on public.buyers;
create trigger trg_buyers_updated_at
  before update on public.buyers
  for each row execute function public.tg_set_updated_at();

-- Row-Level Security
alter table public.horses enable row level security;
alter table public.buyers enable row level security;

-- Single policy: any authenticated user has full access.
-- (Only the admin user exists; sign-up is disabled in Supabase Auth settings.)
drop policy if exists horses_authenticated_all on public.horses;
create policy horses_authenticated_all on public.horses
  for all to authenticated using (true) with check (true);

drop policy if exists buyers_authenticated_all on public.buyers;
create policy buyers_authenticated_all on public.buyers
  for all to authenticated using (true) with check (true);
