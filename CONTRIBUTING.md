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

| Command                | Description                                   |
| ---------------------- | --------------------------------------------- |
| `yarn storybook`       | Run Storybook development server on port 6006 |
| `yarn build`           | Build the library for production (using Vite) |
| `yarn build-storybook` | Build Storybook for deployment                |
| `yarn test`            | Run unit tests only                           |
| `yarn test:all`        | Run unit tests + Storybook component tests    |
| `yarn lint`            | Run ESLint                                    |
| `yarn typecheck`       | Run TypeScript type checking                  |
| `yarn prepare`         | Set up Husky git hooks                        |
| `yarn prepublishOnly`  | Build the package before publishing           |

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

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This is enforced locally by the `commit-msg` hook. PRs are squash-merged with the PR title as the commit message, so the **PR title** is what drives versioning (see [Release Process](#release-process)).

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

Releases are cut by [Release Please](https://github.com/googleapis/release-please) through a release
PR. **Do not bump `package.json`'s version, create tags, or edit the release PR by hand.**

### How it works

1. **Every merge to `main` updates the release PR.** The `Release Please` workflow
   (`.github/workflows/release-please.yml`) reads the PR titles merged since the last tag and opens or
   updates one PR titled `chore: UXT-83 release X.Y.Z`, from the branch
   `release-please--branches--main`. It bumps `package.json`, adds the new entry to the top of
   `CHANGELOG.md`, and updates the version line in `README.md` and `.release-please-manifest.json`.
   If only non-releasing types have merged (see below), no release PR is opened.
2. **Review and merge the release PR.** It is opened with the `GH_TOKEN` secret, so its author is that
   token's owner, who cannot approve it. The PR title check and Link Check run on it. The expensive
   checks are skipped on purpose: `CI / build`, the alpha `Publish PR`, and the Vercel preview (and
   with it Storybook Tests). The PR changes only the version, CHANGELOG and README, and its code is
   `main`'s, which CI already ran on push. No status check is required on `main`, so the skipped jobs
   don't block the merge.
3. **Merging creates the tag and the GitHub release.** The workflow run for that merge tags the merge
   commit `vX.Y.Z` and creates a GitHub release with the same notes. The tag sits on the commit that
   bumped `package.json`, so the tag and the published version always match.
4. **Approve the publish.** The tag starts `Publish to Public npm` (`publish-public.yml`), which waits
   at the `PROD` environment until a reviewer approves it on the workflow run's page. **Before
   approving, check that `CI` passed on the release PR's merge commit on `main`.** That run is the one
   that builds and tests the exact commit being published, and it starts at the same time as the tag.

Like every merge to `main`, merging the release PR also publishes a `-beta.N` build.

To check what the next release would be, open the release PR. If there is none, nothing releasable has
merged since the last tag.

### Version bump rules

The version is computed from the squash-merge commits on `main`. Each one is the PR title with an
empty body (the repository's squash setting), so **the PR title is what counts**.

| PR titles merged since the last release                                      | Next version              |
| ---------------------------------------------------------------------------- | ------------------------- |
| Only `fix`, `perf`, `revert`                                                 | Patch — `1.1.0` → `1.1.1` |
| At least one `feat`                                                          | Minor — `1.1.0` → `1.2.0` |
| Any type with `!` (`feat!:`, `fix(charts)!:`), or a `BREAKING CHANGE` footer | Major — `1.1.0` → `2.0.0` |
| Only `docs`, `style`, `refactor`, `test`, `build`, `ci`, `chore`             | No release                |

A `BREAKING CHANGE:` footer in a commit on your branch does not survive the squash. Mark the PR title
with `!`, or put the footer in an override block (below).

### Curated release notes

Release Please rewrites the release PR on every merge to `main`, so edits to it are lost. Curated text
goes here instead:

| What                                                        | Where                                                                                                                                                      |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Upgrade guidance (renames, changed defaults, steps to take) | `MIGRATION.md`, in a normal PR merged before the release PR. Point to it from a changelog line (override block) or from the GitHub release.                |
| Reworded or extra changelog lines for a merged PR           | A `BEGIN_COMMIT_OVERRIDE` block in that PR's description. Edit it after merging if needed; it takes effect the next time the Release Please workflow runs. |
| Intro text on the release page                              | Edit the GitHub release after it is created. This does not change `CHANGELOG.md`.                                                                          |
| A correction to an entry that has already been released     | A normal docs PR that edits `CHANGELOG.md`. Release Please only adds entries above the newest one and never rewrites older ones.                           |

An override block replaces the squash commit's message, and each message in it becomes one changelog
line. It is parsed like a commit, so a `BREAKING CHANGE:` footer or a `!` in it makes the release
major:

```text
BEGIN_COMMIT_OVERRIDE
feat: SW-2596 Stop shipping document-level CSS; see MIGRATION.md for renamed classes

fix: SW-2441 Prevent data table pagination overflow
END_COMMIT_OVERRIDE
```

### Changing the Jira key in the release PR title

The PR title checker requires `type: KEY-123 Description`, so the key is fixed in
`pull-request-title-pattern` in `release-please-config.json`. Change it there in a normal PR, and the
open release PR is retitled on the next run. Don't edit the release PR's title by hand: after the
merge, Release Please reads the version back out of the title using that pattern, and a title that
doesn't match means no tag is created.
