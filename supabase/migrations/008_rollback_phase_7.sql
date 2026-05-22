-- Migration: 008_rollback_phase_7
-- Reverses Phase 7 schema additions (004-007), restoring the post-Phase-6 shape.
-- Forward-only by convention: 004-007 are NOT edited; this undoes their effects.
-- Idempotent (if exists guards) and transactional.
--
-- Confirmed 2026-05-22:
--   * customers (444) and audit_log (16) exported to exports/pre-rollback/ before this runs.
--   * customer_communications is empty (0 rows).
--   * audit_log IS Phase 7 (007) and is dropped here (no Phase 6 003_audit.sql exists).
--   * pg_trgm extension intentionally RETAINED (harmless once its index is gone; dropping
--     an extension is destructive cleanup we avoid).
--   * public.tg_set_updated_at() is a Phase 1 (001_init) function shared by horses/buyers --
--     NOT dropped. Triggers on dropped tables are removed automatically with the tables.

begin;

-- 1. Drop the FK column on buyers first (removes the dependency on customers).
--    This also drops buyers_customer_id_idx and the FK constraint automatically.
alter table public.buyers drop column if exists customer_id;

-- 2. Drop customer_communications (FK-dependent on customers; no dependents of its own).
--    Its indexes, RLS policy, and updated_at trigger drop with the table.
drop table if exists public.customer_communications;

-- 3. Drop customers (now unreferenced).
--    Unique/trgm/status/tags/deleted_at indexes, RLS policy, and trigger drop with the table.
drop table if exists public.customers;

-- 4. Drop audit_log (Phase 7 / 007). Its indexes and read RLS policy drop with the table.
drop table if exists public.audit_log;

commit;

-- pg_trgm and tg_set_updated_at() intentionally left in place.

-- ── Verification (run after commit) ─────────────────────────────────────────
-- a. customer_id column gone (expect 0 rows):
--    select column_name from information_schema.columns
--    where table_schema='public' and table_name='buyers' and column_name='customer_id';
-- b. Phase 7 tables gone (expect three NULLs):
--    select to_regclass('public.customers'),
--           to_regclass('public.customer_communications'),
--           to_regclass('public.audit_log');
-- c. Buyer + horse data intact (expect 693, 0, 38):
--    select count(*) from public.buyers;
--    select count(*) from public.buyers where first_name is null;
--    select count(*) from public.horses;
