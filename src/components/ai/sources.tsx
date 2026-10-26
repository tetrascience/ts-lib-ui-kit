import { BookIcon, ChevronDownIcon } from "lucide-react";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { withRef } from "@/lib/react18-compat";
import { cn } from "@/lib/utils";

export type SourcesProps = ComponentProps<"div">;

const Sources = ({ className, ...props }: SourcesProps) => (
  <Collapsible
    className={cn("not-prose mb-4 text-primary text-xs", className)}
    {...props}
  />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const SourcesWithRef = withRef("Sources", Sources);
export { SourcesWithRef as Sources };

export type SourcesTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  count: number;
};

const SourcesTrigger = ({
  className,
  count,
  children,
  ...props
}: SourcesTriggerProps) => (
  <CollapsibleTrigger
    className={cn("flex items-center gap-2", className)}
    {...props}
  >
    {children ?? (
      <>
        <p className="font-medium">Used {count} sources</p>
        <ChevronDownIcon className="h-4 w-4" />
      </>
    )}
  </CollapsibleTrigger>
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const SourcesTriggerWithRef = withRef("SourcesTrigger", SourcesTrigger);
export { SourcesTriggerWithRef as SourcesTrigger };

export type SourcesContentProps = ComponentProps<typeof CollapsibleContent>;

const SourcesContent = ({
  className,
  ...props
}: SourcesContentProps) => (
  <CollapsibleContent
    className={cn(
      "mt-3 flex w-fit flex-col gap-2",
      "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
      className
    )}
    {...props}
  />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const SourcesContentWithRef = withRef("SourcesContent", SourcesContent);
export { SourcesContentWithRef as SourcesContent };

export type SourceProps = ComponentProps<"a">;

const Source = ({ href, title, className, children, ...props }: SourceProps) => (
  <Button asChild variant="link" className={cn("h-auto gap-1.5 px-0 text-xs font-medium justify-start", className)}>
    <a href={href} rel="noreferrer" target="_blank" {...props}>
      {children ?? (
        <>
          <BookIcon />
          {title}
        </>
      )}
    </a>
  </Button>
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const SourceWithRef = withRef("Source", Source);
export { SourceWithRef as Source };
