import * as React from "react";

import { cn } from "@/lib/utils";

export interface LinearProgressProps extends React.ComponentProps<"div"> {
  value?: number;
  indeterminate?: boolean;
}

function LinearProgress({
  value,
  indeterminate = false,
  className,
  ...props
}: LinearProgressProps) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const clamped = Math.min(100, Math.max(0, safeValue));

  return (
    <div
      data-slot="linear-progress"
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      {indeterminate ? (
        <div className="absolute inset-y-0 left-0 w-[40%] rounded-full bg-primary motion-safe:animate-[indeterminate_1.4s_linear_infinite]" />
      ) : (
        <div
          className="h-full rounded-full bg-primary motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out"
          style={{ width: `${clamped}%` }}
        />
      )}
    </div>
  );
}

export { LinearProgress };
