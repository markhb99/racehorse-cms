-- Migration: 004_customers
-- Introduces the customers table (the person/entity) as the CRM anchor.

create extension if not exists pg_trgm;

create table if not exists public.customers (
  id                       uuid primary key default gen_random_uuid(),
  legal_first_name         text not null check (length(legal_first_name) between 1 and 80),
  legal_last_name          text,
  display_name             text not null,
  entity_type              text not null default 'individual'
                             check (entity_type in ('individual','company','trust','partnership','super_fund')),
  email                    text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone                    text,
  address_line1            text,
  address_line2            text,
  suburb                   text,
  state                    text,
  postcode                 text check (postcode is null or postcode ~ '^[0-9]{4}$'),
  country                  text not null default 'AU',
  abn                      text check (abn is null or abn ~ '^[0-9]{11}$'),
  acn                      text check (acn is null or acn ~ '^[0-9]{9}$'),
  date_of_birth            date,
  marketing_consent        boolean not null default false,
  marketing_consent_at     timestamptz,
  marketing_consent_source text,
  notes                    text,
  status                   text not null default 'active'
                             check (status in ('prospect','active','lapsed','archived')),
  tags                     text[] not null default '{}',
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  deleted_at               timestamptz
);

create unique index if not exists customers_email_unique
  on public.customers (lower(email))
  where email is not null and deleted_at is null;

create index if not exists customers_display_name_trgm
  on public.customers using gin (display_name gin_trgm_ops);

create index if not exists customers_status_idx
  on public.customers (status)
  where deleted_at is null;

create index if not exists customers_tags_idx
  on public.customers using gin (tags);

create index if not exists customers_deleted_at_idx
  on public.customers (deleted_at);

drop trigger if exists trg_customers_updated_at on public.customers;
create trigger trg_customers_updated_at
  before update on public.customers
  for each row execute function public.tg_set_updated_at();

alter table public.customers enable row level security;

drop policy if exists customers_authenticated_all on public.customers;
create policy customers_authenticated_all on public.customers
  for all to authenticated using (true) with check (true);
