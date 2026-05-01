# Deployment Guide

## Prerequisites

- A [Supabase](https://supabase.com) project (free tier works)
- A [Vercel](https://vercel.com) account
- A GitHub repository with this code pushed to it

---

## Step 1 — Set up Supabase

1. Create a new Supabase project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Go to **Project Settings → API** and note:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY`

## Step 2 — Apply database migrations

**Option A (Supabase CLI):**
```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

**Option B (Dashboard SQL editor):**
Paste and run each migration file in order:
1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_settings.sql`

## Step 3 — Disable public sign-up

In your Supabase dashboard:
1. Go to **Authentication → Settings**
2. Set **Enable email signups** → **OFF**

## Step 4 — Create the admin user

In your Supabase dashboard:
1. Go to **Authentication → Users**
2. Click **Add user** → **Create new user**
3. Enter your admin email and a strong password
4. Tick **Auto Confirm User**

## Step 5 — Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. In **Environment Variables**, add:
   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |
   | `NEXT_PUBLIC_SITE_URL` | Your Vercel deployment URL (e.g. `https://racehorse-cms.vercel.app`) |
4. Click **Deploy**.

## Step 6 — Verify

1. Visit your deployed URL.
2. You should be redirected to `/login`.
3. Sign in with the admin user created in Step 4.
4. You should see the empty dashboard shell.

---

## Local development with production Supabase

You can point your local dev server at your production Supabase by copying the env vars into `.env.local`. Use a separate **development** Supabase project to avoid touching production data.

## Test production build locally

```bash
npm run build && npm start
```

This must succeed before deploying.
