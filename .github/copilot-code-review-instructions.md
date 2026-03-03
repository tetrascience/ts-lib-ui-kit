# Copilot Code Review Instructions — ts-lib-ui-kit

This is a React 19 + TypeScript UI component library published as `@tetrascience-npm/tetrascience-react-ui`. It uses Yarn 4, Rollup, Storybook, Vitest, and styled-components/SCSS.

## Architecture & Structure

- Components follow **Atomic Design**: `atoms/` → `molecules/` → `organisms/` under `src/components/`.
- Every component must have: `ComponentName.tsx`, `ComponentName.stories.tsx`, `index.ts`. SCSS file is optional.
- New components must be exported from `src/index.ts`.
- Server-side utilities live in `src/server/` and are exported via a separate `/server` subpath.

## React 19 Patterns

- **Do NOT use `React.forwardRef`** — it is deprecated. Use the **ref-as-prop pattern** instead: accept `ref?: React.Ref<HTMLElement>` as a regular prop.
- Prefer **function components** with destructured props.
- Use `useMemo` and `useCallback` for computed values and stable callbacks.
- Follow React hooks rules strictly (`react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`).

## TypeScript

- Use `type` keyword for type-only imports: `import type { FC } from 'react'`.
- Prefer `interface` for object shapes (extendable), `type` for unions/intersections.
- Avoid `any` — use `unknown` or proper generics. Flag new uses of `any`.
- All component props interfaces should extend appropriate HTML element attributes when possible.

## Styling

- Use **styled-components** for dynamic, component-scoped styles.
- Use **SCSS** for static utility styles.
- Use **CSS variables** from `src/colors.css` for design tokens — do NOT hardcode colors, spacing, or font sizes.
- Prefix custom props passed to styled-components with `$` (transient props) to prevent DOM leakage.
- **Avoid inline `style` props** — use CSS classes instead. Inline styles are only acceptable for truly dynamic values that depend on props/state.
- Flag any hardcoded magic numbers — extract them to named constants.

## Accessibility

- Ensure proper ARIA labels and roles on interactive elements.
- All images must have `alt` text.
- Interactive elements must be keyboard-navigable.
- Anchors must have content and valid `href`.
- Flag missing `aria-*` attributes on custom interactive components.

## Testing

- Unit tests use **Vitest** + **React Testing Library** (`@testing-library/react`).
- Storybook tests use `play` functions with `storybook/test` utilities (`within`, `expect`, `userEvent`).
- Storybook tests may include Zephyr Scale test case IDs in `parameters.zephyr.testCaseId` — do not remove or modify these.
- Test files go in `__tests__/` directories or as `*.test.tsx` alongside the component.

## Import Organization

- Imports must be ordered: builtin → external → internal → parent → sibling → index → type.
- Separate groups with blank lines.
- Alphabetize within groups.
- No duplicate imports.

## Code Quality

- Flag functions with high cognitive complexity (threshold: 15).
- Flag duplicated logic or identical functions — suggest extraction.
- Prefer `array.find()` over `filter()[0]`, `flatMap` over `map().flat()`, `includes` over `indexOf !== -1`.
- Prefer ternary for single-line conditionals.
- Do NOT use `eslint-disable` comments — refactor the code instead.

## PR & Commit Conventions

- PR titles must match: `^[A-Z]+-[1-9][0-9]*: ` (e.g., `SW-1234: Add Button component`).
- Ensure new components have a corresponding Storybook story.
- Ensure `src/index.ts` exports are updated when adding/removing components.

## Security

- External links must use `target="_blank"` with `rel="noopener noreferrer"`.
- Do not expose secrets, tokens, or API keys in client-side code.

## What NOT to Flag

- Existing uses of `any` in the codebase (tracked separately).
- `React.forwardRef` in existing code (migration is in progress).
- Magic numbers in test files, story files, constants files, or script files.

