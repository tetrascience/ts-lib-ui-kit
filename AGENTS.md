# CLAUDE.md — ts-lib-ui-kit

React 19 + TypeScript UI component library (`@tetrascience-npm/tetrascience-react-ui`).
Built with Vite 7, Tailwind CSS 4, shadcn/ui, Storybook 10, Vitest, Yarn 4.

## Quick Commands

```bash
yarn dev               # Dev server (port 6006, alias for yarn storybook)
yarn build             # Production build (Vite library mode)
yarn lint              # ESLint (flat config, zero warnings)
yarn typecheck         # TypeScript type checking
yarn test              # Unit tests only (Vitest, jsdom)
yarn test:storybook    # Storybook play function tests (Playwright)
yarn test:all          # Both unit + storybook tests
yarn format            # Prettier
```

## Pre-commit Checks

Before committing, always run:

```bash
yarn lint && yarn typecheck && yarn test:all
```

Husky + lint-staged auto-runs ESLint on staged `*.{js,jsx,ts,tsx}` files.

## Project Structure

```
src/
├── components/
│   ├── ui/          # shadcn/ui primitives (radix-ui + CVA + Tailwind)
│   ├── composed/    # Multi-component compositions (AppHeader, Sidebar, etc.)
│   └── charts/      # 12 Plotly.js scientific visualizations:
│                    #   AreaGraph, BarGraph, LineGraph, ScatterGraph,
│                    #   InteractiveScatter, Histogram, PieChart, DotPlot,
│                    #   Heatmap, Boxplot, Chromatogram, PlateMap
├── hooks/           # Custom React hooks
├── lib/utils.ts     # cn() helper (clsx + tailwind-merge)
├── server/          # Server-side utilities (being migrated out — see below)
├── utils/           # Pure utility functions
├── index.css        # Tailwind theme tokens (oklch CSS custom properties)
└── index.ts         # All client-side exports
```

## Server Utilities (`./server` sub-export)

Import path for consumers: `@tetrascience-npm/tetrascience-react-ui/server`

```
src/server/
├── auth/
│   └── JwtTokenManager.ts   # jwtManager singleton — resolves JWT from cookies or env
├── providers/
│   ├── buildProvider.ts               # Factory: provider config → typed provider instance
│   ├── getProviderConfigurations.ts   # Fetch available provider configs via TDPClient
│   ├── AthenaProvider.ts / SnowflakeProvider.ts / DatabricksProvider.ts
│   └── exceptions.ts                  # QueryError, MissingTableError, ProviderConnectionError, etc.
```

Key exports: `jwtManager`, `buildProvider`, `getProviderConfigurations`, `buildSnowflakeProvider`, `buildDatabricksProvider`, `getTdpAthenaProvider`, typed exception classes.

> **Migration note:** This module is being extracted out of this package. Do not add new server functionality here — new server utilities belong in the consuming application or a dedicated server package.

## Component Patterns

**`ui/` components**: Single `kebab-case.tsx` file. shadcn/ui pattern — wraps radix-ui or @base-ui/react with CVA variants and Tailwind classes via `cn()`.

**`composed/` and `charts/` components**: Prefer a PascalCase directory with `ComponentName.tsx`, `ComponentName.stories.tsx`, and `index.ts` for new components. Some legacy composed components exist as single `kebab-case.tsx` files (e.g. `tdp-link.tsx`).

## Design System

See [`DESIGN.md`](./DESIGN.md) for the full design document — tokens, component inventory, API conventions, theming guide, and architectural decisions.

### Styling

- Tailwind CSS 4 utility classes via `cn()` from `src/lib/utils.ts`
- CVA (`class-variance-authority`) for variant definitions
- Design tokens as CSS custom properties in `src/index.css` (oklch color space)
- Icons from `lucide-react`
- Dark mode via `.dark` class on `<html>` — all tokens redefined under `.dark { }` in `src/index.css`

### Key Design Principles

- **Data-dense by default** — sized for scientific dashboards, not marketing pages
- **Consistent color semantics** — green = success, orange = caution, red = error, blue = action
- **Dark mode is first-class** — every token defined for both `:root` and `.dark`, charts contrast-checked in both
- **Accessibility is non-negotiable** — Radix primitives handle focus traps, ARIA, keyboard nav; WCAG AA contrast minimum

### Component API Conventions

- `variant` / `size` props via CVA; `asChild` via Radix slot; `className` for Tailwind overrides
- Compound components re-export named sub-components alongside root (e.g. `Dialog`, `DialogTrigger`, `DialogContent`)
- Chart components use `CHART_COLORS` from `src/utils/colors.ts` and `usePlotlyTheme` hook for theme sync

## Testing

- **Prefer Storybook play function tests** for React components — real browser via Playwright, more realistic than jsdom
- Unit tests (`*.test.ts` / `*.test.tsx`) for pure utilities, hooks, and non-visual logic only
- Do not manually assign `parameters.zephyr.testCaseId` values — generate or repair them through `sync-storybook-zephyr`

## Code Style

- ESLint 9 flat config (`eslint.config.js`) + Prettier (`.prettierrc`)
- Do not use `eslint-disable` comments — refactor instead
- `@ts-ignore` allowed only with a description
- Flag all `any` usage (new and existing) — incrementally eliminating to enable `no-explicit-any`

## Publishing

```bash
yarn release          # semantic-release: auto-determines version from commits, publishes to npm
yarn release:dry-run  # Validate what would be published without actually publishing
```

Convention: uses [Conventional Commits](https://www.conventionalcommits.org/) for versioning — `feat:` → minor bump, `fix:` → patch bump, `feat!:` / `BREAKING CHANGE:` → major bump.

## Zephyr Integration

- Test results reported to Zephyr Scale via `scripts/zephyr/report-zephyr-results.ts`
- Story-to-testcase sync handled by `scripts/zephyr/sync-storybook-zephyr.ts`
- Test case IDs live in story parameters: `parameters.zephyr.testCaseId`
- Do not manually invent, copy, reuse, or paste Zephyr test case IDs between stories.
- For new stories, leave `parameters.zephyr.testCaseId` absent or set it to `""`; let `sync-storybook-zephyr` generate the real ID.
- If a story has an incorrect or duplicated non-empty ID, clear only the incorrect story's `testCaseId` to `""`, then run the Zephyr sync workflow.
- Generate/backfill IDs by applying the `zephyr_sync` label to the PR. Confirm the workflow commits the generated IDs back to the branch.
- After Zephyr sync changes, verify there are no duplicate non-empty IDs before merging.
- Multiple IDs in legacy test names may appear as `[SW-T100,SW-T101]`; prefer `parameters.zephyr.testCaseId` for story metadata.
