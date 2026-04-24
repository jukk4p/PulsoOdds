# Specification: UI Redesign "Tu Ventaja Eléctrica"

## Requirements

### 1. Design Tokens & Foundations
- **Color Palette**: Implement the full CSS variable set defined in the proposal (Electric Lime `#C8FF00`, Dark Backgrounds, Semantic colors for Win/Loss/Pending).
- **Typography**:
  - Headings: `Space Grotesk` (technically advanced feel).
  - Body: `Inter` (neutral, high readability).
  - Data/Monospace: `JetBrains Mono` (used for odds and numeric values).
- **Global Styles**: Defined in `globals.css` using Tailwind v4 syntax.

### 2. Global Layout
- **Navbar**:
  - Glassmorphism background (`backdrop-blur-md`).
  - Animated pulse on the logo.
  - Numbered navigation links (e.g., `01 INICIO`, `02 PICKS`).
  - Active state indication via accent underline.
- **Footer**: Compact, dark, containing mandatory legal disclaimers.

### 3. Metric System (StatCard)
- **Visuals**: Clean boxes with high-contrast numeric values.
- **Indicators**: Trend icons (up/down) and subtext colored based on performance.
- **Responsive**: Grid layout that adapts from 1 to 4 columns based on viewport.

### 4. Betting System (PickCard)
- **Hierarchy**: Event details first, then teams, then market info, then the dominant Odds button.
- **Status Badges**: Distinct visual styles for PENDING (Amber), WON (Green), LOST (Red), and VOID (Grey).
- **Logo Normalization**: All team logos must be fetched via the `getTeamLogo` utility, mapping against `diccionario_maestro_equipos.md`. Fallback to initials if not found.

### 5. Filtering System (CategoryFilter)
- **Interaction**: Horizontal pill-based selection.
- **States**: Clear distinction between active (highlighted in Lime) and inactive (bordered) states.
- **Visibility**: Result summary text (counts of won/lost/pending) displayed below the filters.

### 6. Performance Analytics (Stats Page)
- **Charts**: Custom-themed Chart.js matching the dark aesthetics. Positive/Negative profit line colors.
- **Tables**: Borderless rows, subtle hover states, and semantic coloring for ROI/Profit columns.

## Scenarios

### Scenario: Viewing a Won Pick
- **Given** a pick with status "WON".
- **When** the `PickCard` is rendered.
- **Then** the `StatusBadge` shows a green background with a solid border.
- **And** the profit value (if applicable) is highlighted in `--color-win`.

### Scenario: Mobile Navigation
- **Given** a viewport width of <768px.
- **When** the user opens the menu.
- **Then** the numbered links are displayed in a clean full-screen or slide-out menu.
- **And** the `CategoryFilter` supports native horizontal touch scrolling.

### Scenario: Team Logo Fallback
- **Given** a team name not present in `diccionario_maestro_equipos.md`.
- **When** the `PickCard` renders the logo.
- **Then** it displays a circular placeholder with the team's first two initials.
