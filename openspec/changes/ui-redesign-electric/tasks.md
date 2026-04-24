# Tasks: UI Redesign "Tu Ventaja Eléctrica"

## Phase 1: Foundations
- [ ] Configure Google Fonts (`Space Grotesk`, `Inter`, `JetBrains Mono`) in `app/layout.tsx`.
- [ ] Implement Tailwind v4 theme variables in `app/globals.css`.
- [ ] Create `src/lib/logos.ts` with the Flashscore mapping from `diccionario_maestro_equipos.md`.

## Phase 2: Atomic Components
- [ ] Create `src/components/ui/StatCard.tsx` (Metrics).
- [ ] Create `src/components/ui/StatusBadge.tsx` (Pending/Won/Lost/Void).
- [ ] Create `src/components/ui/TeamAvatar.tsx` (Logo Fallback).

## Phase 3: Domain Components
- [ ] Create/Refactor `src/components/picks/PickCard.tsx`.
- [ ] Create/Refactor `src/components/picks/CategoryFilter.tsx`.

## Phase 4: Global Layout
- [ ] Refactor `src/components/ui/Navbar.tsx` (Numbered links, pulse logo).
- [ ] Refactor `src/components/ui/Footer.tsx` (Minimal, dark).

## Phase 5: Page Refactor
- [ ] Update `app/page.tsx` (Hero section, KPI grid).
- [ ] Update `app/picks/page.tsx` (Filter integration, list layout).
- [ ] Update `app/stats/page.tsx` (Chart styling, Table refactor).

## Phase 6: Quality Assurance
- [ ] Verify responsive behavior on mobile (393px width).
- [ ] Check Chart.js color consistency.
- [ ] Final build check (`npm run build`).
