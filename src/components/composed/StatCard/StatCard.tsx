import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type StatCardTrend = "up" | "down" | "neutral"

export interface StatCardProps extends React.ComponentProps<"div"> {
  label: string
  value: string | number
  delta?: string | number
  deltaLabel?: string
  trend?: StatCardTrend
  description?: string
}

const TREND_ICON: Record<StatCardTrend, React.ElementType> = {
  up: TrendingUpIcon,
  down: TrendingDownIcon,
  neutral: MinusIcon,
}

const TREND_CLASS: Record<StatCardTrend, string> = {
  up: "text-positive",
  down: "text-destructive",
  neutral: "text-muted-foreground",
}

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  trend = "neutral",
  description,
  className,
  ...props
}: StatCardProps) {
  const TrendIcon = TREND_ICON[trend]
  const trendClass = TREND_CLASS[trend]

  return (
    <div data-slot="stat-card" className={cn("w-full", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-3xl font-semibold tabular-nums">{value}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {delta !== undefined && (
            <div className={cn("flex items-center gap-1 text-sm", trendClass)}>
              <TrendIcon className="h-4 w-4 shrink-0" />
              <span className="font-medium">{delta}</span>
              {deltaLabel && (
                <span className="text-muted-foreground">{deltaLabel}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
