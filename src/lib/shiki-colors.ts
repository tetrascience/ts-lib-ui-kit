// Maps every github-light/github-dark token color onto a --shiki-* CSS
// variable backed by the design-token palette (defined in index.tailwind.css
// for :root and .dark), so code colors follow the active theme and meet
// WCAG AA contrast on --shiki-bg in both modes.
export const SHIKI_COLOR_REPLACEMENTS: Record<string, Record<string, string>> = {
  "github-light": {
    "#24292e": "var(--shiki-fg)",
    "#6a737d": "var(--shiki-comment)",
    "#586069": "var(--shiki-comment)",
    "#d73a49": "var(--shiki-keyword)",
    "#b31d28": "var(--shiki-keyword)",
    "#005cc5": "var(--shiki-constant)",
    "#6f42c1": "var(--shiki-entity)",
    "#22863a": "var(--shiki-tag)",
    "#032f62": "var(--shiki-string)",
    "#e36209": "var(--shiki-variable)",
  },
  "github-dark": {
    "#e1e4e8": "var(--shiki-fg)",
    "#6a737d": "var(--shiki-comment)",
    "#d1d5da": "var(--shiki-comment)",
    "#f97583": "var(--shiki-keyword)",
    "#fdaeb7": "var(--shiki-keyword)",
    "#79b8ff": "var(--shiki-constant)",
    "#b392f0": "var(--shiki-entity)",
    "#85e89d": "var(--shiki-tag)",
    "#9ecbff": "var(--shiki-string)",
    "#dbedff": "var(--shiki-string)",
    "#ffab70": "var(--shiki-variable)",
  },
};
