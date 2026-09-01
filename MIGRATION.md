# Migration Guides

- **[v0.7.x → v1.0.0](#migrating-from-v07x-to-v100)** — current release. Chart renames, removed
  components, optional peer dependencies, per-component imports.
- [Legacy: atom/molecule/organism → shadcn/Radix UI](#migration-guide-ts-lib-ui-kit-v2-shadcnradix-ui)
  — the older restructure, kept for apps still on the pre-shadcn architecture.

---

## Migrating from v0.7.x to v1.0.0

> **Jira:** [SW-2244](https://tetrascience.atlassian.net/browse/SW-2244) (renames) ·
> [SW-2007](https://tetrascience.atlassian.net/browse/SW-2007) (optional peers, per-component entries) ·
> [SW-1917](https://tetrascience.atlassian.net/browse/SW-1917) (deprecated removals)

v1.0.0 is the first stable major. Three things break, in rough order of how likely they are to hit you:

1. **Chart components were renamed** — every `*Graph` name is gone.
2. **Heavy dependencies are no longer installed for you** — they are optional peers you install per feature.
3. **Four components were removed** — two deliberately deprecated, two with no successor.

Nothing else in the public API changed. React 19, Node 18+ and the TDP v4.x requirement are unchanged.

### Upgrade checklist

```bash
# 1. Upgrade
yarn add @tetrascience-npm/tetrascience-react-ui@^1.0.0

# 2. Install only the optional peers your app actually uses (see table below)
yarn add plotly.js-dist                        # if you render any chart
yarn add @streamdown/math @streamdown/mermaid  # if you import from the package root (see note)
yarn add @rdkit/rdkit                          # if you use MoleculeStructure

# 3. Rename chart imports (see table below), then typecheck — TypeScript finds the rest
npx tsc --noEmit
```

### 1. Renamed components

| v0.7.0              | v1.0.0                | Notes                                          |
| ------------------- | --------------------- | ---------------------------------------------- |
| `AreaGraph`         | `AreaPlot`            | Props unchanged                                |
| `BarGraph`          | `BarChart`            | Props unchanged                                |
| `Boxplot`           | `BoxPlot`             | Capital `P` — props unchanged                  |
| `LineGraph`         | `LinePlot`            | Props unchanged                                |
| `ScatterGraph`      | `ScatterPlot`         | Props unchanged                                |
| `ChromatogramChart` | `StackedChromatogram` | The single-trace `Chromatogram` keeps its name |

Exported prop types follow the component name (`AreaGraphProps` → `AreaPlotProps`, and so on).

TypeScript flags all of these with a suggestion, so a `tsc --noEmit` pass after the upgrade is the
fastest way to find every call site:

```
TS2724: no exported member named 'Boxplot'. Did you mean 'BoxPlot'?
```

### 2. Removed components

| v0.7.0     | Replacement                                                                      | Why                                                                                                          |
| ---------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `Drawer`   | `Sheet`                                                                          | Long deprecated ([SW-1917](https://tetrascience.atlassian.net/browse/SW-1917))                               |
| `InputOTP` | `Input` (or your own composition)                                                | Long deprecated ([SW-1917](https://tetrascience.atlassian.net/browse/SW-1917))                               |
| `DotPlot`  | **None.** Closest is `ScatterPlot`                                               | Dropped in the chart cleanup ([SW-2244](https://tetrascience.atlassian.net/browse/SW-2244)) — see note below |
| `Heatmap`  | **None.** Closest is `PlateMap` for plate-shaped data, otherwise Plotly directly | Dropped in the chart cleanup ([SW-2244](https://tetrascience.atlassian.net/browse/SW-2244)) — see note below |

`DotPlot` and `Heatmap` have no drop-in successor, and unlike `Drawer`/`InputOTP` they were never
formally deprecated — they disappeared as part of a Storybook rename cleanup. Whether that removal
was intended is still being confirmed under
[SW-2472](https://tetrascience.atlassian.net/browse/SW-2472); this guide will be updated with the
decision. If you depend on either, pin to `0.7.x` while you port and tell the UI kit team — that
demand is exactly what the decision turns on.

These two produce a bare `TS2305: no exported member` with no suggestion, which is how you can tell a
removal from a rename.

### 3. New in v1.0.0

| Component                | Area     | Notes                                                 |
| ------------------------ | -------- | ----------------------------------------------------- |
| `Electropherogram`       | charts   | New scientific visualisation                          |
| `ScatterPlotInteractive` | charts   | Selection/brushing scatter; was internal-only before  |
| `MoleculeStructure`      | composed | SMILES → 2D structure. **Needs extra setup — see §5** |
| `TetraMoleculeIcon`      | ui       | Icon primitive                                        |
| `AssistantLayout`        | composed | Dockable AI assistant panel                           |
| `TopBar`, `UserMenu`     | composed | Extracted from `DataAppShell`, now usable standalone  |

`DataAppShell` also gained `PrimaryNav`, `SecondaryNav` and `RightPanel` subcomponents.

### 4. Optional peer dependencies

Heavy dependencies are no longer regular dependencies — installing the kit no longer drags Plotly,
RDKit or the markdown plugin stack into your `node_modules`. Install what you use:

| You use…                                                                         | Install                                                          |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Any `charts/` component                                                          | `plotly.js-dist`                                                 |
| `MessageResponse` / `Reasoning` (AI markdown)                                    | `@streamdown/math`, `@streamdown/mermaid`                        |
| `MoleculeStructure`                                                              | `@rdkit/rdkit` (**plus a served WASM — see §5**)                 |
| **Any import from the package root** (`@tetrascience-npm/tetrascience-react-ui`) | `@streamdown/math`, `@streamdown/mermaid` — see the caveat below |
| `/server` Athena provider                                                        | `@aws-sdk/client-athena`                                         |
| `/server` Snowflake provider                                                     | `snowflake-sdk`                                                  |
| `/server` Databricks provider                                                    | `@databricks/sql`                                                |

> **Caveat — root-entry imports need the streamdown peers regardless of what you use.**
> The AI markdown plugins are only ever reached through a dynamic import, but a dynamic-import target
> is still part of the bundler's module graph, and its _named_ static imports must resolve. With
> `@streamdown/math` absent, a root-entry build fails even if your only kit import is `AreaPlot`:
>
> ```
> dist/components/ai/streamdown-plugins.js (2:9): "math" is not exported by
> "__vite-optional-peer-dep:@streamdown/math:@tetrascience-npm/tetrascience-react-ui"
> ```
>
> Two ways out: install the two packages, or import via per-component subpaths (§6), which sidesteps
> the barrel entirely. This fails loudly at build time, so it can never reach production silently.
> Tracked in [SW-2472](https://tetrascience.atlassian.net/browse/SW-2472).

A missing peer that _is_ only reached dynamically — `plotly.js-dist` — does **not** fail the build.
Under Vite/Rollup it resolves to an empty stub and surfaces at runtime as a console error from the
loader (`Failed to load 'plotly.js-dist' …`) with the chart never rendering. If your charts render
blank after upgrading, check that `plotly.js-dist` is installed.

### 5. `MoleculeStructure` also needs the RDKit WASM served

Installing `@rdkit/rdkit` is **not sufficient**. RDKit is a ~6.6 MB WebAssembly module that the
package does not place anywhere your app serves it, so the loader's fetch for `RDKit_minimal.wasm`
falls through to your dev server's SPA fallback and returns `index.html`. The component then renders
its `errorContent` — by default the text **"Invalid structure"** — for a perfectly valid SMILES.

Point the loader at a served copy once, at app startup:

```ts
import { configureRDKit } from "@tetrascience-npm/tetrascience-react-ui";

// Option A — let your bundler emit and fingerprint it (Vite):
import wasmSrc from "@rdkit/rdkit/dist/RDKit_minimal.wasm?url";
configureRDKit({ wasmSrc });

// Option B — copy node_modules/@rdkit/rdkit/dist/RDKit_minimal.wasm into public/
configureRDKit({ wasmSrc: "/RDKit_minimal.wasm" });
```

Verify it worked: the network request for `RDKit_minimal.wasm` should return
`Content-Type: application/wasm` and ~6.9 MB, not `text/html` and a few hundred bytes.

> **Diagnosing:** "Invalid structure" currently means _either_ a bad SMILES _or_ RDKit failing to
> load. If a SMILES you trust renders as invalid, suspect the WASM first. Splitting these two
> messages is tracked in [SW-2472](https://tetrascience.atlassian.net/browse/SW-2472).

### 6. Per-component imports (new, optional)

Every root export now also ships at its own subpath. Nothing you have breaks — the root barrel still
works — but subpath imports cut what your bundler and Jest have to evaluate, and they avoid the
streamdown caveat in §4 entirely.

```ts
// Root barrel — still supported
import { Button, AreaPlot } from "@tetrascience-npm/tetrascience-react-ui";

// Per-component — smaller graph, no optional-peer pull-through
import { Button } from "@tetrascience-npm/tetrascience-react-ui/ui/button";
import { AreaPlot } from "@tetrascience-npm/tetrascience-react-ui/charts/AreaPlot";
```

Subpath shape follows the source tree: `./ui/<kebab-case>`, `./composed/<PascalCase>`,
`./charts/<PascalCase>`, `./ai/<kebab-case>`, `./utils/colors`, `./lib/shiki`.

QE measured a subpath-only consumer building at 90.70 kB with zero optional peers installed, against
a 114.68 kB main chunk for a root-barrel consumer (both with Plotly code-split into its own lazy
chunk). Your numbers will differ with how much of the kit you use.

### Known issues in v1.0.0

Found by QE review after the tag was cut, tracked in
[SW-2472](https://tetrascience.atlassian.net/browse/SW-2472). None block adoption.

| Issue                                                                                                                                                                                            | Impact                                                                                                                                                       | Workaround                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `./ui/progress` and `./ui/snippet` resolve **types but no runtime module** — `dist/components/ui/` has 54 `.d.ts`, `dist/ui/` has 53 `.js`. An import typechecks clean and then fails the build. | Neither component is exported from the root barrel either (nor was `progress` in v0.7.0), so nothing regressed — but the subpath makes them look importable. | Don't import them. Use your own progress/snippet component until they are either built or de-advertised. |
| Root-entry builds require the streamdown peers (§4).                                                                                                                                             | Build fails loudly; nothing ships broken.                                                                                                                    | Install the two packages, or use subpath imports.                                                        |
| `MoleculeStructure` reports a WASM load failure as "Invalid structure" (§5).                                                                                                                     | Misleading — points at your input rather than at the asset.                                                                                                  | Configure `wasmSrc`; pass a custom `errorContent` if you want to distinguish.                            |
| A missing `plotly.js-dist` does not fail the build under Vite/Rollup, contrary to what the loader's source comment used to claim.                                                                | Charts silently don't render; the loader logs an error at runtime.                                                                                           | Install `plotly.js-dist` whenever you use charts.                                                        |

---

# Migration Guide: ts-lib-ui-kit v2 (shadcn/Radix UI)

> **Jira:** [SW-1430](https://tetrascience.atlassian.net/browse/SW-1430) — Define migration strategy for component layers

## Overview

The UI kit has been migrated from a custom atom/molecule/organism architecture with SCSS to **shadcn (Radix UI)** components with **Tailwind CSS**. This guide covers all breaking changes and how to update your imports.

## Folder Architecture Changes

| Before                                          | After                                        |
| ----------------------------------------------- | -------------------------------------------- |
| `atoms/`                                        | `ui/` (shadcn primitives)                    |
| `molecules/`                                    | `composed/` (TetraScience compositions)      |
| `organisms/`                                    | `composed/` + `charts/`                      |
| SCSS modules                                    | Tailwind CSS + CSS variables                 |
| Custom ThemeProvider                            | Tailwind CSS variables (oklch)               |
| `@atoms/`, `@molecules/`, `@organisms/` aliases | `@/components/ui/`, `@/components/composed/` |

## Import Path Changes

All imports still come from the package root — no deep imports needed:

```ts
// Before
import { Button, Badge, Card } from "@tetrascience-npm/tetrascience-react-ui";

// After (same — re-exported from package root)
import { Button, Badge, Card } from "@tetrascience-npm/tetrascience-react-ui";
```

**Internal path aliases changed (repo contributors only)**  
If you are working _inside this repository_ and were using the old `@atoms/@molecules/@organisms` aliases, use the new `@/components/...` aliases instead.  
**Note:** These `@/` aliases are **not** available to consuming applications; external apps should continue to import only from the package root (as in the example above), not via deep paths.

import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";

````

## Component Migration Matrix

### Atoms → UI Components (Replaced)

| Old (Atom)        | New (UI)                                          | Notes                             |
| ----------------- | ------------------------------------------------- | --------------------------------- |
| `Badge`           | `Badge`                                           | New variant API via CVA           |
| `Button`          | `Button`                                          | New variant/size props via CVA    |
| `ButtonControl`   | `Toggle`                                          | Renamed                           |
| `Card`            | `Card`, `CardHeader`, `CardContent`, `CardFooter` | Compound component pattern        |
| `Checkbox`        | `Checkbox`                                        | Radix-based, new API              |
| `CodeEditor`      | `CodeEditor`                                      | Monaco wrapper (custom)           |
| `Dropdown`        | `DropdownMenu` / `Select` / `ComboBox`            | Split into specific components    |
| `ErrorAlert`      | `Alert`                                           | Use `variant="destructive"`       |
| `Icon`            | Lucide icons                                      | Use `lucide-react` directly       |
| `Input`           | `Input`                                           | Simplified API                    |
| `Label`           | `Label`                                           | Radix-based                       |
| `MarkdownDisplay` | —                                                 | Removed (handle in consuming app) |
| `MenuItem`        | `DropdownMenuItem`                                | Part of DropdownMenu compound     |
| `Modal`           | `Dialog`                                          | Radix Dialog                      |
| `PopConfirm`      | `AlertDialog`                                     | Radix AlertDialog                 |
| `SupportiveText`  | `Field`                                           | Use Field wrapper for form hints  |
| `Tab`             | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`  | Compound component                |
| `TableCell`       | `TableCell`                                       | Part of Table compound            |
| `TableHeaderCell` | `TableHead`                                       | Part of Table compound            |
| `Textarea`        | `Textarea`                                        | Simplified API                    |
| `Toast`           | `Sonner`                                          | Uses sonner library               |
| `Toggle`          | `Toggle` / `Switch`                               | Two components available          |
| `TDPLink`         | `tdp-link`                                        | Moved to composed                 |
| `Tooltip`         | `Tooltip`, `TooltipTrigger`, `TooltipContent`     | Compound component                |

### Molecules → Composed / UI Components

| Old (Molecule)           | New Location                      | Notes                         |
| ------------------------ | --------------------------------- | ----------------------------- |
| `AppHeader`              | `composed/AppHeader`              | Restructured                  |
| `AssistantModal`         | `composed/AssistantModal`         | Restructured                  |
| `ButtonControlGroup`     | `ButtonGroup` (ui)                | Renamed                       |
| `CardSidebar`            | —                                 | Removed (use Card + Sidebar)  |
| `CodeScriptEditorButton` | `composed/CodeScriptEditorButton` | Moved                         |
| `FormField`              | `Field` (ui)                      | Renamed, simplified           |
| `LaunchContent`          | `composed/LaunchContent`          | Moved                         |
| `Menu`                   | `DropdownMenu` / `MenuBar` (ui)   | Use shadcn menus              |
| `Navbar`                 | `composed/Navbar`                 | Moved                         |
| `ProtocolConfiguration`  | `composed/ProtocolConfiguration`  | Moved                         |
| `ProtocolYamlCard`       | `composed/ProtocolYamlCard`       | Moved                         |
| `PythonEditorModal`      | `composed/PythonEditorModal`      | Moved                         |
| `SelectField`            | `Select` + `Field` (ui)           | Compose from primitives       |
| `Sidebar`                | `composed/Sidebar`                | Moved                         |
| `Table`                  | `Table` (ui)                      | shadcn compound component     |
| `TabGroup`               | `Tabs` (ui)                       | Use shadcn Tabs               |
| `ToastManager`           | `Sonner` (ui)                     | Use `<Toaster />` from sonner |

### Organisms → Composed / Charts

| Old (Organism)       | New Location         | Notes                                         |
| -------------------- | -------------------- | --------------------------------------------- |
| `AppLayout`          | `composed/AppLayout` | Moved                                         |
| `Main`               | `composed/Main`      | Moved (includes MainHeader, MainNavbar, etc.) |
| `TdpSearch`          | `composed/TdpSearch` | Moved                                         |
| `TaskScripts`        | —                    | Removed                                       |
| All chart components | `charts/`            | Moved to dedicated folder                     |

## New Components (No Old Equivalent)

These shadcn components are new additions with no prior equivalent:

| Component           | Description                 |
| ------------------- | --------------------------- |
| `Accordion`         | Expandable content sections |
| `AlertDialog`       | Confirmation dialogs        |
| `AspectRatio`       | Maintain aspect ratios      |
| `Avatar`            | User avatars                |
| `Breadcrumb`        | Navigation breadcrumbs      |
| `Calendar`          | Date picker calendar        |
| `Carousel`          | Image/content carousel      |
| `Collapsible`       | Collapsible content         |
| `ComboBox`          | Searchable select           |
| `Command`           | Command palette (cmdk)      |
| `ContextMenu`       | Right-click menus           |
| `HoverCard`         | Hover info cards            |
| `InputGroup`        | Input with addons           |
| `Item`              | Generic list item           |
| `KBD`               | Keyboard shortcut display   |
| `NavigationMenu`    | Navigation menus            |
| `RadioGroup`        | Radio button groups         |
| `ResizablePanel`    | Resizable layouts           |
| `ScrollArea`        | Custom scroll containers    |
| `Separator`         | Visual dividers             |
| `Sheet`             | Side panel overlay          |
| `Skeleton`          | Loading placeholders        |
| `Slider`            | Range slider                |
| `Spinner`           | Loading spinner             |
| `TetraScience Icon` | Company brand icon          |

## Styling Migration

### Before: SCSS

```scss
// Old: Component-level SCSS files
.ts-button {
  background-color: $primary-color;
  padding: $spacing-md;
  border-radius: $radius-sm;
}
````

### After: Tailwind CSS

```tsx
// New: Tailwind utility classes + CVA variants
const buttonVariants = cva("inline-flex items-center justify-center rounded-md", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      destructive: "bg-destructive text-destructive-foreground",
      outline: "border border-input bg-background",
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
    },
  },
});
```

### Theme Variables

Theme is now controlled via CSS variables instead of the old `ThemeProvider`:

```css
/* Old: ThemeProvider with JS theme object */
/* New: CSS variables in index.css */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* ... */
}
```

## Removed Exports

The following exports no longer exist:

- `ThemeProvider`, `defaultTheme`, `ThemeProviderProps`, `Theme`, `ThemeColors`, etc.
- `MarkdownDisplay`, `MarkdownDisplayProps`
- `TaskScripts`
- `CardSidebar`, `CardSidebarProps`
- `SelectField`, `SelectFieldProps` (use `Select` + `Field` instead)
- `ToastManager`, `ToastManagerProps` (use `Sonner`/`Toaster` instead)
- All `*Props` type exports are now co-located with components (still importable from root)

## Dependencies

### Added

- `radix-ui` — Core UI primitives
- `tailwindcss` + `tailwind-merge` — Styling
- `class-variance-authority` — Component variants
- `lucide-react` — Icons
- `sonner` — Toast notifications
- `cmdk` — Command palette
- `embla-carousel-react` — Carousel
- `react-day-picker` + `date-fns` — Calendar
- `react-resizable-panels` — Resizable layouts

### Removed

- All SCSS/Sass dependencies
- Custom theme system
- Old icon SVG assets

## Quick Start

```tsx
import { Button, Card, CardHeader, CardContent, Input, Label } from "@tetrascience-npm/tetrascience-react-ui";

function MyForm() {
  return (
    <Card>
      <CardHeader>My Form</CardHeader>
      <CardContent>
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Enter name" />
        <Button variant="default" size="sm">
          Submit
        </Button>
      </CardContent>
    </Card>
  );
}
```
