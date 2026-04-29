import React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { withVisualization } from "@/lib/visualization";

type ScalarVisualizationProps = {
  value?: string | number | boolean | null;
  data?: unknown;
  unit?: string;
  label?: string;
  title?: string;
  className?: string;
};

const ScalarVisualization: React.FC<ScalarVisualizationProps> = ({ value, data, unit, label, title, className }) => {
  const scalar = readScalar(value ?? data, unit);
  const displayLabel = label ?? title;

  return (
    <div className={cn("flex items-center gap-1.5 text-sm", className)}>
      {displayLabel && <span className="text-muted-foreground">{displayLabel}:</span>}
      <Badge className="font-mono" variant="secondary">
        {String(scalar.value)}
        {scalar.unit ? ` ${scalar.unit}` : ""}
      </Badge>
    </div>
  );
};

function readScalar(
  input: unknown,
  fallbackUnit: string | undefined,
): { value: string | number | boolean; unit?: string } {
  if (typeof input === "string" || typeof input === "number" || typeof input === "boolean") {
    return { value: input, unit: fallbackUnit };
  }

  if (input && typeof input === "object") {
    const objectValue = input as Record<string, unknown>;
    const rawValue = objectValue.value;
    const value =
      typeof rawValue === "string" || typeof rawValue === "number" || typeof rawValue === "boolean"
        ? rawValue
        : String(rawValue ?? "");
    const unit = typeof objectValue.unit === "string" ? objectValue.unit : fallbackUnit;

    return { value, unit };
  }

  return { value: String(input ?? ""), unit: fallbackUnit };
}

const ScalarVisualizationWithMeta = withVisualization(ScalarVisualization, {
  id: "viz-scalar",
  inputKind: "number",
  description: "Single scalar value with optional unit, rendered as a labeled badge.",
  tunableProps: [],
});

export { ScalarVisualizationWithMeta as ScalarVisualization };
export type { ScalarVisualizationProps };
