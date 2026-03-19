# Developer Guide

This document contains development setup and contribution guidelines for the TetraScience UI library.

## Project Structure

```
ts-lib-ui-kit/
├── src/
│   ├── assets/          # Icons and other static assets
│   ├── components/      # UI components organised by atomic design
│   │   ├── atoms/       # Basic building blocks (Button, Input, etc.)
│   │   ├── molecules/   # Combinations of atoms (Forms, Menus, etc.)
│   │   └── organisms/   # Complex UI sections (Charts, Graphs, etc.)
│   ├── server/          # Server-side utilities (imported via /server subpath)
│   │   └── auth/        # Authentication utilities (JWT Token Manager)
│   ├── styles/          # Global styles and SCSS variables
│   ├── theme/           # ThemeProvider and theme utilities
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Pure utility functions (colors, formatters)
├── .storybook/          # Storybook configuration
├── examples/            # Example applications
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

| Command | Description |
|---------|-------------|
| `yarn storybook` | Run Storybook development server on port 6006 |
| `yarn build` | Build the library for production (using Rollup) |
| `yarn build-storybook` | Build Storybook for deployment |
| `yarn test` | Run unit tests only |
| `yarn test:all` | Run unit tests + Storybook component tests |
| `yarn lint` | Run ESLint |
| `yarn typecheck` | Run TypeScript type checking |
| `yarn prepare` | Set up Husky git hooks |
| `yarn prepublishOnly` | Build the package before publishing |
| `yarn release` | Run semantic-release (CI only — use `--dry-run --no-ci` locally) |

## Path Aliases

The project uses path aliases for cleaner imports (configured in `tsconfig.json` and `vite.config.ts`):

| Alias | Path |
|-------|------|
| `@/*` | `src/*` |
| `components/*` | `src/components/*` |
| `utils/*` | `src/utils/*` |
| `ui/*` | `src/ui/*` |
| `lib/*` | `src/lib/*` |
| `hooks/*` | `src/hooks/*` |
## Build System

The library uses Rollup to produce:

- **CommonJS bundle**: `dist/cjs/index.js`
- **ES Module bundle**: `dist/esm/index.js`
- **Type declarations**: `dist/index.d.ts`
- **Compiled CSS**: `dist/index.css`

## Component Development

### Component Structure

Every component follows this pattern:

```
ComponentName/
├── ComponentName.tsx       # Main component (React 19 ref-as-prop pattern)
├── ComponentName.scss      # Optional SCSS styles
├── ComponentName.stories.tsx # Storybook documentation
└── index.ts               # Exports component + types
```

### Component Template (React 19)

When creating components that need ref support, use the ref-as-prop pattern:

```tsx
import React from 'react';
import styled from 'styled-components';

export interface MyComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary';
  ref?: React.Ref<HTMLDivElement>;
}

const StyledDiv = styled.div<{ $variant: 'primary' | 'secondary' }>`
  color: ${(props) => (props.$variant === 'primary' ? 'blue' : 'grey')};
`;

export const MyComponent = ({
  variant = 'primary',
  ref,
  children,
  ...rest
}: MyComponentProps) => {
  return (
    <StyledDiv ref={ref} $variant={variant} {...rest}>
      {children}
    </StyledDiv>
  );
};
```

> **Transient props:** When passing custom props to styled-components, prefix them with `$` (e.g. `$variant`) to prevent them leaking to the DOM as HTML attributes. See [styled-components docs](https://styled-components.com/docs/api#transient-props).

**Note:** `React.forwardRef` is deprecated in React 19. All components in this library use the ref-as-prop pattern instead. New components should follow this pattern.

### Adding a New Component

1. Create a directory under the appropriate category (`atoms/`, `molecules/`, or `organisms/`)
2. Implement the component following the React 19 ref-as-prop pattern shown above
3. Add a Storybook story for documentation
4. Export from `src/index.ts`

### Styling Guidelines

- Use **styled-components** for component-scoped dynamic styles
- Use **SCSS** for static utility styles
- Leverage **CSS variables** from `src/colors.css` for design tokens
- Support theming via the `ThemeProvider`

## Code Quality

### Pre-commit Hooks

The project uses [Husky](https://typicode.github.io/husky/) to run two git hooks automatically:

| Hook | Trigger | What it does |
|------|---------|--------------|
| `pre-commit` | Before every commit | Runs `lint-staged` — auto-fixes ESLint issues on staged `*.{js,jsx,ts,tsx}` files |
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

| Type | Description | Version bump |
|------|-------------|--------------|
| `feat` | A new feature | `minor` (0.x.0) |
| `fix` | A bug fix | `patch` (0.0.x) |
| `feat!` or `fix!` | Breaking change (via `!`) | `major` (x.0.0) |
| `docs` | Documentation only | none |
| `style` | Formatting, whitespace | none |
| `refactor` | Code restructuring, no behaviour change | none |
| `test` | Adding or fixing tests | none |
| `chore` | Build process, tooling, dependencies | none |
| `ci` | CI/CD configuration | none |
| `perf` | Performance improvement | `patch` (0.0.x) |

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

ESLint is configured with React and TypeScript plugins. Run manually with:

```bash
yarn eslint src/
```

## Testing

### Storybook Component Tests

This library uses Storybook's `play` functions for interactive component testing. These tests run in a real browser environment via `@storybook/experimental-addon-test` and Vitest.

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

Releases are fully automated via [semantic-release](https://semantic-release.gitbook.io/) — **do not manually edit `package.json` version or create git tags**.

### How it works

Every push to `main` triggers the `Release` GitHub Action (`.github/workflows/release.yml`), which:

1. Analyses all commits since the last release using their [Conventional Commit](#commit-message-format) types
2. Determines the next version number (or skips if no releasable commits are found)
3. Generates or updates `CHANGELOG.md`
4. Bumps the version in `package.json`
5. Creates a git tag (e.g. `v1.2.0`) and a GitHub Release with auto-generated release notes
6. Commits the updated `CHANGELOG.md` and `package.json` back to `main` with the message `chore(release): <version> [skip ci]`

Separate publish workflows then handle distributing the built package to npm and the internal JFrog registry.

### Version bump rules

| Commits since last release | Next version |
|---------------------------|--------------|
| Only `fix`, `perf`, `refactor` | Patch — `1.0.0` → `1.0.1` |
| At least one `feat` | Minor — `1.0.0` → `1.1.0` |
| Any commit with `!` or `BREAKING CHANGE` footer | Major — `1.0.0` → `2.0.0` |
| Only `chore`, `docs`, `style`, `test`, `ci` | No release |

### Dry-run locally

To preview what the next release would be without publishing anything:

```bash
npx semantic-release --dry-run --no-ci
```

This requires a `GITHUB_TOKEN` environment variable with repo read access.
