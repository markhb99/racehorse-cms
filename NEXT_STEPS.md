# Next Steps — UI Redesign

Approved plan to make the dashboard look commercially polished and iPhone-friendly.
Implement in phase order. User reviews between each phase.

## Phase 1 — Brand colour + Inter font ← START HERE
**Files:** `src/app/globals.css`, `src/app/layout.tsx`

- Replace achromatic primary tokens with deep indigo-navy
- Swap Geist for Inter font (keep Geist_Mono for numbers)
- This alone produces ~80% of the visual improvement

Colour tokens to set in globals.css:
```
--primary: oklch(0.35 0.18 255);
--primary-foreground: oklch(0.98 0 0);
--ring: oklch(0.55 0.18 255);
--sidebar: oklch(0.14 0.05 255);
--sidebar-foreground: oklch(0.92 0 0);
--sidebar-primary: oklch(0.55 0.18 255);
--sidebar-accent: oklch(0.22 0.06 255);
```

## Phase 2 — Mobile bottom tab bar (iPhone safe area)
**Files:** `src/components/shell/bottom-tab-bar.tsx`, `src/components/shell/app-shell.tsx`, `src/components/shell/topbar.tsx`, `src/app/globals.css`

- Fix tab bar height to h-16 with pb-safe for iPhone home indicator
- Frosted glass background on tab bar
- Remove hamburger/drawer on mobile (tab bar handles nav)
- Remove hamburger from topbar on mobile, add centered page title

## Phase 3 — KPI cards + horse cards
**Files:** `src/components/kpi/kpi-card.tsx`, `src/components/horses/horse-card.tsx`

- KPI cards: shadow-sm, hover:shadow-md, icon gets coloured container, font-mono on numbers
- Horse cards: border-l-4 colour treatment, group hover, subtle shadow

## Phase 4 — Sidebar polish
**Files:** `src/components/shell/sidebar.tsx`, sidebar-nav-item.tsx, user-menu.tsx

- "RC" logo mark in rounded square instead of Trophy icon
- Indigo active nav state instead of grey
- User avatar circle with email initial

## Phase 5 — Status pipeline + revenue chart
**Files:** `src/components/buyers/status-pipeline.tsx`, `src/components/horses/revenue-chart.tsx`

- Pipeline: remove emoji/arrows, use colour-coded pill badges
- Chart: pill-shaped legend, show percentage in labels

## Phase 6 — Mobile touch targets
**Files:** `src/components/buyers/buyer-card-list.tsx`

- Increase all touch targets to 44px minimum (Apple HIG)
- Move edit/delete inline buttons to a ... dropdown menu

## Rules
- Do NOT add dark mode toggle
- Do NOT add excessive animations
- Do NOT replace horizontal stacked bar with a donut
- Do NOT keep hamburger menu alongside bottom tab bar on mobile
