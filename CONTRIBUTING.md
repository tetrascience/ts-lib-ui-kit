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

| Command | Description |
|---------|-------------|
| `yarn storybook` | Run Storybook development server on port 6006 |
| `yarn build` | Build the library for production (using Vite) |
| `yarn build-storybook` | Build Storybook for deployment |
| `yarn test` | Run unit tests only |
| `yarn test:all` | Run unit tests + Storybook component tests |
| `yarn lint` | Run ESLint |
| `yarn typecheck` | Run TypeScript type checking |
| `yarn prepare` | Set up Husky git hooks |
| `yarn prepublishOnly` | Build the package before publishing |

## Path Aliases

The project uses path aliases for cleaner imports (configured in `tsconfig.json` and `vite.config.ts`):

| Alias | Path |
|-------|------|
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
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import * as React from "react"

import { cn } from "@/lib/utils"

const myComponentVariants = cva(
  "inline-flex items-center rounded-lg text-sm font-medium transition-all",
  {
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
  }
)

function MyComponent({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof myComponentVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      data-slot="my-component"
      className={cn(myComponentVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { MyComponent, myComponentVariants }
```

**Note:** This library prefers the ref-as-prop pattern. Avoid `React.forwardRef` in new components — existing usages are being migrated.

### Adding a New Component

1. For `ui/` primitives: create a `kebab-case.tsx` file in `src/components/ui/`
2. For composed/chart components: create a PascalCase directory under the appropriate category (`composed/` or `charts/`)
3. Implement the component following the patterns above
4. Add a Storybook story for documentation
5. Export from `src/index.ts`

### Styling Guidelines

- Use **Tailwind CSS 4** utility classes via the `cn()` helper from `src/lib/utils.ts`
- Use **CVA** (`class-variance-authority`) for component variant definitions
- Design tokens are CSS custom properties in `src/index.css` (oklch values), mapped to Tailwind via `@theme inline`
- Icons come from **lucide-react**
- Support theming via the `ThemeProvider` (see `THEMING.md`)

## Code Quality

### Pre-commit Hooks

The project uses Husky with lint-staged to run checks before commits.

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

## Publishing

The library is published to npm. Before publishing:

1. Ensure all changes are committed
2. Update the version in `package.json`
3. Run `yarn build` to verify the build succeeds
4. The `prepublishOnly` script will automatically build before publish
