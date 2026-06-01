# Registry — Design Patterns & Data‑App Examples

> **Status:** Phase 1 implemented (buildable + publishable patterns registry, one example block). More example blocks are proposed in the roadmap.

This document describes the **patterns registry**: a [shadcn registry](https://ui.shadcn.com/docs/registry) that lets data‑app builders pull **pre‑coded examples** into their app, tweak them, and own the source.

It is deliberately **separate from the component library itself**. The base UI — every primitive, composed component, and chart — is distributed through the **npm package** (`@tetrascience-npm/tetrascience-react-ui`) and is **not** published to the registry. The registry only ships _examples that compose those npm components_.

---

## 1. The boundary: npm vs the registry

| | npm package | patterns registry |
| --- | --- | --- |
| Contains | All components: `ui/`, `composed/`, `charts/`, `ai/`, utils | Only example pages / patterns |
| Install | `yarn add @tetrascience-npm/tetrascience-react-ui` | `npx shadcn add <url>` |
| Ownership | Library owns it; you upgrade via the package | You own the copied example source |
| Imports | `import { Button } from "@tetrascience-npm/tetrascience-react-ui"` | The example imports components **from the npm package** |

**Why keep base UI out of the registry?** The components are a versioned, supported
artifact — consumers should get fixes and improvements via `yarn upgrade`, not by
copying a frozen snapshot into their repo. Examples are the opposite: a starting
point you are _expected_ to fork. So an example **imports** the components from the
package and only the example glue (layout, sample data, wiring) is copied.

```tsx
// What a registry example looks like — it depends on the package, it does not copy it.
import { DataAppShell, StatCard, LineGraph } from "@tetrascience-npm/tetrascience-react-ui";
```

This means a copied example "just works" against the installed package, and the
components inside it keep getting updates from npm.

---

## 2. How it works

shadcn registries are **static JSON files served over HTTP**. Each item inlines its
source files and declares its dependencies. The consumer runs `npx shadcn add <url>`
and the CLI writes the example source into their project and installs the listed
npm dependencies (including `@tetrascience-npm/tetrascience-react-ui` itself).

```
registry.json                     # manifest: example items, their files & npm deps
   │  yarn registry:build  (= shadcn build --output .storybook/public/r)
   ▼
.storybook/public/r/*.json        # one built file per example (generated, gitignored)
   │  storybook build  (staticDirs: ["./public"])  →  Vercel deploy
   ▼
https://ts-lib-ui-kit-storybook.vercel.app/r/<name>.json
   │  npx shadcn add <url>
   ▼
consumer app: components/DataExplorerPage.tsx  (theirs to edit; imports the npm pkg)
```

### Where example source lives

Example source lives in the top‑level **`registry/`** directory — intentionally
**outside `src/`**, so it is excluded from the npm library build (`vite.config.ts`)
and the library's `tsconfig` (`include: ["src"]`). Examples are shipped _by the
registry_, never bundled into the npm package.

### Hosting

The built registry is **co‑hosted with the Storybook site** on Vercel. Storybook
serves `staticDirs: ["./public"]`, so anything written to `.storybook/public/r/`
is published at `<storybook-url>/r/`. `yarn build-storybook` runs `yarn registry:build`
first, so every Storybook deploy republishes the registry. The generated
`.storybook/public/r/` directory is gitignored — `registry.json` is the source of truth.

---

## 3. Authoring an example

1. Add source under `registry/examples/<name>/`. Import every component **from
   `@tetrascience-npm/tetrascience-react-ui`** (never via `@/` aliases — that would
   make shadcn copy a primitive instead of importing the package).
2. Register it in `registry.json`:

```jsonc
{
  "name": "data-explorer",
  "type": "registry:block",
  "title": "Data Explorer",
  "description": "…",
  // The package is a normal npm dependency of the example.
  "dependencies": ["@tetrascience-npm/tetrascience-react-ui", "lucide-react"],
  // No registryDependencies — we do NOT pull copies of base UI.
  "files": [
    { "path": "registry/examples/data-explorer/DataExplorerPage.tsx", "type": "registry:component" },
    { "path": "registry/examples/data-explorer/useSampleData.ts", "type": "registry:lib" }
  ]
}
```

3. `yarn registry:build` regenerates the served JSON. Keep `dependencies` accurate
   and `registryDependencies` empty (examples depend on the **package**, not on other
   registry items).

> Note: `registry/` is linted (`yarn lint`) but not type‑checked by the library's
> `tsconfig` (which only includes `src`). Author examples against the real component
> APIs; a future improvement could add a dedicated tsconfig that aliases the package
> name to `src` so examples type‑check in‑repo.

---

## 4. Current catalog

| Item | Type | What it shows |
| --- | --- | --- |
| `data-explorer` | `registry:block` | An end‑to‑end data‑app page: `DataAppShell` nav + `StatCard` KPIs + `LineGraph` trend + results `Table`, backed by a swappable `useSampleData` hook. |

```bash
npx shadcn@latest add https://ts-lib-ui-kit-storybook.vercel.app/r/data-explorer.json
```

---

## 5. Roadmap — more example blocks

The headline deliverable is a small, curated set of opinionated, end‑to‑end
starters — each composing npm components into a real data‑app pattern:

- **`tdp-search-app`** — `DataAppShell` + `TdpSearch` + results table; the canonical
  "find data in TDP and act on it" flow.
- **`ai-assistant`** — the `Chat` / `ai/*` components wired into a working assistant pane.
- **`instrument-dashboard`** — a KPI + multi‑chart dashboard (`StatCard`, `BarGraph`,
  `Heatmap`).
- **`plate-map-workbench`** — `PlateMapEditor` in an editing workflow.

Each lands as a `registry:block` under `registry/examples/`, importing components
from the npm package.

### Discoverability (Phase 3)

- A "Copy this example" snippet on the matching Storybook docs page (same origin as
  the registry URL).
- A short Storybook "Using the patterns registry" page mirroring §1–2.

---

## 6. Local workflow

```bash
yarn registry:build      # build registry JSON into .storybook/public/r/
yarn storybook           # browse components; registry served at /r/*.json
yarn build-storybook     # registry:build + storybook build (what Vercel runs)
```

To test the consumer experience, point `shadcn add` at a locally served file (run
`yarn storybook`, then `npx shadcn add http://localhost:6006/r/data-explorer.json`
in a scratch app).
