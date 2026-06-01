# Registry — Shareable Components & Data‑App Templates

> **Status:** Phase 1 implemented (buildable + publishable registry). Phases 2–3 are proposed.

This document describes how `@tetrascience-npm/tetrascience-react-ui` distributes
its components as a [shadcn registry](https://ui.shadcn.com/docs/registry), so
that **data‑app builders can pull pre‑coded examples into their apps, tweak them,
and own the source** — distinct from the locked, versioned npm package.

---

## 1. Why a registry (the two consumption modes)

The npm package is the right tool when a team wants components they **upgrade**,
not edit: import `Button`, get our `Button`, get our fixes on `yarn upgrade`.

But a lot of what we want to share with data‑app builders is the opposite: a
starting point they are **expected to fork** — a dashboard layout, a TDP search +
chart wiring, a settings page. For that, copying the source into their repo is
the right model, and that is exactly what a shadcn registry does.

|           | npm package                      | shadcn registry                                 |
| --------- | -------------------------------- | ----------------------------------------------- |
| Install   | `yarn add …`                     | `npx shadcn add <url>`                          |
| Ownership | Library owns the code            | Consumer owns the copied source                 |
| Upgrades  | `yarn upgrade`                   | Manual re‑add / diff                            |
| Best for  | Stable primitives, design tokens | Templates & examples meant to be tweaked        |
| Imports   | `import { Button } from "…"`     | Source copied under the consumer's `@/` aliases |

The two modes are complementary and ship from the **same source tree** — no
duplicated component code.

---

## 2. How it works

shadcn registries are just **static JSON files served over HTTP**. Each item
(`button.json`, `tdp-link.json`, …) inlines its source files plus its npm and
intra‑registry dependencies. The consumer runs `npx shadcn add <url>`, and the
CLI writes the source into their project, rewriting our `@/` aliases to theirs
and installing any npm dependencies.

```
registry.json                     # manifest: every item, its files & deps
   │  yarn registry:build  (= shadcn build --output .storybook/public/r)
   ▼
.storybook/public/r/*.json        # one built file per item (generated, gitignored)
   │  storybook build  (staticDirs: ["./public"])  →  Vercel deploy
   ▼
https://ts-lib-ui-kit-storybook.vercel.app/r/<name>.json
   │  npx shadcn add <url>
   ▼
consumer app: src/components/ui/button.tsx  (theirs to edit)
```

### Hosting decision

The built registry is **co‑hosted with the Storybook site** on Vercel. Because
Storybook serves `staticDirs: ["./public"]`, anything written to
`.storybook/public/r/` is published at `<storybook-url>/r/`. This means:

- **No new infrastructure** — every Storybook deploy publishes the current registry.
- **Discoverability** — the component you're looking at in Storybook and its
  `npx shadcn add` command live at the same origin.

`yarn build-storybook` runs `yarn registry:build` first (see `package.json`), so
the registry is always rebuilt from `registry.json` on deploy. The generated
`.storybook/public/r/` directory is gitignored — `registry.json` is the source
of truth.

---

## 3. Authoring an item

Components are written normally in `src/` using `@/` import aliases (which the
codebase already does everywhere). To publish one, add an entry to
`registry.json`:

```jsonc
{
  "name": "stat-card",
  "type": "registry:component", // ui | component | block | lib | hook
  "title": "Stat Card",
  "description": "A KPI card with trend indicator.",
  "dependencies": ["lucide-react"], // npm packages
  "registryDependencies": ["card"], // other items in THIS registry
  "files": [{ "path": "src/components/composed/StatCard/StatCard.tsx", "type": "registry:component" }],
}
```

Then `yarn registry:build` regenerates the served JSON. Keep `dependencies` and
`registryDependencies` accurate — they drive what the consumer's CLI installs.

### Item types we use

| Type                 | Meaning                            | Lands in consumer at          |
| -------------------- | ---------------------------------- | ----------------------------- |
| `registry:ui`        | A primitive                        | `components/ui/`              |
| `registry:component` | A composition of primitives        | `components/`                 |
| `registry:block`     | A full multi‑file template/example | `components/` (+ pages/hooks) |
| `registry:lib`       | A utility module                   | `lib/`                        |
| `registry:hook`      | A React hook                       | `hooks/`                      |

---

## 4. Current catalog (Phase 1)

All ~50 `ui/` primitives are published, plus `tdp-link` (a composed component +
its `tdp-url` lib). Run `yarn registry:build` and inspect `.storybook/public/r/`,
or browse them at `https://ts-lib-ui-kit-storybook.vercel.app/r/<name>.json`.

> Phase 1 also removed three stale `registry.json` entries that pointed at files
> which never existed (`chart`, `dashboard`, `settings-page`) and corrected the
> `tdp-link` paths (the source lives in `composed/`, not `ui/`), so the build is
> green.

---

## 5. Roadmap

### Phase 2 — Promote the real templates

The "pre‑coded examples data‑app builders want to own" already exist in the
tree but aren't in the registry yet. Promote them as registry items:

- **Composed components** — `DataAppShell`, `StatCard`, `EmptyState`,
  `ConfirmDialog`, `RichListItem`, `TdpSearch`, `FormPatterns`, `ToastPatterns`,
  `Chat`, `PlateMapEditor`.
- **Charts** — the 12 Plotly visualizations (`LineGraph`, `ScatterGraph`,
  `Heatmap`, `Chromatogram`, `PlateMap`, …), each carrying its Plotly deps and
  the `use-plotly-theme` hook (`registry:hook`) + `colors` util (`registry:lib`)
  as dependencies.
- **`registry:block` data‑app templates** — the headline deliverable. A small
  number of opinionated, end‑to‑end starters that wire the above together, e.g.:
  - **`tdp-data-explorer`** — `DataAppShell` + `TdpSearch` + a results `Table` +
    a `LineGraph`, backed by a sample data hook. The canonical "tweak and own"
    data app.
  - **`dashboard`** / **`settings-page`** — re‑introduce as _real_ blocks
    (the now‑removed stubs were aspirational).

  Source the blocks from the (currently empty) `examples/vite-themed-app/` so the
  template doubles as a runnable example and a registry item.

### Phase 3 — Discoverability

- Add a "Copy registry command" snippet to each component's Storybook docs page
  (the install URL and the Storybook page share an origin).
- A short Storybook "Using the registry" docs page mirroring §1–2 here.
- Consider a `registry:style` item bundling our design tokens (`index.css`) so a
  consumer can `npx shadcn add tetrascience-theme` to adopt the look wholesale.

---

## 6. Local workflow

```bash
yarn registry:build      # build registry JSON into .storybook/public/r/
yarn storybook           # browse components; registry served at /r/*.json
yarn build-storybook     # registry:build + storybook build (what Vercel runs)
```

To test the consumer experience end‑to‑end, point `shadcn add` at a locally
served file (e.g. run `yarn storybook` and add from `http://localhost:6006/r/<name>.json`).
