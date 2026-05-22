-- Migration: 007_audit_log
-- Append-only audit log for Privacy Act 1988 (Cth) / NDB scheme compliance.
-- No UPDATE or DELETE policy. Only service-role may insert.

create table if not exists public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  user_id     uuid,
  user_email  text,
  action      text not null
                check (action in (
                  'create','update','delete','soft_delete','restore',
                  'forget','export','view','login','logout',
                  'consent_granted','consent_revoked','import'
                )),
  entity      text not null
                check (entity in (
                  'horse','buyer','customer','customer_communication',
                  'setting','user','export','login','logout','import'
                )),
  entity_id   text,
  payload     jsonb,
  ip_address  text,
  user_agent  text
);

create index if not exists audit_log_occurred_at_idx  on public.audit_log (occurred_at desc);
create index if not exists audit_log_entity_idx       on public.audit_log (entity, entity_id);
create index if not exists audit_log_user_id_idx      on public.audit_log (user_id);

alter table public.audit_log enable row level security;

drop policy if exists audit_log_read on public.audit_log;
create policy audit_log_read on public.audit_log
  for select to authenticated using (true);

-- No authenticated INSERT policy — service-role inserts only (append-only by design).
-- COMPLIANCE NOTE: Satisfies NDB scheme requirement to maintain records of data access.
-- Retention: 7 years minimum (ATO record-keeping requirement).
