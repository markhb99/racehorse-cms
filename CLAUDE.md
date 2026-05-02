@AGENTS.md

# Racehorse CMS

Next.js 16 + Supabase + Tailwind + shadcn/ui dashboard for a bloodstock agent managing racehorse share sales.

## Stack
- Next.js 16.2.4 (Turbopack dev, proxy.ts not middleware.ts)
- Supabase (auth + database)
- Tailwind CSS + shadcn/ui components
- Recharts 3.8.1 for charts (use directly, no shadcn chart wrapper)
- Zod for validation, react-hook-form, sonner for toasts

## Key conventions
- Server actions in `src/app/actions/`
- API routes in `src/app/api/`
- Shared components in `src/components/`
- DB types auto-generated at `src/lib/database.types.ts`
- `Result<T>` pattern from `src/lib/result.ts` for server action returns
- Currency formatting via `src/lib/format/currency.ts`

## Auth
- `src/proxy.ts` — Next.js 16 proxy, cookie-based auth check. Protects all routes except /login and static assets.
- After editing proxy.ts always clear `.next/` cache and restart dev server.

## Data model (key fields)
- `horses`: display_name, total_shares (% to sell, 1–100), share_price_per_pct, color, status, notes
- `buyers`: horse_id, first_name, last_name, email, phone, shares_pct, status, invoice_amount, paid_amount, remarks
- Total Revenue formula: `total_shares × share_price_per_pct`

## Features built
- Horse CRUD with colour picker
- Buyer CRUD with bulk actions
- Excel import (format-agnostic, auto-detects columns by header keyword)
- Excel + PDF export
- Revenue breakdown chart (horizontal stacked bar: Collected/Outstanding/Unsold)
- KPI cards: Shares Sold, Shares Left, Collected, Outstanding, Total Revenue, Buyers
