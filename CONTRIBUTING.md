# Developer Guide

This document contains development setup and contribution guidelines for the TetraScience UI library.

## Project Structure

```
ts-lib-ui-kit/
├── src/
│   ├── components/      # UI components
│   │   ├── ui/          # shadcn/ui primitives (Button, Card, Dialog, etc.)
│   │   ├── composed/    # Multi-component compositions (AppHeader, Sidebar, etc.)
│   │   └── charts/      # Plotly-based data visualizations (AreaGraph, Heatmap, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities (cn() helper via clsx + tailwind-merge)
│   ├── server/          # Server-side utilities (being migrated out)
│   └── utils/           # Pure utility functions (colors, formatters)
├── .storybook/          # Storybook configuration
├── examples/            # Example applications
├── scripts/             # Build and automation scripts (Zephyr sync, etc.)
└── dist/                # Built library output (generated)
```

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn 4+ (Berry)

### Development Setup

1. **Install dependencies**

```bash
yarn
```

2. **Start Storybook development server**

```bash
yarn storybook
```

Visit http://localhost:6006 to view the component library in Storybook.

## Available Scripts

| Command                | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| `yarn storybook`       | Run Storybook development server on port 6006                |
| `yarn build`           | Build the library for production (using Vite)                |
| `yarn build-storybook` | Build Storybook for deployment                               |
| `yarn test`            | Run unit tests only                                          |
| `yarn test:all`        | Run unit tests + Storybook component tests                   |
| `yarn lint`            | Run ESLint                                                   |
| `yarn typecheck`       | Run TypeScript type checking                                 |
| `yarn prepare`         | Set up Husky git hooks                                       |
| `yarn prepublishOnly`  | Build the package before publishing                          |
| `yarn release`         | Run semantic-release (CI use only)                           |
| `yarn release:dry-run` | Preview the next release locally without publishing anything |

## Path Aliases

The project uses path aliases for cleaner imports (configured in `tsconfig.json` and `vite.config.ts`):

| Alias | Path    |
| ----- | ------- |
| `@/*` | `src/*` |

## Build System

The library uses Vite 7 in library mode to produce:

- **ES Module bundle**: `dist/index.js`
- **CommonJS bundle**: `dist/index.cjs`
- **Type declarations**: `dist/index.d.ts`
- **Compiled CSS**: `dist/index.css`
- **Server subpath exports**: `dist/server.js`, `dist/providers/athena.js`, `dist/providers/snowflake.js`, `dist/providers/databricks.js` (with corresponding `.cjs` and `.d.ts`)

## Component Development

### Component Patterns

The library has two component patterns:

**`ui/` components (shadcn/ui pattern):**
Single `kebab-case.tsx` files in `src/components/ui/`. These wrap radix-ui or `@base-ui/react` primitives with CVA variants and Tailwind classes.

```
src/components/ui/
├── button.tsx
├── card.tsx
├── dialog.tsx
└── ...
```

**`composed/` and `charts/` components (preferred for new components):**
PascalCase directories with separate files for implementation, stories, and barrel export. Some legacy `composed/` components exist as single `kebab-case.tsx` files (e.g. `tdp-link.tsx`); use the directory pattern for new work.

```
ComponentName/
├── ComponentName.tsx        # Main component
├── ComponentName.stories.tsx # Storybook documentation
└── index.ts                 # Exports component + types
```

### Component Template (React 19)

New `ui/` components follow the shadcn/ui pattern with Tailwind CSS and CVA:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

const myComponentVariants = cva("inline-flex items-center rounded-lg text-sm font-medium transition-all", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      outline: "border-border bg-background hover:bg-muted",
    },
    size: {
      default: "h-8 px-2.5",
      sm: "h-7 px-2 text-xs",
      lg: "h-9 px-3",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

function MyComponent({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof myComponentVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "div";

  return <Comp data-slot="my-component" className={cn(myComponentVariants({ variant, size, className }))} {...props} />;
}

export { MyComponent, myComponentVariants };
```

**Note:** This library prefers the ref-as-prop pattern. Avoid `React.forwardRef` in new components — existing usages are being migrated.

### Adding a New Component

1. For `ui/` primitives: create a `kebab-case.tsx` file in `src/components/ui/`
2. For composed/chart components: create a PascalCase directory under the appropriate category (`composed/` or `charts/`)
3. Implement the component following the patterns above
4. Add a Storybook story for documentation, and **pick its `title` deliberately** — see below
5. Add a row to the component inventory in [`DESIGN.md`](./DESIGN.md) §3
6. Export from `src/index.ts`

### Choosing a Storybook `title`

The story `title` is **not** derived from the source directory — the two
intentionally differ. `Snippet` lives in `ui/` but is titled
`Components/Data Display/Snippet`; `Chat` lives in `composed/` but is titled
`AI Elements/Conversation/Chat`. Title by what a consumer is shopping for, not
by where you put the file.

| Section               | For                                     | Sub-category required?                                                                                               |
| --------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `Foundations/`        | Tokens, type, spacing, elevation, icons | No                                                                                                                   |
| `Components/`         | Reusable primitives                     | **Yes** — Actions, Forms & Inputs, Navigation & Menus, Layout & Structure, Overlays, Feedback & Status, Data Display |
| `AI Elements/`        | Chat and agent UI                       | **Yes** — Conversation, Input, Agent Activity, Attribution, Status & Effects                                         |
| `Design Patterns/`    | Compositions, app shells                | No                                                                                                                   |
| `Data Viz/`           | Charts and scientific plots             | No                                                                                                                   |
| `TetraData Platform/` | TDP-specific, not reusable outside TDP  | No                                                                                                                   |

```ts
const meta: Meta<typeof MyComponent> = {
  title: "Components/Data Display/My Component", // section / category / name
  component: MyComponent,
  tags: ["autodocs"],
};
```

The sub-category must match the component's `Category` in DESIGN.md §3 — that
column is the source of truth. There is no "Other" bucket: if nothing fits,
raise it rather than inventing a section, and never create a new top-level
section for one or two stories.

Adding a new sub-category also means adding it to `storySort.order` in
[`.storybook/preview.ts`](./.storybook/preview.ts), or it sorts alphabetically
into an arbitrary position.

**Moving an existing story** is safe for Zephyr — the scripts read only the last
title segment (the component name) and the source directory, never the category
path. Changing the last segment _does_ break the mapping. Story IDs change with
the category path, so external deep links won't survive a move.

See [`DESIGN.md`](./DESIGN.md) §3.1 for the full rationale.

### Styling Guidelines

- Use **Tailwind CSS 4** utility classes via the `cn()` helper from `src/lib/utils.ts`
- Use **CVA** (`class-variance-authority`) for component variant definitions
- Design tokens are CSS custom properties in `src/index.css` (oklch values), mapped to Tailwind via `@theme inline`
- Icons come from **lucide-react**
- Support theming via the `ThemeProvider` (see `THEMING.md`)

## Code Quality

### Pre-commit Hooks

The project uses [Husky](https://typicode.github.io/husky/) to run two git hooks automatically:

| Hook         | Trigger                         | What it does                                                                                          |
| ------------ | ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `pre-commit` | Before every commit             | Runs `lint-staged` — auto-fixes ESLint issues on staged `*.{js,jsx,ts,tsx}` files                     |
| `commit-msg` | After you type a commit message | Runs `commitlint` — rejects messages that don't follow [Conventional Commits](#commit-message-format) |

If a hook fails, the commit is aborted. Fix the reported issue and try again.

### Commit Message Format

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This is enforced locally by the `commit-msg` hook and drives automated versioning on CI.

**Structure:**

```
<type>(<optional scope>): <short description>

[optional body]

[optional footer(s)]
```

**Types and their effect on the release version:**

| Type              | Description                             | Version bump    |
| ----------------- | --------------------------------------- | --------------- |
| `feat`            | A new feature                           | `minor` (0.x.0) |
| `fix`             | A bug fix                               | `patch` (0.0.x) |
| `feat!` or `fix!` | Breaking change (via `!`)               | `major` (x.0.0) |
| `docs`            | Documentation only                      | none            |
| `style`           | Formatting, whitespace                  | none            |
| `refactor`        | Code restructuring, no behaviour change | none            |
| `test`            | Adding or fixing tests                  | none            |
| `chore`           | Build process, tooling, dependencies    | none            |
| `ci`              | CI/CD configuration                     | none            |
| `perf`            | Performance improvement                 | `patch` (0.0.x) |

**Breaking changes** can be declared in two ways:

```bash
# 1. Append ! after the type
feat!: remove deprecated `size` prop from Button

# 2. Add a BREAKING CHANGE footer
feat: redesign Table component API

BREAKING CHANGE: The `variant` prop has been renamed to `intent`.
Replace all usages of `variant="primary"` with `intent="primary"`.
```

**Examples:**

```bash
git commit -m "feat(button): add loading state prop"
git commit -m "fix(tooltip): correct positioning on scroll"
git commit -m "chore: upgrade vitest to v3"
git commit -m "docs: add usage examples to THEMING.md"
git commit -m "feat!: drop support for Node 18"
```

### Linting

ESLint 9 with flat config format (`eslint.config.js`). Run manually with:

```bash
yarn lint
```

## Testing

### Storybook Component Tests (Preferred for React Components)

**Prefer Storybook play function tests** for React components. They run in a real browser environment via `@storybook/addon-vitest` and Vitest with Playwright, providing more realistic coverage than jsdom unit tests. Reserve unit tests (`*.test.ts`) for pure utility functions, hooks, and non-visual logic.

#### How It Works

1. **Play functions** are defined in story files (e.g., `Component.stories.tsx`)
2. **Vitest** executes these tests via `yarn test:all`
3. Tests use `storybook/test` utilities: `within`, `expect`, `userEvent`

Example:

```typescript
export const MyStory: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Button is clickable", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      expect(button).toHaveAttribute("aria-pressed", "true");
    });
  },
};
```

#### Zephyr Integration

The Zephyr scripts are thin wrappers around a shared internal `ts-lib-zephyr-nodejs` library. Test results report per-story screenshots embedded directly into each Zephyr step.

Test cases are linked to Zephyr Scale via story parameters. These IDs are auto-generated by `sync-storybook-zephyr`:

```typescript
export const MyStory: Story = {
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T801" },
  },
  play: async ({ canvasElement }) => {
    /* ... */
  },
};
```

#### Known Limitations

- **Play functions auto-run in Storybook UI**: When viewing stories in the browser, play functions automatically execute. This is a [known Storybook limitation](https://github.com/storybookjs/storybook/discussions/23616) - the `autoplay` parameter only works for Docs view, not Canvas view. There is no clean way to disable this without patching Storybook internals.

- **Workaround for jarring auto-play**: For interactive tests, add delays between actions to make the auto-play less jarring for users browsing Storybook:

  ```typescript
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  play: async ({ canvasElement }) => {
    await sleep(1000); // Delay before action
    await userEvent.click(button);
  };
  ```

## Release Process

Releases are cut by [semantic-release](https://semantic-release.gitbook.io/) when someone dispatches the
`Release` workflow. `main` is push-protected, so semantic-release cannot commit the version bump itself:
a prep PR does that first, and a workflow opens it for you. **Don't edit `package.json`'s version or
create git tags by hand.**

### Cutting a release

1. **Dispatch `Release prep`** (`.github/workflows/release-prep.yml`) from the Actions tab, giving only a
   Jira key. It works out the next version from the [Conventional Commit](#commit-message-format) PR
   titles since the last tag, using semantic-release's own analyzer, so it matches what `Release` will
   compute. It then opens a PR that:
   - sets `package.json` to that version;
   - adds the generated `CHANGELOG.md` entry (the same notes semantic-release writes on the GitHub
     release);
   - updates the README's version line, and its compatibility table when a new minor line starts.

   If nothing releasable has merged since the last tag, it stops and says so.

2. **Review and merge the prep PR.** Add upgrade notes to its CHANGELOG entry (and `MIGRATION.md`) for
   anything consumers must act on. Your edits are kept; nothing regenerates the PR.
3. **Dispatch `Release`** (`.github/workflows/release.yml`). It creates the `vX.Y.Z` tag and a GitHub
   release with generated notes. It stops before creating the tag
   (`scripts/release/verify-package-version.js`) unless `package.json` and the newest `CHANGELOG.md`
   entry both say the version being released, and no `feat`/`fix`/`perf`/`revert` PR has merged since
   that entry was written (it would ship missing from the CHANGELOG, even when it doesn't change the
   version). That happens when the prep PR hasn't merged, or when more PRs merged after it. In that
   case, run `Release prep` again. It replaces the unreleased entry and shows the old one in the PR
   body so you can carry its notes over.
4. **Approve the publish.** The tag starts `Publish to Public npm` (`publish-public.yml`), which waits at
   the `PROD` environment for a reviewer's approval.

To prepare a release by hand instead (e.g. to test locally), run `yarn tsx scripts/release/prepare-release.ts`
on an up-to-date `main` with tags fetched; it makes the same edits in your working tree.

### Version bump rules

The version comes from the squash-merge commits on `main`, each of which is the PR title with an empty
body, so **the PR title is what counts**.

| PR titles merged since the last release                 | Next version              |
| ------------------------------------------------------- | ------------------------- |
| Only `fix`, `perf`, `revert`                            | Patch — `1.1.0` → `1.1.1` |
| At least one `feat`                                     | Minor — `1.1.0` → `1.2.0` |
| Any type with `!` (`feat!:`, `fix(charts)!:`)           | Major — `1.1.0` → `2.0.0` |
| Only `chore`, `docs`, `style`, `refactor`, `test`, `ci` | No release                |

A `BREAKING CHANGE:` footer in a commit on your branch does not survive the squash merge; mark the PR
title with `!` instead. Likewise, title a revert PR `revert: SW-1234 …`, not GitHub's default
`Revert "…"` (which the PR title check rejects, and which would not release).

### Beta and alpha builds

- **Beta, on every merge to `main`**, published under the `beta` dist-tag to npm (`publish-public.yml`)
  and to JFrog (`publish-merge.yml`), and named for the **next** release: after `v1.1.0`, a merge
  publishes `1.2.0-beta.<run>.<attempt>` if a `feat:` has merged since the tag, and `1.1.1-beta.…`
  otherwise.
- **Alpha, only on request.** Add the `alpha` label to a PR to publish
  `<next version>-alpha.<run>.<attempt>` to JFrog, and again on each push while the label stays. PRs
  without the label don't publish anything.

Both are named by `next-version.yml`, a reusable workflow that runs `scripts/release/next-version.ts` (the
same calculation semantic-release will make) and that each publish workflow calls before writing the
result into `package.json` for the shared publish workflow.

### Dry-run locally

To preview what the next release would be without publishing anything:

```bash
yarn release:dry-run
```

This needs a `GITHUB_TOKEN` environment variable with push access to the repo (semantic-release checks
it even in a dry run). Until the prep PR has merged, the dry run ends with the version-mismatch error
from step 3; the version it names is the one the prep PR should set.
