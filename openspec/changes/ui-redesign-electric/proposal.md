# Proposal: UI Redesign "Tu Ventaja Eléctrica"

## Intent
Transform the PulsoOdds frontend into a premium, high-performance sports analysis platform with a cohesive "Electric Lime" identity. This redesign focuses on visual hierarchy, technical aesthetics (dark mode, monospace fonts for odds), and reliable asset normalization using Flashscore logos.

## Scope
- **Global Styling**: Implement CSS variables in `globals.css` using Tailwind v4 `@theme`.
- **Layout**: Redesign Navbar and Footer for a more technical, professional look.
- **Components**: Create a new set of atomic components (`StatCard`, `PickCard`, `CategoryFilter`, `StatusBadge`).
- **Pages**:
  - `Home`: New Hero section and metric grid.
  - `Picks`: Refactored feed with new filtering system and high-contrast pick cards.
  - `Stats`: Updated performance dashboard with themed Chart.js and improved data tables.
- **Data Normalization**: Centralize team logo mapping to use Flashscore URLs from `diccionario_maestro_equipos.md`.

## Technical Approach
1. **Design Tokens**: Define the color palette and typography (Space Grotesk, Inter, JetBrains Mono) as CSS variables.
2. **Component Refactoring**: Move away from inline styles and complex logic inside components to clean, reusable UI elements.
3. **Logo Mapping Utility**: Create a utility function `getTeamLogo(name)` that checks against a master mapping of team names to Flashscore URLs.
4. **Performance**: Ensure all images use lazy loading and the new layout minimizes Cumulative Layout Shift (CLS).

## Risks & Mitigations
- **Logic Breakage**: Mitigation - Use a strictly visual refactor approach. Do not touch data fetching or state management hooks.
- **Asset Inconsistency**: Mitigation - The `diccionario_maestro_equipos.md` provides a definitive source of truth for team logos.
- **Build Errors (Next.js 16)**: Mitigation - Ensure all new components follow React 19 / Next.js 16 patterns (server components where possible, client-only for interactivity).
