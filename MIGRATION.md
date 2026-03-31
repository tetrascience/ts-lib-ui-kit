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
import { Button, Badge, Card } from "ts-lib-ui-kit";

// After (same — re-exported from package root)
import { Button, Badge, Card } from "ts-lib-ui-kit";
```

**Internal path aliases changed (repo contributors only)**  
If you are working *inside this repository* and were using the old `@atoms/@molecules/@organisms` aliases, use the new `@/components/...` aliases instead.  
**Note:** These `@/` aliases are **not** available to consuming applications; external apps should continue to import only from the package root (as in the example above), not via deep paths.

import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
```

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
| `Drawer`            | Bottom sheet drawer         |
| `HoverCard`         | Hover info cards            |
| `InputGroup`        | Input with addons           |
| `InputOTP`          | OTP code input              |
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
```

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
- `vaul` — Drawer component

### Removed

- All SCSS/Sass dependencies
- Custom theme system
- Old icon SVG assets

## Quick Start

```tsx
import { Button, Card, CardHeader, CardContent, Input, Label } from "ts-lib-ui-kit";

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
