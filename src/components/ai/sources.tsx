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

export const Sources = withRef("Sources", function Sources({ className, ...props }: SourcesProps) {
  return (
    <Collapsible
      className={cn("not-prose mb-4 text-primary text-xs", className)}
      {...props}
    />
  );
});

export type SourcesTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  count: number;
};

export const SourcesTrigger = withRef("SourcesTrigger", function SourcesTrigger({
  className,
  count,
  children,
  ...props
}: SourcesTriggerProps) {
  return (
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
});

export type SourcesContentProps = ComponentProps<typeof CollapsibleContent>;

export const SourcesContent = withRef("SourcesContent", function SourcesContent({
  className,
  ...props
}: SourcesContentProps) {
  return (
    <CollapsibleContent
      className={cn(
        "mt-3 flex w-fit flex-col gap-2",
        "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
        className
      )}
      {...props}
    />
  );
});

export type SourceProps = ComponentProps<"a">;

export const Source = withRef("Source", function Source({ href, title, className, children, ...props }: SourceProps) {
  return (
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
});
