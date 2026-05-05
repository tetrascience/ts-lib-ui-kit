import { Check, Copy } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const COPY_CONFIRMATION_MS = 2000;

export interface CopyToClipboardProps extends React.ComponentProps<"div"> {
  value: string;
  label?: string;
  language?: string;
}

function CopyToClipboard({
  value,
  label,
  language,
  className,
  ...props
}: CopyToClipboardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_CONFIRMATION_MS);
  };

  return (
    <div
      data-slot="copy-to-clipboard"
      className={cn("rounded-lg border bg-card", className)}
      {...props}
    >
      <div className="flex items-center justify-between border-b px-4 py-2">
        {(label ?? language) && (
          <span className="text-xs font-medium text-muted-foreground">
            {label ?? language}
          </span>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "ml-auto flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors",
            copied
              ? "text-positive"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="font-mono text-xs text-foreground">{value}</code>
      </pre>
    </div>
  );
}

export { CopyToClipboard };
