/**
 * Real Jest (not Vitest simulating Jest) exercising the actual built,
 * packaged dist through the shipped `./jest-setup` — the class of bug this
 * guards against (Rollup keeping external dynamic `import()` as native in
 * the CJS output, invisible to `jest.mock`; a mock factory shape that's
 * silently wrong for Rollup's dynamic-import interop) can't be caught by
 * unit tests of jest-setup.tsx's exported helpers in isolation, because
 * those never go through Jest's actual module system or the kit's real
 * compiled output.
 *
 * Run via `npm test` from this directory (after `yarn build` at the repo
 * root — this depends on `dist/` existing) or `npm run verify:jest-consumer`
 * from the repo root.
 */
const fs = require("fs");
const path = require("path");
const React = require("react");
const { render, waitFor } = require("@testing-library/react");

const pkgDir = path.dirname(
  require.resolve("@tetrascience-npm/tetrascience-react-ui/package.json"),
);

test("sanity check: the optional peers this test proves are mockable are genuinely not installed", () => {
  expect(fs.existsSync(path.join(pkgDir, "node_modules", "plotly.js-dist"))).toBe(false);
  expect(fs.existsSync(path.join(process.cwd(), "node_modules", "plotly.js-dist"))).toBe(false);
  expect(fs.existsSync(path.join(process.cwd(), "node_modules", "@rdkit", "rdkit"))).toBe(false);
});

test("CodeBlock highlighting resolves through the shiki mock, not a broken dynamic import", async () => {
  const { CodeBlockContent } = require("@tetrascience-npm/tetrascience-react-ui/ui/code-block");
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => {
    errors.push(args);
    originalError(...args);
  };
  try {
    const { container } = render(
      React.createElement(CodeBlockContent, { code: "def f():\n    return 1", language: "python" }),
    );
    await waitFor(() => {
      expect(container.textContent).toContain("def f():");
    });
    // Stub signature: exactly one <span> per line, all color:inherit. Real
    // shiki would emit multiple differently-colored spans per line.
    const lineSpans = container.querySelectorAll("code > span.block");
    expect(lineSpans.length).toBe(2);
    for (const line of lineSpans) {
      const innerSpans = line.querySelectorAll("span");
      expect(innerSpans.length).toBe(1);
      expect(innerSpans[0].style.color).toBe("inherit");
    }
    expect(errors).toEqual([]);
  } finally {
    console.error = originalError;
  }
});

test("loadPlotly resolves via the mock (plotly.js-dist is not installed here)", async () => {
  // Requires the compiled dist file by absolute path — not a package
  // specifier — to exercise loadPlotly() directly, since the chart
  // components' own ResizeObserver-gated draw effects don't fire in jsdom
  // without a real layout and would otherwise mask whether the import
  // itself resolved.
  const { loadPlotly } = require(path.join(pkgDir, "dist", "components", "charts", "plotly-loader.cjs"));
  const plotly = await loadPlotly();
  expect(typeof plotly.newPlot).toBe("function");
  const el = document.createElement("div");
  const plotEl = await plotly.newPlot(el);
  expect(plotEl).toBe(el);
});

test("MoleculeStructure mounts via the rdkit mock (rdkit is not installed here)", async () => {
  const { MoleculeStructure } = require("@tetrascience-npm/tetrascience-react-ui/composed/MoleculeStructure");
  const { container } = render(React.createElement(MoleculeStructure, { smiles: "CCO" }));
  await waitFor(() => {
    expect(container.querySelector("svg")).toBeTruthy();
  });
});
