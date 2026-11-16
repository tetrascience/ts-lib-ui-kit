import { DiffEditor } from "@monaco-editor/react";
import * as React from "react";

import { defineDiffTheme, diffThemeName } from "./diff-theme";

import type { DiffOnMount, Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

import { useIsDark } from "@/hooks/use-is-dark";
import { useComposedRefs } from "@/lib/compose-refs";
import { withRef } from "@/lib/react18-compat";
import { cn } from "@/lib/utils";

/** `split` shows the two texts side by side; `unified` interleaves them in one column. */
export type DiffViewerMode = "split" | "unified";

export interface DiffViewerProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** The "before" text, shown on the left in `split` mode. */
  original: string;
  /** The "after" text, shown on the right in `split` mode. */
  modified: string;
  /** Monaco language id used to syntax-highlight both sides (`"json"`, `"python"`, …). */
  language?: string;
  /**
   * Layout of the diff. In `split` mode Monaco falls back to the unified layout
   * while the viewer is narrower than 900px; pass
   * `options={{ useInlineViewWhenSpaceIsLimited: false }}` to always split.
   */
  mode?: DiffViewerMode;
  /** Height of the viewer. A number is pixels. */
  height?: number | string;
  /** Show line numbers. */
  lineNumbers?: boolean;
  /** Wrap long lines instead of scrolling horizontally. */
  wordWrap?: boolean;
  /** Fold runs of unchanged lines, leaving a few lines of context around each change. */
  collapseUnchanged?: boolean;
  /** Treat lines that differ only in leading or trailing whitespace as unchanged. */
  ignoreTrimWhitespace?: boolean;
  /** Accessible name of the pane holding the `original` text. */
  originalLabel?: string;
  /** Accessible name of the pane holding the `modified` text. */
  modifiedLabel?: string;
  /** Text shown while Monaco loads. */
  loadingLabel?: string;
  /** Monaco diff editor options, applied over the viewer's own. */
  options?: editor.IDiffEditorConstructionOptions;
  /** Called with the Monaco diff editor once it has mounted. */
  onMount?: DiffOnMount;
}

/**
 * Read-only diff of two texts, built on Monaco's diff editor: side-by-side or
 * unified, with line numbers, `+` / `-` gutter markers, changed characters
 * emphasised inside a changed line, and optional folding of unchanged regions.
 *
 * Added and removed colours come from the kit's `--diff-added*` and
 * `--diff-removed*` tokens, and the surface and syntax colours from `--card`,
 * `--foreground` and the `--shiki-*` tokens. They are read where the viewer is
 * mounted and refreshed when the theme switches between light and dark. Monaco themes are
 * page-global, so every viewer on a page shares one set of diff colours.
 */
function DiffViewer({
  original,
  modified,
  language = "plaintext",
  mode = "split",
  height = 400,
  lineNumbers = true,
  wordWrap = false,
  collapseUnchanged = false,
  ignoreTrimWhitespace = true,
  originalLabel = "Original",
  modifiedLabel = "Modified",
  loadingLabel = "Loading diff…",
  options,
  onMount,
  className,
  ref,
  ...props
}: DiffViewerProps) {
  const isDark = useIsDark();
  const scopeRef = React.useRef<HTMLDivElement>(null);
  const [monaco, setMonaco] = React.useState<Monaco | null>(null);

  const defineTheme = React.useCallback(
    (instance: Monaco) => defineDiffTheme(instance, isDark, scopeRef.current),
    [isDark],
  );

  // Monaco needs the theme to exist before the editor is created with it.
  const handleBeforeMount = (instance: Monaco) => {
    defineTheme(instance);
    setMonaco(instance);
  };

  // On a light/dark switch the tokens resolve to new values: redefine the theme
  // from them, then select it. The editor's own `theme` effect runs before this
  // one, when the new theme is not defined yet.
  React.useEffect(() => {
    if (monaco) monaco.editor.setTheme(defineTheme(monaco));
  }, [monaco, defineTheme]);

  const wrap = wordWrap ? "on" : "off";
  const editorOptions = React.useMemo<editor.IDiffEditorConstructionOptions>(
    () => ({
      readOnly: true,
      originalEditable: false,
      renderSideBySide: mode === "split",
      lineNumbers: lineNumbers ? "on" : "off",
      wordWrap: wrap,
      diffWordWrap: wrap,
      hideUnchangedRegions: { enabled: collapseUnchanged },
      ignoreTrimWhitespace,
      renderIndicators: true,
      originalAriaLabel: originalLabel,
      modifiedAriaLabel: modifiedLabel,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      ...options,
    }),
    [mode, lineNumbers, wrap, collapseUnchanged, ignoreTrimWhitespace, originalLabel, modifiedLabel, options],
  );

  // Monaco blanks both panes' accessible names when the diff editor's options
  // are updated, which the editor wrapper also does on its own once it is
  // ready. So each pane re-applies its name whenever its configuration changes.
  const paneLabels = React.useRef({ original: originalLabel, modified: modifiedLabel });
  const namePanes = React.useRef<() => void>(undefined);
  React.useEffect(() => {
    paneLabels.current = {
      original: editorOptions.originalAriaLabel ?? "",
      modified: editorOptions.modifiedAriaLabel ?? "",
    };
    namePanes.current?.();
  }, [editorOptions]);

  const handleMount: DiffOnMount = (diffEditor, instance) => {
    const panes = [
      { pane: diffEditor.getOriginalEditor(), side: "original" },
      { pane: diffEditor.getModifiedEditor(), side: "modified" },
    ] as const;
    const apply = () => {
      for (const { pane, side } of panes) {
        const ariaLabel = paneLabels.current[side];
        if (pane.getRawOptions().ariaLabel !== ariaLabel) pane.updateOptions({ ariaLabel });
      }
    };
    namePanes.current = apply;
    apply();
    // Disposed with the editor.
    for (const { pane } of panes) pane.onDidChangeConfiguration(apply);
    onMount?.(diffEditor, instance);
  };

  return (
    <div
      ref={useComposedRefs(scopeRef, ref)}
      data-slot="diff-viewer"
      data-mode={mode}
      className={cn("overflow-hidden rounded-lg border bg-card text-sm", className)}
      {...props}
    >
      <DiffEditor
        original={original}
        modified={modified}
        language={language}
        theme={diffThemeName(isDark)}
        height={height}
        width="100%"
        loading={<span className="text-muted-foreground">{loadingLabel}</span>}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        options={editorOptions}
      />
    </div>
  );
}

/** React 18 wrapper for {@link DiffViewer}; see its documentation. */
// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const DiffViewerWithRef = withRef("DiffViewer", DiffViewer);

export { DiffViewerWithRef as DiffViewer };
