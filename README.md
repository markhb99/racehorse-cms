# Racehorse Share CMS

A single-tenant web CMS for tracking racehorse share sales, built with Next.js 16, Supabase, and shadcn/ui.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy the env template and fill in your Supabase project values
cp .env.local.example .env.local

# 3. Apply database migrations (Supabase CLI or paste into SQL editor)
# See supabase/README.md for instructions

# 4. Start development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Visit `/login` and sign in with the admin user you created in Supabase Auth.

## Build & deploy

```bash
npm run build   # Verify build passes before deploying
```

See `DEPLOY.md` for the full Vercel deployment guide.

## Architecture

See `ARCHITECTURE.md` in the parent directory for the full architecture blueprint.
