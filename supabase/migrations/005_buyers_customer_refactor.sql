-- Migration: 005_buyers_customer_refactor
-- Adds customer_id FK to buyers and backfills via deterministic find-or-create.

-- Step 1: Add customer_id column (nullable during backfill)
alter table public.buyers
  add column if not exists customer_id uuid references public.customers(id) on delete restrict;

-- Step 2: Backfill via PL/pgSQL
do $$
declare
  b record;
  cust_id uuid;
  norm_email text;
  norm_name text;
begin
  for b in select * from public.buyers where customer_id is null loop

    norm_email := lower(trim(coalesce(b.email, '')));
    norm_name  := lower(trim(b.first_name || ' ' || coalesce(b.last_name, '')));

    -- Try email match first
    cust_id := null;
    if norm_email != '' then
      select id into cust_id
      from public.customers
      where lower(email) = norm_email and deleted_at is null
      limit 1;
    end if;

    -- Try name match
    if cust_id is null then
      select id into cust_id
      from public.customers
      where lower(display_name) = norm_name and deleted_at is null
      limit 1;
    end if;

    -- Create new customer
    if cust_id is null then
      insert into public.customers (
        legal_first_name, legal_last_name, display_name,
        email, phone, marketing_consent
      ) values (
        b.first_name,
        b.last_name,
        trim(b.first_name || ' ' || coalesce(b.last_name, '')),
        nullif(trim(coalesce(b.email, '')), ''),
        nullif(trim(coalesce(b.phone, '')), ''),
        false
      )
      returning id into cust_id;
    end if;

    update public.buyers set customer_id = cust_id where id = b.id;

  end loop;
end $$;

-- Step 3: Verify all rows have customer_id before making non-nullable
-- This will raise an error if any rows are still null (safety check)
do $$
declare
  null_count integer;
begin
  select count(*) into null_count from public.buyers where customer_id is null;
  if null_count > 0 then
    raise exception 'Backfill incomplete: % buyer rows still have customer_id IS NULL', null_count;
  end if;
end $$;

alter table public.buyers alter column customer_id set not null;

create index if not exists buyers_customer_id_idx on public.buyers (customer_id);

-- Post-migration duplicate detection query (run manually to review results):
-- SELECT c.display_name, count(*) as customer_count, array_agg(c.id) as ids
-- FROM public.customers c
-- GROUP BY lower(c.display_name)
-- HAVING count(*) > 1
-- ORDER BY count(*) desc;
