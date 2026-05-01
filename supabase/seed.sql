-- Seed file for local development only.
-- NOT for production use.
-- Uncomment and run manually if you want demo data locally.

/*
insert into public.horses (display_name, total_shares, share_price_per_pct, color, status)
values
  ('Midnight Express', 100, 5000, '#2563EB', 'active'),
  ('Golden Arrow',     100, 3500, '#CA8A04', 'active');

insert into public.buyers (horse_id, first_name, last_name, email, shares_pct, status, invoice_amount, paid_amount)
select
  h.id,
  'Alice',
  'Smith',
  'alice@example.com',
  10,
  'completed',
  50000,
  50000
from public.horses h where h.display_name = 'Midnight Express';
*/
