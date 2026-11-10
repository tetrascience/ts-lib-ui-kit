import {
  CircleCheckIcon,
  CircleXIcon,
  MinusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { withRef } from "@/lib/react18-compat";
import { cn } from "@/lib/utils";

export type QcMetricStatus = "pass" | "warn" | "fail";
export type QcMetricTrend = "up" | "down" | "neutral";

export interface QcMetricCardProps extends React.ComponentProps<"div"> {
  /** Name of the quality metric, for example "Recovery". */
  label: string;
  /** Measured value. */
  value: string | number;
  /** Unit shown after the value, for example "%" or "mg/L". */
  unit?: string;
  /** Target or limit the value is judged against, for example "95 - 105 %". */
  target?: string;
  /** Pass, warn or fail. The status is always stated in text as well as colour. */
  status: QcMetricStatus;
  /** Optional trend, shown as an arrow next to `delta`. */
  trend?: QcMetricTrend;
  /** Change since the previous run, for example "+0.4 vs last run". Read as text. */
  delta?: string;
  /** Text for the pass status. */
  passLabel?: string;
  /** Text for the warn status. */
  warnLabel?: string;
  /** Text for the fail status. */
  failLabel?: string;
  /** Prefix before the target. */
  targetLabel?: string;
}

const STATUS_BADGE: Record<QcMetricStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  pass: "positive",
  warn: "warning",
  fail: "destructive",
};

const STATUS_ICON: Record<QcMetricStatus, React.ElementType> = {
  pass: CircleCheckIcon,
  warn: TriangleAlertIcon,
  fail: CircleXIcon,
};

const TREND_ICON: Record<QcMetricTrend, React.ElementType> = {
  up: TrendingUpIcon,
  down: TrendingDownIcon,
  neutral: MinusIcon,
};

function QcMetricCard({
  label,
  value,
  unit,
  target,
  status,
  trend,
  delta,
  passLabel = "Pass",
  warnLabel = "Warning",
  failLabel = "Fail",
  targetLabel = "Target",
  className,
  ...props
}: QcMetricCardProps) {
  const titleId = React.useId();
  const statusText = status === "pass" ? passLabel : status === "warn" ? warnLabel : failLabel;
  const StatusIcon = STATUS_ICON[status];
  const TrendIcon = trend ? TREND_ICON[trend] : undefined;

  return (
    <div
      data-slot="qc-metric-card"
      data-status={status}
      role="group"
      aria-labelledby={titleId}
      className={cn("w-full rounded-xl outline-none focus-visible:shadow-focus", className)}
      {...props}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <CardTitle id={titleId} className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          <Badge variant={STATUS_BADGE[status]} data-slot="qc-metric-card-status">
            <StatusIcon aria-hidden="true" />
            {statusText}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-3xl font-semibold tabular-nums">
            {value}
            {unit && <span className="text-base font-medium text-muted-foreground">{` ${unit}`}</span>}
          </p>
          {target && (
            <p className="text-sm text-muted-foreground">
              {targetLabel}: {target}
            </p>
          )}
          {delta !== undefined && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {TrendIcon && <TrendIcon aria-hidden="true" className="h-4 w-4 shrink-0" />}
              <span>{delta}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const QcMetricCardWithRef = withRef("QcMetricCard", QcMetricCard);
export { QcMetricCardWithRef as QcMetricCard };
