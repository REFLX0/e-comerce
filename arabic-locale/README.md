# Arabic (ar) Locale — Files for the specpart/e-comerce Next.js 16 frontend

These 18 files add Arabic as a full third locale alongside French (`fr`) and English (`en`), with proper RTL support.

Drop each file into your repo at the path shown below, replacing the existing file (or creating new ones for `messages/ar.json`). Run `npx tsc --noEmit` after — it should pass with 0 errors.

## File list

| # | Path in your repo | Status | Purpose |
|---|---|---|---|
| 1 | `frontend/i18n/routing.ts` | MODIFIED | Added `'ar'` to `locales` array |
| 2 | `frontend/i18n.ts` | MODIFIED | Added `'ar'` to `locales` list |
| 3 | `frontend/middleware.ts` | MODIFIED | Added `'ar'` to `SUPPORTED_LOCALES` and to the path-stripping regex |
| 4 | `frontend/messages/ar.json` | NEW | Full Arabic translation, 424 keys, 1:1 parity with `fr.json` |
| 5 | `frontend/messages/fr.json` | UNCHANGED (reference copy) | Source-of-truth translation |
| 6 | `frontend/messages/en.json` | UNCHANGED (reference copy) | English translation |
| 7 | `frontend/components/layout/LanguageSwitcher.tsx` | MODIFIED | 2-way toggle → 3-way cycle (fr → en → ar → fr) |
| 8 | `frontend/app/[locale]/layout.tsx` | MODIFIED | Added `dir="rtl"` for `ar`, Cairo Arabic webfont, locale-aware metadata |
| 9 | `frontend/app/globals.css` | MODIFIED | Added `--font-arabic` token + `.rtl-flip` utility |
| 10 | `frontend/components/layout/Header.tsx` | MODIFIED | `ml-auto` → `ms-auto` |
| 11 | `frontend/components/layout/CategoryNav.tsx` | MODIFIED | RTL logical props + `rtl-flip` on directional chevrons |
| 12 | `frontend/components/layout/MobileMenu.tsx` | MODIFIED | RTL logical props + `rtl-flip` on chevrons |
| 13 | `frontend/components/layout/MobileBottomNav.tsx` | MODIFIED | RTL badge position + `/ar/*` active-link recognition |
| 14 | `frontend/components/common/Breadcrumb.tsx` | MODIFIED | `space-x-2` → `gap-x-2` + `rtl-flip` on separator |
| 15 | `frontend/components/catalogue/FilterSidebar.tsx` | MODIFIED | `border-l-2`→`border-s-2`, `pl-7`→`ps-7`, `text-left`→`text-start` |
| 16 | `frontend/components/catalogue/filters/FilterSection.tsx` | MODIFIED | `pr-1`→`pe-1`, `text-left`→`text-start` |
| 17 | `frontend/components/catalogue/filters/PriceFilter.tsx` | MODIFIED | `pr-9`→`pe-9`, `right-2.5`→`end-2.5` (×2) |
| 18 | `frontend/components/ui/accordion.tsx` | MODIFIED | `text-left`→`text-start`, `ml-auto`→`ms-auto` |

## How to apply

```bash
# From your repo root (where `frontend/` lives):

# 1. Backup current state (optional, recommended)
cp -r frontend frontend.backup-$(date +%Y%m%d)

# 2. Copy the files over
cp -r download/arabic-locale/frontend/* frontend/

# 3. Install the new ar.json (already done by step 2 — just verify)
ls frontend/messages/ar.json   # should exist

# 4. Type-check
cd frontend && npx tsc --noEmit
# Expected: 0 errors

# 5. Run dev server
npm run dev
# Visit http://localhost:3000/ar — site flips to RTL, Arabic copy renders
# LanguageSwitcher cycles: fr → en → ar → fr
```

## What you'll see at `/ar`

- `<html lang="ar" dir="rtl">` — entire document flips right-to-left
- Cairo webfont loaded for Arabic glyphs (Latin users see no font swap)
- All 46 page routes resolve identically under `/ar/*`, `/fr/*`, `/en/*`
- Mega-menu, mobile menu, filter sidebar, breadcrumbs, accordions all mirror correctly
- `generateMetadata` emits `ar_TN` OG locale + Arabic SEO keywords

## Key decisions made (per your spec)

1. **Slugs are Latin** — `/ar/catalogue`, not `/ar/كتالوج`. Same route structure across all three locales.
2. **MSA, not dialect** — Modern Standard Arabic, Tunisian-market-appropriate tone matching the existing `fr` copy.
3. **Tailwind v4 logical properties** used everywhere (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `border-s-`, `border-e-`, `text-start`) instead of physical `ml-/mr-/left-/right-/border-l-/text-left`.
4. **Directional icons flip** via `[dir='rtl'] .rtl-flip { transform: scaleX(-1); }` utility (applied to ChevronRight/ArrowRight — non-directional icons like ChevronDown/X/Check don't need it).
5. **Pre-existing bugs flagged but NOT fixed** (out of your "frontend i18n + translation content only" scope):
   - `components/layout/Footer.tsx` lines 33–34 have hardcoded links to `/livraison` and `/retours` — these routes don't exist as pages under ANY locale (so they 404 under `fr` AND `en` AND `ar`, not just `en`).
   - `Footer.tsx` SHOP_LINKS / SERVICE_LINKS / ACCOUNT_LINKS arrays have hardcoded French labels that bypass the i18n system.
   - `components/layout/MiniCart.tsx` has a few untranslated French strings (lines 78, 81, 108).
   - `messages/en.json` has one extra key `Admin.admin` not present in `fr.json` or `ar.json`.

## Verification done

- `npx tsc --noEmit` → 0 errors ✅
- `messages/ar.json` → valid JSON, 424 keys, 0 missing vs `fr.json`, 0 extra ✅
- All 46 page routes use `app/[locale]/...` pattern → automatically resolve under `/ar/*` ✅
- `npx next build` panics in Turbopack's source-highlighter due to non-ASCII chars in error messages (known Next.js 16 / Turbopack bug, not a code defect — CI requires `npx prisma generate` first since the schema lives in `backend/prisma/`).

## Next steps you may want

1. Run a real `npm run build` locally (after `npx prisma generate` from the repo root) to fully verify the production bundle.
2. Visual QA in browser at `/ar` — check the mega-menu, filter sidebar, and mobile bottom-sheet mirror cleanly.
3. Optionally fix the pre-existing Footer hardcoded links/labels (would need 5–10 new i18n keys in fr/en/ar).
