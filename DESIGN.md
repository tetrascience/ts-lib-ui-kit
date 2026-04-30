# Design Document — `@tetrascience-npm/tetrascience-react-ui`

## 1. Overview

`@tetrascience-npm/tetrascience-react-ui` is a React component library built on [shadcn/ui](https://ui.shadcn.com/) and Radix UI primitives, purpose-built for TetraScience product teams. It provides a consistent design language — tokens, base UI components, composed patterns, and scientific data visualizations — so engineers can build data-heavy laboratory/platform UIs without reinventing design decisions. Consumers get first-class dark mode support, accessible-by-default components, and a theming API that maps cleanly to their app's Tailwind setup.

---

## 2. Design Tokens & Theming

### Color Palette (CSS Variables — oklch color space)

| Token       | CSS Variable          | Light Value                   | Role                          |
| ----------- | --------------------- | ----------------------------- | ----------------------------- |
| Primary     | `--color-primary`     | `oklch(0.6945 0.1622 256.49)` | Brand blue — CTAs, links      |
| Secondary   | `--color-secondary`   | `oklch(0.4465 0.1784 269.18)` | Supporting actions            |
| Accent      | `--color-accent`      | `oklch(0.5187 0.182 305.25)`  | Highlights, badges            |
| Destructive | `--color-destructive` | `oklch(0.685 0.204 23.64)`    | Errors, delete actions        |
| Background  | `--color-background`  | `oklch(0.9665 0.0045 258.32)` | Page background               |
| Muted       | `--color-muted`       | —                             | Subtle fills, disabled states |

> Dark mode is handled via the `.dark` class on `<html>`. All variables are redefined under `.dark { }` in `src/index.css` — no separate stylesheet needed.

### Typography

- **Font family**: Inter Variable (`@fontsource-variable/inter`), variable weight 100–900
- Scale follows Tailwind defaults (`text-xs` → `text-4xl`)
- No custom type scale — lean on Tailwind utilities directly

### Spacing & Radius

| Token       | CSS Variable                   | Value         |
| ----------- | ------------------------------ | ------------- |
| Base radius | `--radius`                     | `0.625rem`    |
| Small       | `--radius-sm`                  | base − offset |
| Large → 4XL | `--radius-lg` … `--radius-4xl` | base + offset |

Spacing uses Tailwind's default scale. No custom spacing tokens.

### Token → Tailwind Mapping

Tokens live in `src/index.css` as CSS custom properties under `:root` / `.dark`. Tailwind 4 reads them automatically via `@theme inline`. Override them in your app's CSS before importing the library stylesheet:

```css
/* your-app/globals.css */
@import "@tetrascience-npm/tetrascience-react-ui/index.css";

:root {
  --color-primary: oklch(0.72 0.19 140); /* swap to green brand */
}
```

### Chart Color Palette

`src/utils/colors.ts` exports a `CHART_COLORS` array of 12 pre-harmonized colors (orange, red, green, yellow, purple, brown, pink, teal, dark blue, black, grey) used consistently across all chart components. Import via:

```ts
import { CHART_COLORS, COLORS } from "@tetrascience-npm/tetrascience-react-ui";
```

---

## 3. Component Inventory

| Component                | Category     | Base (shadcn)         | Key Additions                              | Status |
| ------------------------ | ------------ | --------------------- | ------------------------------------------ | ------ |
| `Button`                 | Action       | `button`              | 8 size variants, icon-only mode            | Stable |
| `ButtonGroup`            | Action       | —                     | Segmented button container                 | Stable |
| `Toggle`                 | Action       | `toggle`              | Pressable on/off button                    | Stable |
| `ToggleGroup`            | Action       | `toggle-group`        | Exclusive/multi-select toggle set          | Stable |
| `Input`                  | Form         | `input`               | —                                          | Stable |
| `InputGroup`             | Form         | —                     | Leading/trailing adornments                | Stable |
| `Field`                  | Form         | —                     | Label + input + error wrapper              | Stable |
| `Label`                  | Form         | `label`               | —                                          | Stable |
| `Select`                 | Form         | `select`              | —                                          | Stable |
| `Combobox`               | Form         | `command`             | Searchable select                          | Stable |
| `Checkbox`               | Form         | `checkbox`            | —                                          | Stable |
| `RadioGroup`             | Form         | `radio-group`         | —                                          | Stable |
| `Switch`                 | Form         | `switch`              | —                                          | Stable |
| `Textarea`               | Form         | `textarea`            | —                                          | Stable |
| `Calendar`               | Form         | `calendar`            | —                                          | Stable |
| `InputOtp`               | Form         | `input-otp`           | —                                          | Stable |
| `Slider`                 | Form         | `slider`              | —                                          | Stable |
| `CodeEditor`             | Form         | —                     | Monaco editor, theme-aware                 | Stable |
| `Dialog`                 | Overlay      | `dialog`              | —                                          | Stable |
| `AlertDialog`            | Overlay      | `alert-dialog`        | —                                          | Stable |
| `Sheet`                  | Overlay      | `sheet`               | —                                          | Stable |
| `Drawer`                 | Overlay      | `drawer`              | —                                          | Stable |
| `Tooltip`                | Overlay      | `tooltip`             | —                                          | Stable |
| `HoverCard`              | Overlay      | `hover-card`          | —                                          | Stable |
| `Command`                | Overlay      | `command`             | Command palette / search                   | Stable |
| `DropdownMenu`           | Navigation   | `dropdown-menu`       | —                                          | Stable |
| `ContextMenu`            | Navigation   | `context-menu`        | —                                          | Stable |
| `Menubar`                | Navigation   | `menubar`             | —                                          | Stable |
| `NavigationMenu`         | Navigation   | `navigation-menu`     | —                                          | Stable |
| `Breadcrumb`             | Navigation   | `breadcrumb`          | —                                          | Stable |
| `Tabs`                   | Navigation   | `tabs`                | —                                          | Stable |
| `Sidebar`                | Navigation   | `sidebar`             | App-level sidebar pattern                  | Stable |
| `Alert`                  | Feedback     | `alert`               | —                                          | Stable |
| `Badge`                  | Feedback     | `badge`               | —                                          | Stable |
| `Skeleton`               | Feedback     | `skeleton`            | —                                          | Stable |
| `Spinner`                | Feedback     | —                     | Loading indicator                          | Stable |
| `Sonner`                 | Feedback     | `sonner`              | Toast notifications                        | Stable |
| `Table`                  | Data Display | `table`               | —                                          | Stable |
| `DataTable`              | Data Display | —                     | TanStack Table wrapper, pagination, column toggle | In Dev |
| `Card`                   | Data Display | `card`                | —                                          | Stable |
| `Avatar`                 | Data Display | `avatar`              | —                                          | Stable |
| `Accordion`              | Data Display | `accordion`           | —                                          | Stable |
| `Collapsible`            | Data Display | `collapsible`         | —                                          | Stable |
| `Carousel`               | Data Display | `carousel`            | —                                          | Stable |
| `Item`                   | Data Display | —                     | Generic list/menu item                     | Stable |
| `Kbd`                    | Data Display | —                     | Keyboard shortcut indicator                | Stable |
| `TetraScienceIcon`       | Data Display | —                     | Brand icon component                       | Stable |
| `ScrollArea`             | Layout       | `scroll-area`         | —                                          | Stable |
| `Resizable`              | Layout       | `resizable`           | —                                          | Stable |
| `Separator`              | Layout       | `separator`           | —                                          | Stable |
| `AspectRatio`            | Layout       | `aspect-ratio`        | —                                          | Stable |
| `AppLayout`              | Composed     | —                     | Full app shell with sidebar                | Stable |
| `AppHeader`              | Composed     | —                     | Top nav with avatar/actions                | Stable |
| `Main`                   | Composed     | —                     | Main content area with navbar, sidebar, tab bar | Stable |
| `Navbar`                 | Composed     | —                     | Secondary nav bar                          | Stable |
| `Sidebar` (composed)     | Composed     | —                     | App sidebar with navigation sections       | Stable |
| `LaunchContent`          | Composed     | —                     | Launch/welcome content panel               | Stable |
| `ProtocolConfiguration`  | Composed     | —                     | Protocol config form                       | Stable |
| `ProtocolYamlCard`       | Composed     | —                     | YAML protocol display card                 | Stable |
| `AssistantModal`         | Composed     | `dialog`              | AI assistant chat modal                    | Beta   |
| `CodeScriptEditorButton` | Composed     | —                     | Button that opens code/script editor       | Stable |
| `PythonEditorModal`      | Composed     | `dialog` + CodeEditor | Python script editor                       | Stable |
| `TdpSearch`              | Composed     | `command`             | TetraScience data platform search          | Stable |
| `TdpLink`                | Composed     | —                     | TDP-aware link component                   | Stable |
| `AreaGraph`              | Chart        | —                     | Plotly area chart                          | Stable |
| `BarGraph`               | Chart        | —                     | Plotly bar chart (grouped/stacked)         | Stable |
| `LineGraph`              | Chart        | —                     | Plotly line chart                          | Stable |
| `ScatterGraph`           | Chart        | —                     | Plotly scatter                             | Stable |
| `Histogram`              | Chart        | —                     | Plotly histogram                           | Stable |
| `PieChart`               | Chart        | —                     | Plotly pie                                 | Stable |
| `Heatmap`                | Chart        | —                     | Plotly heatmap                             | Stable |
| `Boxplot`                | Chart        | —                     | Plotly box plot                            | Stable |
| `DotPlot`                | Chart        | —                     | Plotly dot plot                            | Stable |
| `Chromatogram`           | Chart        | —                     | Specialized lab chromatogram (themed)      | Stable |
| `ChromatogramChart`      | Chart        | —                     | Legacy chromatogram (non-themed)           | Stable |
| `PlateMap`               | Chart        | —                     | 96/384-well plate visualization            | Stable |
| `InteractiveScatter`     | Chart        | —                     | Zoomable scatter with selection            | Stable |

---

## 4. Component API Conventions

### Prop Naming

All components follow shadcn conventions:

| Prop        | Type             | Purpose                              |
| ----------- | ---------------- | ------------------------------------ |
| `variant`   | string (CVA key) | Visual style variant                 |
| `size`      | string (CVA key) | Size variant (`xs` → `2xl`)          |
| `asChild`   | boolean          | Render as child element (Radix slot) |
| `className` | string           | Tailwind override classes            |

### Variant Definition (CVA)

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva("inline-flex items-center justify-center rounded-md font-medium transition-colors", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline: "border border-input bg-transparent hover:bg-accent",
      destructive: "bg-destructive text-white hover:bg-destructive/90",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    },
    size: {
      xs: "h-6 px-2 text-xs",
      sm: "h-8 px-3 text-sm",
      md: "h-9 px-4 text-sm", // default
      lg: "h-10 px-6 text-base",
      xl: "h-12 px-8 text-lg",
    },
  },
  defaultVariants: { variant: "default", size: "md" },
});

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
```

### Composition Pattern

Compound components use Radix primitives directly (no wrapper abstraction). Named sub-components are re-exported alongside the root:

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@tetrascience-npm/tetrascience-react-ui";
```

### Accessibility Requirements

Every component must:

- Support full keyboard navigation (tab, arrow keys, enter/space, escape)
- Include correct ARIA roles via Radix primitives
- Maintain visible focus rings (never `outline: none` without a replacement)
- Work with screen readers (tested with VoiceOver + NVDA)
- Honor `prefers-reduced-motion` for any animations

---

## 5. Usage & Integration

### Installation

```bash
# Install the package
npm install @tetrascience-npm/tetrascience-react-ui

# Import styles in your app entry point
import "@tetrascience-npm/tetrascience-react-ui/index.css";
```

Requires React 19+, Tailwind CSS 4+, and Tailwind's Vite plugin in the consumer app.

### Overriding Theme Tokens

```css
/* app/globals.css */
@import "@tetrascience-npm/tetrascience-react-ui/index.css";

:root {
  --color-primary: oklch(0.72 0.19 140); /* brand green */
  --radius: 0.375rem; /* tighter corners */
}
```

### Extending a Component

Wrap and extend — don't fork:

```tsx
import { Button, type ButtonProps } from "@tetrascience-npm/tetrascience-react-ui";

interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
  label: string; // required for a11y when no visible text
}

export function IconButton({ icon, label, ...props }: IconButtonProps) {
  return (
    <Button size="sm" aria-label={label} {...props}>
      {icon}
    </Button>
  );
}
```

### End-to-End Example — A Protocol Configuration Form

```tsx
import {
  Field,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@tetrascience-npm/tetrascience-react-ui";

export function ProtocolForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Protocol</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Protocol Name" required>
          <Input placeholder="e.g. HPLC Analysis v2" />
        </Field>

        <Field label="Instrument Type">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select instrument" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hplc">HPLC</SelectItem>
              <SelectItem value="ms">Mass Spectrometer</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <div className="flex gap-2 justify-end">
          <Button variant="outline">Cancel</Button>
          <Button>Save Protocol</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

> **Server utilities** are documented in [`CLAUDE.md`](./CLAUDE.md#server-utilities-server-sub-export) — they are a development concern, not a design concern.

---

## 6. Visual & Interaction Principles

- **Data-dense by default** — components are sized and spaced for information-heavy scientific dashboards, not marketing pages. Padding is conservative; readable at `text-sm`.
- **Consistent color semantics** — green = success, orange = caution, red = error, blue = action. Never repurpose semantic colors for decoration.
- **Motion is purposeful** — transitions only where they communicate state change (e.g., dialog open, toast appear). No decorative animations that slow down power users.
- **Dark mode is first-class** — every token is defined for both `:root` and `.dark`. Components are tested in both modes; chart palettes are contrast-checked in both.
- **Accessibility is non-negotiable** — Radix primitives handle the hard parts (focus traps, ARIA, keyboard nav). Custom components must meet the same bar. WCAG AA contrast is the floor.

---

## 7. Key Design Decisions

- **shadcn/ui over a traditional component library** — shadcn ships source files, not a sealed black-box package. This gives teams the ability to read, debug, and fork individual components without fighting opaque internals. The `radix-nova` style preset was chosen over the default `new-york` for its tighter visual density.

- **Plotly.js for all charts** — Scientific data (chromatograms, plate maps, scatter overlays) requires zoom, pan, export-to-PNG, and custom hover templates out of the box. Plotly provides all of these; lighter libraries (Recharts, Victory) do not. A `usePlotlyTheme` hook synchronizes Plotly's layout colors with the active Tailwind theme.

- **oklch color space** — oklch produces perceptually uniform tints/shades, which means `primary/80` looks 20% lighter to the human eye — not just mathematically lighter. This makes token arithmetic predictable in both light and dark modes.

- **Separate server entry points** — Cloud SDK dependencies (AWS, Snowflake, Databricks) are large and Node-only. Splitting them into `./server/providers/*` sub-exports ensures zero client bundle impact when consumers only import UI components.

- **CVA for all variant logic** — `class-variance-authority` centralizes variant definitions in a single object, making it easy to audit all visual states, add new variants without touching JSX, and generate typed prop interfaces automatically.

---

## 8. Open Questions

- **Component versioning granularity** — Should the `AssistantModal` (currently Beta) gate behind a feature flag or a separate export path to prevent breaking changes from reaching stable consumers prematurely?
- **Chart theming API** — `usePlotlyTheme` currently reads CSS variables at render time. For SSR contexts this may produce hydration mismatches. Needs a defined strategy before any SSR adoption.
- **Design token source of truth** — Tokens are currently hand-authored in `src/index.css`. As the system grows, consider whether a Figma → Style Dictionary pipeline should become the single source of truth.
