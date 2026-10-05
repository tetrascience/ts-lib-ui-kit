import { Brain, ChevronUpIcon, ImageIcon, SearchIcon } from "lucide-react";

import type { ComponentProps, ReactNode } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { withRef } from "@/lib/react18-compat";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// ChainOfThought (root)
// ---------------------------------------------------------------------------

export type ChainOfThoughtProps = ComponentProps<typeof Collapsible>;

const ChainOfThought = ({
  className,
  defaultOpen = true,
  ...props
}: ChainOfThoughtProps) => (
  <Collapsible
    className={cn("overflow-hidden rounded-lg text-sm", className)}
    defaultOpen={defaultOpen}
    {...props}
  />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const ChainOfThoughtWithRef = withRef("ChainOfThought", ChainOfThought);
export { ChainOfThoughtWithRef as ChainOfThought };

// ---------------------------------------------------------------------------
// ChainOfThoughtTrigger
// ---------------------------------------------------------------------------

export type ChainOfThoughtTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  title?: string;
  icon?: ReactNode;
  /** When true, renders a subtle animated dot next to the title. */
  isStreaming?: boolean;
};

const ChainOfThoughtTrigger = ({
  className,
  children,
  title = "Chain of Thought",
  icon,
  isStreaming = false,
  ...props
}: ChainOfThoughtTriggerProps) => (
  <CollapsibleTrigger
    className={cn(
      "group flex w-full items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground",
      className
    )}
    {...props}
  >
    {children ?? (
      <>
        {icon ?? <Brain className="size-4 text-muted-foreground" />}
        <span className="flex-1 text-left items-center gap-2">
          {title}
          {isStreaming && (
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          )}
        </span>
        <ChevronUpIcon
          className="size-4 text-muted-foreground opacity-0 transition-all group-focus-visible:opacity-100 group-hover:opacity-100 group-data-[state=open]:opacity-100 group-data-[state=closed]:rotate-180"
          data-slot="collapsible-chevron"
        />
      </>
    )}
  </CollapsibleTrigger>
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const ChainOfThoughtTriggerWithRef = withRef("ChainOfThoughtTrigger", ChainOfThoughtTrigger);
export { ChainOfThoughtTriggerWithRef as ChainOfThoughtTrigger };

// ---------------------------------------------------------------------------
// ChainOfThoughtContent
// ---------------------------------------------------------------------------

export type ChainOfThoughtContentProps = ComponentProps<typeof CollapsibleContent>;

const ChainOfThoughtContent = ({
  className,
  ...props
}: ChainOfThoughtContentProps) => (
  <CollapsibleContent
    className={cn(
      "flex flex-col gap-2.5 pb-4 pt-3",
      "data-[state=closed]:animate-out data-[state=open]:animate-in",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1",
      className
    )}
    {...props}
  />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const ChainOfThoughtContentWithRef = withRef("ChainOfThoughtContent", ChainOfThoughtContent);
export { ChainOfThoughtContentWithRef as ChainOfThoughtContent };

// ---------------------------------------------------------------------------
// ChainOfThoughtStep
// ---------------------------------------------------------------------------

export type ChainOfThoughtStepVariant = "bullet" | "search" | "image";

export type ChainOfThoughtStepProps = ComponentProps<"div"> & {
  /**
   * Visual prefix for the step.
   * - `"bullet"` — small dot (default, plain reasoning text)
   * - `"search"` — magnifying-glass (web search / tool call)
   * - `"image"` — image icon (image fetch / vision step)
   * - ReactNode — custom icon
   */
  variant?: ChainOfThoughtStepVariant | ReactNode;
};

const STEP_ICONS: Record<ChainOfThoughtStepVariant, ReactNode> = {
  bullet: (
    <span className="mt-[7px] ml-1 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
  ),
  search: <SearchIcon className="mt-0.5 w-[18px] size-3.5 shrink-0 text-muted-foreground" />,
  image: <ImageIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />,
};

const ChainOfThoughtStep = ({
  variant = "bullet",
  className,
  children,
  ...props
}: ChainOfThoughtStepProps) => {
  const icon =
    typeof variant === "string"
      ? STEP_ICONS[variant as ChainOfThoughtStepVariant]
      : variant;

  return (
    <div
      className={cn("flex items-start gap-2 text-muted-foreground", className)}
      {...props}
    >
      <span className="flex shrink-0">{icon}</span>
      <span className="min-w-0 flex-1 leading-relaxed">{children}</span>
    </div>
  );
};

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const ChainOfThoughtStepWithRef = withRef("ChainOfThoughtStep", ChainOfThoughtStep);
export { ChainOfThoughtStepWithRef as ChainOfThoughtStep };

// ---------------------------------------------------------------------------
// ChainOfThoughtSources — inline chip group with left bar
// ---------------------------------------------------------------------------

export type ChainOfThoughtSourcesProps = ComponentProps<"div">;

const ChainOfThoughtSources = ({
  className,
  ...props
}: ChainOfThoughtSourcesProps) => (
  <div
    className={cn(
      "ml-[6px] flex flex-wrap gap-1.5 border-l-2 border-muted-foreground/20 py-0.5 pl-3",
      className
    )}
    {...props}
  />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const ChainOfThoughtSourcesWithRef = withRef("ChainOfThoughtSources", ChainOfThoughtSources);
export { ChainOfThoughtSourcesWithRef as ChainOfThoughtSources };

export type ChainOfThoughtSourceProps = ComponentProps<"a">;

const ChainOfThoughtSource = ({
  className,
  children,
  ...props
}: ChainOfThoughtSourceProps) => (
  <a
    className={cn(
      "inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground transition-colors",
      props.href && "cursor-pointer hover:bg-accent hover:text-accent-foreground",
      className
    )}
    rel="noreferrer"
    target="_blank"
    {...props}
  >
    {children}
  </a>
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const ChainOfThoughtSourceWithRef = withRef("ChainOfThoughtSource", ChainOfThoughtSource);
export { ChainOfThoughtSourceWithRef as ChainOfThoughtSource };

// ---------------------------------------------------------------------------
// ChainOfThoughtImage — inline image with optional caption
// ---------------------------------------------------------------------------

export type ChainOfThoughtImageProps = ComponentProps<"figure"> & {
  src: string;
  alt?: string;
  caption?: string;
};

const ChainOfThoughtImage = ({
  src,
  alt = "",
  caption,
  className,
  ...props
}: ChainOfThoughtImageProps) => (
  <figure
    className={cn("ml-[22px] overflow-hidden rounded-lg border", className)}
    {...props}
  >
    <img alt={alt} className="max-h-64 w-full object-cover" src={src} />
    {caption && (
      <figcaption className="border-t px-3 py-2 text-xs italic text-muted-foreground">
        {caption}
      </figcaption>
    )}
  </figure>
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const ChainOfThoughtImageWithRef = withRef("ChainOfThoughtImage", ChainOfThoughtImage);
export { ChainOfThoughtImageWithRef as ChainOfThoughtImage };

ChainOfThought.displayName = "ChainOfThought";
ChainOfThoughtTrigger.displayName = "ChainOfThoughtTrigger";
ChainOfThoughtContent.displayName = "ChainOfThoughtContent";
ChainOfThoughtStep.displayName = "ChainOfThoughtStep";
ChainOfThoughtSources.displayName = "ChainOfThoughtSources";
ChainOfThoughtSource.displayName = "ChainOfThoughtSource";
ChainOfThoughtImage.displayName = "ChainOfThoughtImage";
