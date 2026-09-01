import * as React from "react";

import { Text, type TextVariant } from "@/components/ui/text";
import { cn } from "@/lib/utils";

/**
 * Heading levels `PageHeader` is allowed to render its title as.
 *
 * Deliberately narrower than `Text`'s `as`: a page header's title *is* a
 * heading, and restricting the type is what makes "heading level is
 * caller-controlled" enforceable rather than advisory. If you want a title-
 * scaled node that stays out of the document outline, that is a `Text`, not a
 * `PageHeader`.
 */
type PageHeaderHeading = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * Visual scales that make sense for a page title. A page header is never
 * `body`/`caption`/`overline` sized — those variants exist on `Text` for copy,
 * not for titles.
 */
type PageHeaderVariant = Extract<TextVariant, "display" | "title-lg" | "title" | "title-sm" | "title-xs">;

/**
 * Props are based on `HTMLAttributes<HTMLElement>` for the same reason `Text`'s
 * are (see the comment in `src/components/ui/text.tsx`): handlers and `ref` on a
 * concrete tag are parameterised by that one element type, which cannot hold
 * across a polymorphic `as`. No `ref` is forwarded; the kit is migrating off
 * `forwardRef`.
 */
interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /**
   * The page title. Renders inside the heading element, so its text *is* the
   * heading's accessible name.
   *
   * Non-interactive trailing content that *should* join the accessible name
   * (a status `Badge`, a count) goes here, inline with the text. Anything
   * interactive — or anything that must stay out of the name — goes in
   * `trailing` instead.
   */
  title: React.ReactNode;
  /**
   * Secondary line beneath the title. Always renders as a `p` at
   * `body`/`muted`, never a heading tag: a subtitle inside an `h3` pollutes the
   * document outline and reads to a screen reader as a section that does not
   * exist.
   */
  subtitle?: React.ReactNode;
  /**
   * Actions, status, or an overflow menu, pinned to the right of the title.
   *
   * Renders as a **sibling** of the heading element, never a descendant — a
   * button or menu trigger nested inside an `h2` is announced as part of the
   * heading. This is the whole reason `PageHeader` exists as a component rather
   * than as more props on `Text`; the structure below is load-bearing, not
   * incidental.
   */
  trailing?: React.ReactNode;
  /**
   * Decorative leading glyph on the title, forwarded to `Text` — sized in `em`
   * so it scales with `variant`, and `aria-hidden` so it stays out of the
   * heading's accessible name.
   */
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /**
   * Heading level for the title. Defaults to `h1` — a page header is usually
   * the page's one `h1` — and is **never** inferred from `variant`. Set it to
   * `h2` when the page already owns its `h1` (a shell breadcrumb, for
   * instance).
   */
  as?: PageHeaderHeading;
  /** Visual scale of the title. Independent of `as`. */
  variant?: PageHeaderVariant;
  /**
   * Truncate a long title to one line so `trailing` is never pushed out of the
   * row. On by default: the pinned-right trailing contract only holds if the
   * title is the thing that gives up space. Set `false` for a title that should
   * wrap instead — `trailing` then aligns to the first line's baseline.
   */
  truncate?: boolean;
  /** Extra classes for the subtitle, for the rare page that needs a wider measure. */
  subtitleClassName?: string;
}

/**
 * Page title, optional subtitle, and an optional trailing action slot.
 *
 * The structure is the point. The subtitle renders *outside* the title row, so
 * the row's `items-baseline` aligns `trailing` against the **title's** baseline
 * rather than centring it against the whole title+subtitle block — which is
 * what happens if you put all three in one flex container, and is the most
 * common way this layout is got wrong.
 *
 * ```tsx
 * <PageHeader
 *   title="Peptide mapping"
 *   subtitle="14 samples across 3 plates · last run 12 minutes ago"
 *   trailing={<Button size="sm">Configure</Button>}
 * />
 * ```
 *
 * The root is a `div`, not a `header`: a `header` that happens to be a direct
 * child of `body` becomes a `banner` landmark, and a page can only have one of
 * those — the shell's top bar already claims it.
 *
 * Not for component-internal titles. Card headers, shell chrome, and empty-state
 * copy own their own scale; replacing it with `PageHeader` gives the kit two
 * sources of truth for one set of pixels.
 */
function PageHeader({
  title,
  subtitle,
  trailing,
  icon,
  as = "h1",
  variant = "title-lg",
  truncate = true,
  className,
  subtitleClassName,
  ...props
}: PageHeaderProps) {
  return (
    <div data-slot="page-header" className={cn("space-y-0.5", className)} {...props}>
      {/* The title row. `trailing` is a sibling of the heading here — moving it
          inside the `Text` below would fold a button into the heading's
          accessible name. */}
      <div data-slot="page-header-row" className="flex items-baseline gap-3">
        <Text
          as={as}
          variant={variant}
          icon={icon}
          truncate={truncate}
          // `min-w-0` is what lets the title shrink below its content width so
          // `truncate` actually engages; a flex item defaults to
          // `min-width: auto` and would otherwise push `trailing` out.
          className="min-w-0"
          data-slot="page-header-title"
        >
          {title}
        </Text>
        {trailing ? (
          <div data-slot="page-header-trailing" className="ml-auto flex shrink-0 items-baseline gap-2">
            {trailing}
          </div>
        ) : null}
      </div>

      {subtitle ? (
        <Text as="p" variant="body" tone="muted" className={subtitleClassName} data-slot="page-header-subtitle">
          {subtitle}
        </Text>
      ) : null}
    </div>
  );
}

export { PageHeader };
export type { PageHeaderProps, PageHeaderHeading, PageHeaderVariant };
