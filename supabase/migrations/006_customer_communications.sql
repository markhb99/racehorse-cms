-- Migration: 006_customer_communications
-- Per-customer communication log with follow-up tracking.

create table if not exists public.customer_communications (
  id                     uuid primary key default gen_random_uuid(),
  customer_id            uuid not null references public.customers(id) on delete cascade,
  occurred_at            timestamptz not null default now(),
  type                   text not null
                           check (type in ('call','email','sms','meeting','note','document')),
  direction              text not null default 'na'
                           check (direction in ('inbound','outbound','na')),
  subject                text,
  body                   text,
  follow_up_at           timestamptz,
  follow_up_completed_at timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  created_by             uuid
);

create index if not exists comms_customer_id_idx
  on public.customer_communications (customer_id);

create index if not exists comms_occurred_at_idx
  on public.customer_communications (occurred_at desc);

create index if not exists comms_follow_up_due_idx
  on public.customer_communications (follow_up_at)
  where follow_up_at is not null and follow_up_completed_at is null;

drop trigger if exists trg_comms_updated_at on public.customer_communications;
create trigger trg_comms_updated_at
  before update on public.customer_communications
  for each row execute function public.tg_set_updated_at();

alter table public.customer_communications enable row level security;

drop policy if exists comms_authenticated_all on public.customer_communications;
create policy comms_authenticated_all on public.customer_communications
  for all to authenticated using (true) with check (true);
