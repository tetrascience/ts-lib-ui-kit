export async function load() {
  const grammar = await import("@shikijs/langs/bash");
  const local = await import("./inner");
  const p = await import("plotly.js-dist");
  return { g: grammar.default, l: local.inner, p };
}
