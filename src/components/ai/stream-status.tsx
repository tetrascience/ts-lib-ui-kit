import {
  Disc3Icon,
  LoaderCircleIcon,
  LoaderIcon,
  LoaderPinwheelIcon,
} from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const MS_PER_S = 1000;
const SECS_PER_MIN = 60;
const CONFIRM_RIPPLE_MS = 700;
const K = 1_000;
const M = 1_000_000;

// ---------------------------------------------------------------------------
// Icon variants
// ---------------------------------------------------------------------------

/** Built-in Lucide spinner icons that pair well with ts-spin-pulse animation. */
export const STREAM_STATUS_ICONS = {
  loader: <LoaderIcon />,
  "loader-circle": <LoaderCircleIcon />,
  "loader-pinwheel": <LoaderPinwheelIcon />,
  "disc-3": <Disc3Icon />,
} as const;

export type StreamStatusIconVariant = keyof typeof STREAM_STATUS_ICONS;

// ---------------------------------------------------------------------------
// State → indicator dot colour
// ---------------------------------------------------------------------------

export type StreamStatusState = "streaming" | "idle" | "done" | "error";

const INDICATOR_CLASS: Record<StreamStatusState, string> = {
  streaming: "animate-pulse bg-[#549DFF]",   // TS Light Blue 300
  idle:      "bg-muted-foreground/40",
  done:      "bg-[#038599]",                 // TS Forest Green 300
  error:     "bg-[#E15759]",                 // TS Imperial Red
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface StreamStatusProps {
  /**
   * Timestamp when streaming started (Date or epoch ms).
   * The component manages an internal 1-second ticker when set.
   */
  startTime?: Date | number;
  /** Whether streaming is currently active. Defaults to `true` when `startTime` is set. */
  isStreaming?: boolean;
  /**
   * Explicit state for the right-end indicator dot colour.
   * If omitted, derived from `isStreaming`: `true` → "streaming", `false` → "idle".
   *
   * | state       | colour                     |
   * |-------------|----------------------------|
   * | streaming   | TS Light Blue 300 (pulsing)|
   * | idle        | muted gray                 |
   * | done        | TS Forest Green 300        |
   * | error       | TS Imperial Red            |
   */
  state?: StreamStatusState;
  /**
   * Show the coloured status dot at the right end of the component.
   * Defaults to `false`.
   */
  showIndicator?: boolean;
  /** Token count shown after the separator, e.g. `8700` → "↓ 8.7k tokens". */
  tokenCount?: number;
  /** Prefix before the formatted token count. Defaults to `↓`. */
  tokenLabel?: ReactNode;
  /**
   * Custom icon (ReactNode). Takes precedence over `iconVariant`.
   * While streaming, the icon wrapper receives `ts-spin-pulse` — a continuous
   * rotation that occasionally surges to 1.3× scale.
   */
  icon?: ReactNode;
  /**
   * Convenience shorthand to pick a built-in Lucide spinner.
   * Ignored when `icon` is also provided.
   *
   * Options: `"loader"` | `"loader-circle"` | `"loader-pinwheel"` | `"disc-3"`
   */
  iconVariant?: StreamStatusIconVariant;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / SECS_PER_MIN);
  const s = seconds % SECS_PER_MIN;
  return m > 0 ? `${m}m ${s.toString().padStart(2, "0")}s` : `${s}s`;
}

function formatTokens(count: number): string {
  if (count >= M) return `${(count / M).toFixed(1).replace(/\.0$/, "")}m`;
  if (count >= K) return `${(count / K).toFixed(1).replace(/\.0$/, "")}k`;
  return String(count);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const StreamStatusComponent = ({
  startTime,
  isStreaming = startTime !== undefined,
  state: stateProp,
  showIndicator = false,
  tokenCount,
  tokenLabel = "↓",
  icon,
  iconVariant,
  className,
}: StreamStatusProps) => {
  const resolvedState: StreamStatusState =
    stateProp ?? (isStreaming ? "streaming" : "idle");

  const resolvedIcon =
    icon === undefined
      ? iconVariant === undefined
        ? undefined
        : STREAM_STATUS_ICONS[iconVariant]
      : icon;

  const [elapsed, setElapsed] = useState(() => {
    if (startTime === undefined) return 0;
    const origin =
      typeof startTime === "number" ? startTime : startTime.getTime();
    return Math.max(0, Math.floor((Date.now() - origin) / MS_PER_S));
  });

  // Bubble-confirm ripple — fires once when isStreaming transitions true → false
  const [confirming, setConfirming] = useState(false);
  const prevStreamingRef = useRef(isStreaming);

  useEffect(() => {
    const was = prevStreamingRef.current;
    prevStreamingRef.current = isStreaming;
    if (was && !isStreaming) {
      setConfirming(true);
      const t = setTimeout(() => setConfirming(false), CONFIRM_RIPPLE_MS);
      return () => clearTimeout(t);
    }
  }, [isStreaming]);

  // Elapsed-time ticker — only active while streaming
  useEffect(() => {
    if (!isStreaming || startTime === undefined) return;
    const origin =
      typeof startTime === "number" ? startTime : startTime.getTime();
    const tick = () =>
      setElapsed(Math.max(0, Math.floor((Date.now() - origin) / MS_PER_S)));
    tick();
    const id = setInterval(tick, MS_PER_S);
    return () => clearInterval(id);
  }, [isStreaming, startTime]);

  const showTime = startTime !== undefined;
  const showTokens = tokenCount !== undefined;

  return (
    <div
      aria-live="polite"
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground",
        className
      )}
    >
      {/* Spinning icon — spins + pulse-surges while streaming */}
      {resolvedIcon !== undefined && (
        <span
          className={cn(
            "shrink-0 [&>svg]:size-3.5",
            isStreaming ? "ts-spin-pulse" : "opacity-40"
          )}
        >
          {resolvedIcon}
        </span>
      )}

      {/* Elapsed time */}
      {showTime && (
        <span className="tabular-nums">{formatElapsed(elapsed)}</span>
      )}

      {/* Token count */}
      {showTokens && (
        <>
          <span aria-hidden className="select-none text-muted-foreground/40">
            ·
          </span>
          <span className="tabular-nums">
            {tokenLabel != null && (
              <span className="mr-0.5">{tokenLabel}</span>
            )}
            {formatTokens(tokenCount)} tokens
          </span>
        </>
      )}

      {/* Right-end indicator dot — opt-in, colour driven by `state` */}
      {showIndicator && (
        <span className="relative flex size-3 shrink-0 items-center justify-center">
          {confirming && (
            <span className="ts-bubble-confirm absolute size-2 rounded-full bg-[#549DFF]" />
          )}
          <span
            className={cn(
              "size-1.5 rounded-full transition-colors duration-500",
              INDICATOR_CLASS[resolvedState]
            )}
          />
        </span>
      )}
    </div>
  );
};

export const StreamStatus = memo(StreamStatusComponent);
StreamStatus.displayName = "StreamStatus";
