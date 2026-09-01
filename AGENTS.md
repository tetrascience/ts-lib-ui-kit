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
│                    #   AreaPlot, BarChart, LinePlot, ScatterPlot,
│                    #   ScatterPlotInteractive, Histogram, PieChart, BoxPlot,
│                    #   Chromatogram, StackedChromatogram, Electropherogram, PlateMap
├── hooks/           # Custom React hooks
├── lib/utils.ts     # cn() helper (clsx + tailwind-merge)
├── server/          # Server-side utilities (being migrated out — see below)
├── utils/           # Pure utility functions
├── index.css        # Tailwind theme tokens (oklch CSS custom properties)
└── index.ts         # All client-side exports
```

## Per-Component Entries

Every public export of `src/index.ts` also ships at its own subpath
(`./ui/button`, `./composed/StatCard`, `./charts/AreaPlot`, `./ai/message`,
`./utils/colors`, `./lib/shiki`), so consumers who only need a handful of
components — and especially Jest, which has no tree-shaking and
re-evaluates the whole import graph per test file — don't pay for the full
~150-module barrel. Entries are derived automatically by
[`scripts/build/component-entries.ts`](./scripts/build/component-entries.ts),
which parses `src/index.ts`'s `export * from "@/..."` lines (the single
source of truth for the public API) rather than hand-maintaining a parallel
manifest that could drift. **Adding a component to `src/index.ts` is
sufficient** — its subpath entry appears on the next build with no other
change required, _provided_ its file shape matches its category's dominant
form (see below).

Gotchas, both load-bearing for correctness:

- **`rollupTypes` is off** (`vite.config.ts`'s `dts()` call). It was on
  before this many entries existed; with `preserveModules` + this many
  simultaneous `build.lib.entry` keys, vite-plugin-dts@4's rollup-dts pass
  only fully bundles one entry's type graph — every other entry (this
  already silently affected the pre-existing `providers/*` entries at only
  5 total entries) gets a broken `export * from '<relative path>'` pointing
  at a file that's never written. With it off, every source file gets a
  self-contained `.d.ts` mirroring its `src/`-relative path instead — which
  means the exports map's `"types"` condition points at
  `./dist/components/<category>/<Name>[/index].d.ts` (the mirrored path),
  while `"import"`/`"require"` point at `./dist/<category>/<Name>.js`/`.cjs`
  (the entry-key path, which Rollup — independent of the dts setting —
  canonicalizes correctly regardless of `rollupTypes`). These are
  deliberately different paths; don't try to unify them.
- **Two categories mix file shapes.** Most `composed/` and all `charts/`
  components are directories with a barrel `index.ts` (mirrored `.d.ts`
  lands at `<Name>/index.d.ts`); most `ui/` and all `ai/`/`utils/`/`lib/`
  entries are single files (mirrored `.d.ts` lands at `<Name>.d.ts`). Where
  a category has an exception to its own dominant shape —
  `ui/data-table` (a directory) and `composed/tdp-link` /
  `composed/tdp-url` (flat legacy files) today — the wildcard
  `"./composed/*"` / `"./ui/*"` pattern in `package.json`'s `exports` map
  can't resolve both shapes with one pattern, so those three have their own
  literal (non-wildcard) entries listed before the pattern. Adding a new
  component whose shape doesn't match its category's dominant form needs
  the same treatment, or its subpath's types will 404 while the runtime
  import still works (import/require aren't shape-sensitive the way types
  are) — a mismatch that's easy to miss unless you typecheck against the
  new subpath, not just run it.

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

## MCP Server

Exposes the UI kit to AI coding agents (component lists, props/variants, usage examples). Background: [Storybook MCP for React](https://storybook.js.org/blog/storybook-mcp-for-react/) and the [`@storybook/addon-mcp`](https://www.npmjs.com/package/@storybook/addon-mcp) addon.

- **Local:** `@storybook/addon-mcp` serves the full toolset at `http://localhost:6006/mcp` under `yarn storybook` (registered in `.storybook/main.ts`).
- **Deployed (Vercel):** the static Storybook can't run the addon, so a serverless function [`api/mcp.ts`](./api/mcp.ts) serves a docs-only MCP at `/api/mcp`. At runtime it reads `storybook-static/mcp/components.json` from disk (no outbound request, no SSRF). That catalog is generated by [`scripts/mcp/build-metadata.ts`](./scripts/mcp/build-metadata.ts) as part of `yarn build-storybook`.
- [`vercel.json`](./vercel.json) is **required**, doing two things the deploy can't work without: (1) pins `buildCommand` to `yarn build-storybook` so the metadata step generates the catalog, and (2) bundles that catalog into the function via `functions.includeFiles` (it isn't part of the function's source tree) and declares the function. Without `vercel.json` the deployed function 404s (build reverts to dashboard settings, catalog never generated). Do **not** load the catalog via a JSON `import` — in this `"type": "module"` package that hit native-ESM import-attribute errors and 500'd on Vercel; the disk read is the verified-working approach.
- Do not break the `build-storybook` → metadata chain; the deployed `/api/mcp` depends on the generated `storybook-static/mcp/components.json`. Not published in the npm package (`files` ships only `dist`).

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

### Heavy dependencies must stay lazy (SW-2007)

The kit ships preserved ES modules with all deps externalized, so a static import of a heavy library lands it in every consumer's **main** chunk. Never statically import these — use the established lazy paths:

- **Plotly**: never `import Plotly from "plotly.js-dist"` (types via `import type` are fine). Draw via `loadPlotly()` / `getLoadedPlotly()` from `src/components/charts/plotly-loader.ts` (see any chart component for the pattern).
- **Shiki**: never import from `"shiki"` at runtime (full bundle ≈ 200 grammars; OOMs consumer builds). Use the shared slim highlighter in `src/lib/shiki.ts` (`shiki/core` + explicit language set; extend via `registerCodeBlockLanguage`).
- **mermaid / KaTeX / streamdown plugins**: only via `useStreamdownPlugins()` (`src/components/ai/use-streamdown-plugins.ts`), which dynamic-imports the plugin set. Do not statically import `@streamdown/*` plugins or `src/components/ai/streamdown-plugins.ts` from component code.

#### Optional peer dependencies

The lazy paths above keep heavy deps out of a consumer's **bundle** when the component is unused, but a hard `dependency` is still **installed** for everyone. To also keep them out of `node_modules` when unused, the heaviest, narrowest-used ones are declared as **optional `peerDependencies`** (`peerDependenciesMeta.<pkg>.optional = true`) and duplicated in `devDependencies` (so the kit's own Storybook/tests/build still resolve them):

- `plotly.js-dist` — required only by `charts/` components.
- `@streamdown/mermaid`, `@streamdown/math` — required only by `MessageResponse` / `Reasoning` (markdown).

Consumer contract: apps that use these components must install the matching peer themselves; apps that don't never pull it. **How a missing peer surfaces depends on the import shape (SW-2472), so don't assume the bundler catches it.** A _named_ static import from an optional-peer stub is a hard Rollup error, which is why a root-entry build fails without `@streamdown/math`/`@streamdown/mermaid` even when no AI component is used — `streamdown-plugins.ts` is only reached dynamically, but a dynamic-import target is still in the module graph and its named imports must resolve. A _default-only dynamic_ import — `plotly.js-dist` via `plotly-loader.ts` — resolves to an empty stub, the build exits 0, and the only signal is the loader's runtime guard. When adding an optional peer, know which of the two you have; if it's the second, the runtime guard is the whole safety net and must reject a stub, not just a rejected import. `shiki` / `@shikijs/*` / `@streamdown/cjk` stay regular `dependencies` (the `CodeBlock` primitive is broadly used and their install size is modest). When adding a component that pulls a new heavy dep, decide deliberately between hard dep (broadly used) and optional peer (heavy + narrow), and keep the loader's runtime guard message pointing at the install command.

## Testing

- **Prefer Storybook play function tests** for React components — real browser via Playwright, more realistic than jsdom
- Unit tests (`*.test.ts` / `*.test.tsx`) for pure utilities, hooks, and non-visual logic only
- Do not manually assign `parameters.zephyr.testCaseId` values — generate or repair them through `sync-storybook-zephyr`

### Shipped Jest support for consumers (`./jest-setup` sub-export)

[`src/jest-setup.tsx`](./src/jest-setup.tsx) is a single self-registering setup file — consumers add it to Jest's `setupFiles`. On import (guarded on the module-scoped `jest` wrapper variable — it is NOT a real global, so read it as a free variable behind `typeof`) it calls `jest.mock(id, factory)` for every dep Jest's CJS runtime can't load — ESM-only packages (streamdown, shiki/@shikijs subpaths, use-stick-to-bottom, react-resizable-panels) and optional peers (plotly.js-dist, @rdkit/rdkit, @streamdown/math|mermaid) — and installs jsdom shims (ResizeObserver, matchMedia, pointer capture; verified against this repo's jsdom ^28, which implements none of them natively — these are load-bearing, not defensive). Mock registration is non-virtual when the module resolves (Jest keys it by real path) with a `{ virtual: true }` fallback when it doesn't (`import`-only exports or uninstalled peers; virtual bare-specifier mocks are keyed by the specifier and intercept globally — verified empirically against real Jest, both directions). **When adding a dependency, check whether it's ESM-only (`"type": "module"` with no `require` export condition); if a kit module imports it — statically or via the lazy loaders — add a registration there**, or Jest consumers regress to `ERR_REQUIRE_ESM`. Registrations use exact module ids (including each `@shikijs/langs/<lang>` the `CodeBlock` highlighter loads), so extending `src/lib/shiki.ts`'s language set means extending `KIT_SHIKI_LANGUAGES` there too — a test asserts they stay equal. Entry basename must not be `index` — vite-plugin-dts emits a flat `<basename>.d.ts` per entry and a second `index` clobbers the root `dist/index.d.ts`.

**Dynamic-import gotcha (load-bearing):** several of these deps (plotly, the shiki subpaths) are reached via dynamic `import()`, not a static `import`. Rollup's CJS output keeps an external dynamic `import()` as a _native_ `import()` by default — invisible to `jest.mock`, and Jest throws `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG` the moment it's reached. `vite.config.ts`'s `output.dynamicImportInCjs: false` rewrites these to an interop-wrapped `require()` instead, which Jest _can_ mock — but that interop helper unconditionally does `namespace.default = <raw factory return>` with **no `__esModule` check**. A mock factory for one of these must return the value the consuming code expects at `.default` **directly** — `() => []`, not `() => ({ default: [] })` — or the double-wrap surfaces as a runtime `TypeError` the first time the "mocked" path is actually exercised, not at registration time. `@rdkit/rdkit` also has a supported, more accurate escape hatch for real behavioral tests: `configureRDKit({ importFactory })` (exported from `composed/MoleculeStructure`) injects a fake module directly, bypassing the dynamic import entirely — see `src/components/composed/MoleculeStructure/__tests__/rdkit-loader.test.ts` for a fuller fake to model one on.

**Verification:** unit tests of `jest-setup.tsx`'s exported helpers (`src/__tests__/jest-setup.test.tsx`) run under Vitest against fake APIs — they can't exercise Jest's actual module system, Rollup's real interop output, or the `jest`-wrapper-variable self-activation path. [`scripts/verify-jest-consumer/`](./scripts/verify-jest-consumer) is a real-Jest (not Vitest) project that packs the kit and renders `CodeBlock`/chart/`MoleculeStructure` through the actual compiled dist and the shipped `jest-setup` — this is what would have caught the dynamic-import and interop-shape bugs above. It runs on every CI build (`.github/workflows/ci.yml`'s "Verify Jest consumer support" step) unconditionally rather than path-gated on `src/jest-setup.tsx`/`vite.config.ts` — a change to a _mocked source file_ itself (e.g. `src/lib/shiki.ts`, `src/components/charts/plotly-loader.ts`) can just as easily break what needs mocking, and the check is cheap enough (well under a minute) that gating it isn't worth the blind spot. Run `yarn verify:jest-consumer` locally too before a release or when iterating on this file, for a faster feedback loop than waiting on CI.

It deliberately does **not** install the packed tarball as a normal npm dependency (`link-kit.js` extracts it directly into `node_modules` instead, via a `pretest` hook). A real dependency install would also install the kit's _own_ declared dependencies — including the AWS SDK packages `src/server/**` uses, which this project never touches (it only renders client components) but which transitively pull in versions of `protobufjs`/`fast-xml-parser` that dependency scanning flags, with no way to fix them here since the code path is never exercised. Its `devDependencies` are a deliberately explicit, minimal set — derived by `grep -o 'require("[^"]*")'` against the built `.cjs` for each tested subpath — covering exactly what those subpaths need at runtime (`lucide-react`, `radix-ui`, `class-variance-authority`, React). **Testing a new subpath here that needs a different real dependency means adding it explicitly** — resist the temptation to widen this by depending on the kit as a whole again.

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

- Zephyr HTTP is handled by a shared internal `ts-lib-zephyr-nodejs` library (`ZephyrClient` + helpers). The repo's scripts are thin wrappers around it — JUnit parsing, story parsing/write-back, cycle resolution, and folder mapping stay local.
- Test results reported to Zephyr Scale via `scripts/zephyr/report-zephyr-results.ts`.
- Story-to-testcase sync handled by `scripts/zephyr/sync-storybook-zephyr.ts`
- Test case IDs live in story parameters: `parameters.zephyr.testCaseId`
- Do not manually invent, copy, reuse, or paste Zephyr test case IDs between stories.
- For new stories, leave `parameters.zephyr.testCaseId` absent or set it to `""`; let `sync-storybook-zephyr` generate the real ID.
- If a story has an incorrect or duplicated non-empty ID, clear only the incorrect story's `testCaseId` to `""`, then run the Zephyr sync workflow.
- Generate/backfill IDs by applying the `zephyr_sync` label to the PR. Confirm the workflow commits the generated IDs back to the branch.
- After Zephyr sync changes, verify there are no duplicate non-empty IDs before merging.
- Multiple IDs in legacy test names may appear as `[SW-T100,SW-T101]`; prefer `parameters.zephyr.testCaseId` for story metadata.
