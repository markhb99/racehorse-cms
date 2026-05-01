-- Migration: 002_settings
-- Settings key-value store.

create table if not exists public.settings (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_settings_updated_at on public.settings;
create trigger trg_settings_updated_at
  before update on public.settings
  for each row execute function public.tg_set_updated_at();

alter table public.settings enable row level security;

drop policy if exists settings_authenticated_all on public.settings;
create policy settings_authenticated_all on public.settings
  for all to authenticated using (true) with check (true);

insert into public.settings (key, value) values
  ('project_name', 'Racehorse Share Sales Dashboard'),
  ('default_currency', 'AUD')
  on conflict (key) do nothing;
