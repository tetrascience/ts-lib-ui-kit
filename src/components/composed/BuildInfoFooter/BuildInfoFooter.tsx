import * as React from "react";

import { cn } from "@/lib/utils";

export interface BuildInfoFooterProps
  extends Omit<React.ComponentProps<"footer">, "children"> {
  /** Application version (rendered as `v{version}`) */
  version?: string;
  /** Short commit SHA */
  commitSha?: string;
}

/**
 * A subtle full-width footer bar for application build metadata — the app
 * version and commit SHA. Both fields are optional and only render when
 * provided. Meant to sit at the bottom of a page/app.
 */
export function BuildInfoFooter({
  version,
  commitSha,
  className,
  ...props
}: BuildInfoFooterProps) {
  const meta = [version && `v${version}`, commitSha].filter(
    (x): x is string => Boolean(x)
  );

  return (
    <footer
      data-slot="build-info-footer"
      className={cn(
        "flex w-full flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground tabular-nums",
        className
      )}
      {...props}
    >
      {meta.map((item, i) => (
        <React.Fragment key={item}>
          {i > 0 && (
            <span aria-hidden className="text-muted-foreground/40">
              ·
            </span>
          )}
          <span>{item}</span>
        </React.Fragment>
      ))}
    </footer>
  );
}
