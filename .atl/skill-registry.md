# Skill Registry - PulsoOdds

This registry tracks AI agent skills and project conventions for PulsoOdds.

## Compact Rules

### Next.js 16 (App Router)
- Use Server Components by default.
- Use `use client` only for interactivity.
- Use `src/` directory structure.
- Follow `AGENTS.md` rules for Next.js 16 APIs.

### Design System
- Theme: Dark Mode Deep Black (#0A0A0F).
- Accent: Neon Green (#00FF87).
- Background: Dark Grey (#1A1A2E).
- Use Tailwind CSS for all styling.

### Data & Auth
- Use Supabase for database and authentication.
- Follow the provided schema for `picks` table.

## User Skills

| Skill | Trigger | Rules |
|-------|---------|-------|
| branch-pr | Creating pull requests | Follow issue-first enforcement |
| issue-creation | Creating GitHub issues | Include technical details |
| judgment-day | Reviewing changes | Dual adversarial review protocol |
| skill-creator | Creating new agent skills | Follow Agent Skills spec |
