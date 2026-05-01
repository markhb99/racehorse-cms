# Supabase Migrations

## Applying migrations

### Option A — Supabase CLI (recommended)

```bash
# Install CLI
npm install -g supabase

# Link to your project (run once)
supabase login
supabase link --project-ref <your-project-ref>

# Push all migrations
supabase db push
```

### Option B — Dashboard SQL editor

1. Open your Supabase project dashboard.
2. Go to **SQL Editor**.
3. Paste and run `001_init.sql`, then `002_settings.sql`, in order.

## Migration order

| File | Tables | Notes |
|---|---|---|
| `001_init.sql` | horses, buyers | Core schema + RLS |
| `002_settings.sql` | settings | Project config |
| `003_audit.sql` | audit_log | Optional, Phase 6 |

## Important: Disable public sign-up

After applying migrations, go to **Authentication → Settings** in the Supabase dashboard and set:
- **Enable email signups** → OFF

Then create the admin user manually via **Authentication → Users → Add user**.
