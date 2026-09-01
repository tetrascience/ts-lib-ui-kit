import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Elements `Text` is allowed to render.
 *
 * `as` controls semantics and the document outline; `variant` controls the
 * visual scale. The two are deliberately independent — a `title-lg` can be an
 * `h2` on a page that already owns its `h1`, and a `caption` can be a `dd`.
 * Coupling them is the failure mode that keeps shadcn from shipping a
 * typography component at all (consumers reach for `h1` to mean "big").
 */
type TextElement =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "div"
  | "label"
  | "legend"
  | "figcaption"
  | "figure"
  | "dt"
  | "dd"
  | "li"
  | "strong"
  | "em"
  | "small"
  | "summary"
  | "address";

/**
 * Every variant maps onto Tailwind's own size/weight/tracking tokens plus the
 * kit's `text-2xs` — no new scale is introduced here (see DESIGN.md §Typography
 * and `Foundations/Typography`). Line heights are deliberately left to
 * Tailwind's size-paired defaults rather than overridden.
 *
 * The `gap-*` in each variant is inert until an `icon` or `truncate` switches
 * the root to `inline-flex`; keeping it on the variant is what makes the
 * icon/text gap scale with the type step.
 */
const textVariants = cva("", {
  variants: {
    variant: {
      display: "gap-2.5 text-3xl font-bold tracking-tight",
      "title-lg": "gap-2.5 text-2xl font-bold tracking-tight",
      title: "gap-2 text-xl font-semibold",
      "title-sm": "gap-2 text-lg font-semibold",
      "title-xs": "gap-1.5 text-base font-semibold",
      body: "gap-1.5 text-sm",
      label: "gap-1.5 text-sm font-medium",
      caption: "gap-1 text-xs",
      overline: "gap-1 text-2xs font-semibold tracking-widest uppercase",
    },
    tone: {
      // `default` intentionally sets no colour so `Text` inherits from its
      // container — setting `text-foreground` here would fight every consumer
      // that colours a subtree.
      default: "",
      muted: "text-muted-foreground",
      destructive: "text-destructive",
    },
  },
  defaultVariants: {
    variant: "body",
    tone: "default",
  },
});

type TextVariant = NonNullable<NonNullable<VariantProps<typeof textVariants>>["variant"]>;

/** Sensible default element per variant. Always overridable via `as`. */
const DEFAULT_ELEMENT: Record<TextVariant, TextElement> = {
  display: "h1",
  "title-lg": "h1",
  title: "h2",
  "title-sm": "h3",
  "title-xs": "h4",
  body: "p",
  label: "span",
  caption: "span",
  overline: "span",
};

/**
 * Props are based on `HTMLAttributes<HTMLElement>` rather than the kit's usual
 * `ComponentProps<"tag">`, because every handler and the `ref` on a concrete
 * tag is parameterised by that one element type — which cannot hold once `as`
 * is polymorphic. `HTMLElement` is the widest type that stays assignable to all
 * of them. No `ref` is forwarded; the kit is migrating off `forwardRef`.
 */
interface TextProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof textVariants> {
  /**
   * Semantic element to render. Defaults per `variant` (see `DEFAULT_ELEMENT`).
   * Set it explicitly whenever the document outline and the visual scale
   * disagree — which is most of the time on a real page.
   */
  as?: TextElement;
  /**
   * Decorative leading glyph. Rendered `aria-hidden`, sized in `em` so it
   * scales with the variant, and nudged down to sit on the cap height rather
   * than centred on the line box.
   *
   * The contract is decorative-only: the accessible name of a heading must be
   * its text. If the glyph carries meaning, keep it outside `Text` (or give
   * `Text` an explicit `aria-label`) — the component will not invent one.
   */
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /**
   * Truncate to a single line with an ellipsis. Switches the root to
   * `inline-flex`, so the parent has to bound the width for it to engage —
   * e.g. `<div className="flex"><Text truncate … /></div>` with the sibling
   * marked `shrink-0`.
   */
  truncate?: boolean;
}

function Text({
  className,
  variant = "body",
  tone = "default",
  as,
  icon: Icon,
  truncate = false,
  children,
  ...props
}: TextProps) {
  const resolvedVariant: TextVariant = variant ?? "body";
  const Comp: React.ElementType = as ?? DEFAULT_ELEMENT[resolvedVariant];

  // An icon or a truncating label needs a flex root and a wrapper it can
  // shrink; plain text keeps the bare element so inline flow is untouched.
  const isComposite = Boolean(Icon) || truncate;

  return (
    <Comp
      data-slot="text"
      data-variant={resolvedVariant}
      className={cn(
        textVariants({ variant: resolvedVariant, tone }),
        isComposite && "inline-flex max-w-full items-baseline",
        className,
      )}
      {...props}
    >
      {Icon ? <Icon aria-hidden="true" className="size-[1em] shrink-0 translate-y-[0.14em]" /> : null}
      {isComposite ? <span className={cn("min-w-0", truncate && "truncate")}>{children}</span> : children}
    </Comp>
  );
}

export { Text, textVariants };
export type { TextProps, TextElement, TextVariant };
