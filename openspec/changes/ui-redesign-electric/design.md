# Technical Design: UI Redesign "Tu Ventaja Eléctrica"

## Architecture Decisions

### 1. Logo Normalization Utility (`src/lib/logos.ts`)
- **Strategy**: Create a static mapping object `TEAM_LOGOS` that keys by "Nombre Público" and "Origen Sheets" to the Flashscore URL.
- **Function**: `getTeamLogo(name: string): string | null`
- **Fallback**: If no match is found, components will render a `<TeamAvatar initials={...} />` placeholder.

### 2. Design System Components
- **StatCard**: Functional component that takes `label`, `value`, `subtext`, and `trend`. Uses `JetBrains Mono` for the value.
- **PickCard**: Main display component. Uses a grid layout (1fr auto 1fr) for the team section.
- **StatusBadge**: Reusable component mapping status strings to the semantic color system defined in CSS variables.
- **CategoryFilter**: Client component handling horizontal scroll and selection state.

### 3. Tailwind v4 Theme Integration (`src/app/globals.css`)
- **Syntax**: Use the new CSS-first theme definition.
- **Variables**: Map the hex codes from the proposal to CSS variables.
- **Utility Classes**: Create high-level layout utilities if needed (e.g., `.electric-border`).

### 4. Chart.js Theming (`src/lib/charts.ts`)
- **Abstract Config**: Create a reusable `getChartOptions()` helper that pulls colors from CSS variables (via `getComputedStyle` if necessary or hardcoded matching tokens).

## Component Map

| Component | Path | Description |
|-----------|------|-------------|
| `StatCard` | `src/components/ui/StatCard.tsx` | Metric box for ROI/Units/etc. |
| `PickCard` | `src/components/picks/PickCard.tsx` | The core betting card. |
| `StatusBadge` | `src/components/ui/StatusBadge.tsx` | Semantic status labels. |
| `CategoryFilter`| `src/components/picks/CategoryFilter.tsx` | Filter pill navigation. |
| `TeamAvatar` | `src/components/ui/TeamAvatar.tsx` | Placeholder for missing logos. |

## Normalization Mapping (Sample)
```typescript
const TEAM_LOGOS: Record<string, string> = {
  "Barcelona": "https://static.flashscore.com/res/image/data/jZ8dSYS0-fcDVLdrL.png",
  "Real Madrid": "https://static.flashscore.com/res/image/data/CGPhnpne-ttfpEDUq.png",
  // ... rest of the mapping from dictionary_maestro_equipos.md
};
```
