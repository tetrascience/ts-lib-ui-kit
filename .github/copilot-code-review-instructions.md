# Copilot Code Review Instructions — ts-lib-ui-kit

This is a React 19 + TypeScript UI component library published as `@tetrascience-npm/tetrascience-react-ui`. It uses Vite 7 (library mode), Tailwind CSS 4, shadcn/ui, Storybook 10, Vitest, and Yarn 4.

> **Note:** Import ordering, accessibility, cognitive complexity, array method preferences, and other code-style rules are already enforced by ESLint (`yarn lint --max-warnings 0`). Copilot should focus on the architectural and design concerns below that automated linting cannot catch.

## Architecture & Structure

- Components are organised under `src/components/` in three categories:
  - **`ui/`** — shadcn/ui primitives (Button, Card, Dialog, etc.). Single `kebab-case.tsx` files wrapping radix-ui / `@base-ui/react` with CVA variants and Tailwind classes.
  - **`composed/`** — Multi-component compositions (AppHeader, Sidebar, Navbar, etc.). PascalCase directories with `ComponentName.tsx`, `ComponentName.stories.tsx`, and `index.ts`.
  - **`charts/`** — Plotly-based data visualizations (AreaGraph, Heatmap, Histogram, etc.). Same PascalCase directory pattern as `composed/`.
- `src/hooks/` — Custom React hooks.
- `src/lib/utils.ts` — `cn()` utility (clsx + tailwind-merge) used by all UI components.
- `src/server/` — Server-side utilities exported via multiple subpaths: `/server`, `/server/providers/athena`, `/server/providers/snowflake`, `/server/providers/databricks`. (Being migrated out — avoid adding new server-side functionality here.)
- All client components are exported from `src/index.ts`.
- Design tokens live in `src/index.css` (Tailwind CSS custom properties using oklch values).

## React 19 Patterns

- **Do NOT use `React.forwardRef`** — it is deprecated. Use the **ref-as-prop pattern** instead: accept `ref?: React.Ref<HTMLElement>` as a regular prop.
- Prefer **function components** with destructured props.
- Use `useMemo` and `useCallback` for computed values and stable callbacks.

## TypeScript

- Prefer `interface` for object shapes (extendable), `type` for unions/intersections.
- All component props should extend appropriate HTML element attributes via `React.ComponentProps<"element">`.
- **Flag all uses of `any`** — both new and existing. The ESLint rule is currently off, but we are incrementally eliminating `any` to enable it. Suggest `unknown` or proper generics as replacements.

## Styling

- Use **Tailwind CSS 4** utility classes composed via the `cn()` helper from `src/lib/utils.ts`.
- Use **CVA** (`class-variance-authority`) for defining component variant styles.
- Design tokens are defined as CSS custom properties in `src/index.css` using oklch values, mapped to Tailwind semantic colors via `@theme inline`.
- Light/dark theme support via `.dark` class on the root element.
- A `ThemeProvider` component supports programmatic theme overrides (see `THEMING.md`).
- Do NOT hardcode colors, spacing, or font sizes — use Tailwind semantic classes (`bg-primary`, `text-muted-foreground`, etc.).
- Icons come from `lucide-react`.

## Testing

- **Prefer Storybook play function tests** for React components — they run in a real browser via `@storybook/addon-vitest` and Playwright, providing more realistic coverage than jsdom.
- Unit tests (`*.test.ts` / `*.test.tsx`) are appropriate for pure utility functions, hooks, and non-visual logic.
- Storybook tests use `play` functions with `storybook/test` utilities (`within`, `expect`, `userEvent`).
- Storybook tests may include Zephyr Scale test case IDs in `parameters.zephyr.testCaseId` — do not remove or modify these.

## Code Quality

- Do NOT use `eslint-disable` comments — refactor the code instead. `@ts-ignore` is allowed only with a description.

## PR & Commit Conventions

- PR titles must match: `^[A-Z]+-[1-9][0-9]*: ` (e.g., `SW-1234: Add Button component`).
- Ensure new components have a corresponding Storybook story.
- Ensure `src/index.ts` exports are updated when adding/removing components.

## Security

- External links must use `target="_blank"` with `rel="noopener noreferrer"`.
- Do not expose secrets, tokens, or API keys in client-side code.

## What NOT to Flag

- `React.forwardRef` in existing code (migration is in progress).
- SCSS in legacy chart components.
- Magic numbers in test files, story files, constants files, config files, or script files.
