import { AlertCircle, CheckCircle2, ChevronRight, Loader2, Wrench } from "lucide-react";
import { useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export type ToolCallState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "output-error"
  | "output-denied"
  | "approval-requested";

export interface ToolCallDisplayProps {
  name: string;
  state: ToolCallState;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  /** Whether the panel is open by default. Defaults to false. */
  defaultOpen?: boolean;
  className?: string;
}

function formatPayload(value: unknown): string {
  if (value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function StateIcon({ state }: { state: ToolCallState }) {
  switch (state) {
    case "output-available":
      return <CheckCircle2 className="size-3.5 text-positive" aria-hidden />;
    case "output-error":
    case "output-denied":
      return <AlertCircle className="size-3.5 text-destructive" aria-hidden />;
    case "input-streaming":
    case "input-available":
    case "approval-requested":
      return <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden />;
    default:
      return <Wrench className="size-3.5 text-muted-foreground" aria-hidden />;
  }
}

function stateLabel(state: ToolCallState): string {
  switch (state) {
    case "input-streaming":
      return "Calling tool…";
    case "input-available":
      return "Running…";
    case "output-available":
      return "Completed";
    case "output-error":
      return "Error";
    case "output-denied":
      return "Denied";
    case "approval-requested":
      return "Awaiting approval";
  }
}

/**
 * Collapsible panel that shows a tool name, its arguments, and — once
 * available — its result. Defaults to collapsed.
 */
export function ToolCallDisplay({
  name,
  state,
  input,
  output,
  errorText,
  defaultOpen = false,
  className,
}: ToolCallDisplayProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      data-slot="ai-tool-call"
      className={cn(
        "rounded-shape-sm border border-border bg-surface-container text-surface-foreground",
        className,
      )}
    >
      <CollapsibleTrigger
        className={cn(
          "group/tool flex w-full items-center justify-between gap-sp-xs rounded-shape-sm px-sp-sm py-sp-xs text-left text-label-md",
          "outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
        )}
      >
        <span className="flex items-center gap-sp-xs">
          <StateIcon state={state} />
          <span className="font-medium">{name}</span>
          <span className="text-muted-foreground">· {stateLabel(state)}</span>
        </span>
        <ChevronRight
          className="size-3.5 text-muted-foreground transition-transform group-data-[state=open]/tool:rotate-90"
          aria-hidden
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-border px-sp-sm py-sp-xs">
        {input !== undefined && (
          <div className="mb-sp-xs">
            <div className="mb-1 text-label-sm text-muted-foreground uppercase tracking-wide">
              Input
            </div>
            <pre className="overflow-x-auto rounded-shape-xs bg-muted p-sp-xs text-body-sm text-foreground">
              <code>{formatPayload(input)}</code>
            </pre>
          </div>
        )}
        {output !== undefined && (
          <div>
            <div className="mb-1 text-label-sm text-muted-foreground uppercase tracking-wide">
              Output
            </div>
            <pre className="overflow-x-auto rounded-shape-xs bg-muted p-sp-xs text-body-sm text-foreground">
              <code>{formatPayload(output)}</code>
            </pre>
          </div>
        )}
        {errorText && (
          <div className="rounded-shape-xs bg-destructive/10 p-sp-xs text-body-sm text-destructive">
            {errorText}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
