import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Internal to the app shells (SW-2383) — not exported from the package. Apps
 * get the footer by passing `version` / `commitSha` to their shell, so they
 * never have to decide where it goes.
 */

export interface BuildInfo {
  /** Application version; rendered with a `v` prefix unless it already has one */
  version?: string;
  /** Short commit SHA */
  commitSha?: string;
}

/** A subtle full-width footer bar showing the app version and commit SHA. */
export function BuildInfoFooter({ version, commitSha }: BuildInfo) {
  const shownVersion = version && (/^v/i.test(version) ? version : `v${version}`);
  const meta = [shownVersion, commitSha].filter((x): x is string => Boolean(x));

  return (
    <footer
      data-slot="build-info-footer"
      className="flex w-full flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground tabular-nums"
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

/**
 * Lays out a shell's scrolling content with the footer after it: the footer
 * follows the content, and is pinned to the bottom when the content is shorter
 * than the viewport. Renders `children` untouched when `show` is false.
 *
 * A page that fills the viewport and scrolls internally (a chat, an editor)
 * marks its outermost element with `data-ts-shell-fill`; `AssistantLayout` is detected
 * without one. The content row then gets a definite height for `h-full` to
 * resolve against (UXT-271).
 */
export function WithBuildInfoFooter({
  show,
  version,
  commitSha,
  className,
  children,
}: BuildInfo & { show: boolean; className?: string; children: React.ReactNode }) {
  if (!show) return <>{children}</>;
  return (
    <div
      data-slot="build-info-layout"
      className={cn(
        "grid min-h-full grid-rows-[1fr_auto] has-[>[data-slot=build-info-content]>:is([data-ts-shell-fill],[data-slot=assistant-layout])]:h-full",
        className
      )}
    >
      <div data-slot="build-info-content" className="min-h-0 min-w-0">
        {children}
      </div>
      <BuildInfoFooter version={version} commitSha={commitSha} />
    </div>
  );
}
