# Vendored ts-lib-viz (temporary)

A copy of the `core`, `react` and `theme` sources of `@tetrascience-npm/ts-lib-viz` from
the private tetrascience ts-lib-viz repo (commit `d928ee6`), so this kit's chart components build on
Vercel and CI without a `portal:` dependency on a sibling checkout.

- Do not edit these files here. Change ts-lib-viz and re-copy.
- Temporary: remove this folder and restore the `@tetrascience-npm/ts-lib-viz` package dependency once
  ts-lib-viz is published to npm. The chart imports point at `@/vendor/ts-lib-viz/*` and would switch back.
- The d3 and `@visx/annotation` packages it uses are listed in the kit's `package.json`.
- Only `core` and `react` are copied. The MCP, builder and graph entries are not needed by the charts.

## Local patches

Kept minimal so a re-copy is easy to redo:

- Removed unused declarations and imports that the kit's `noUnusedLocals` rejects: `CLUSTER_CAP` and
  `within` (`core/frame.ts`), `transformOf` (`core/select.ts`), `Axis` and `Scale` (`react/Frame.tsx`),
  `useId`, `PlotKind` and the unused `glSurface` import and `legendIndent` (`react/Viz.tsx`).
- The kit's `tsconfig.json` `lib` is ES2022 because this code uses `Array.prototype.at` and `Object.hasOwn`.
- `theme/default.css` is wrapped in `@layer ts-ui-kit` (with the kit's layer-order statement) because the
  kit's CSS audit (`yarn check:css-leaks`) rejects unlayered `:root` and `.dark` rules.
- Removed the `@media (prefers-color-scheme: dark)` block from `theme/default.css`. The kit's dark mode is the
  `.dark` class only, and the scoped-CSS audit cannot anchor the `:root:not(.light)` selector it used.
- `react/Viz.tsx` and `react/geoms/Interval.tsx` pass a ribbon's `alpha` through as its fill opacity. Interval used to ignore its own `fillOpacity` prop, so every ribbon filled at a fixed 0.13, and an area chart could not draw solid bands.
- `core/build.ts` copies layers and drafts with a plain-object copy instead of `structuredClone`, which Jest's
  jsdom environment does not provide. The specs hold only plain values, so the copy is the same.
- `react/ColorLegend.tsx` keys the tick labels by position as well as value. A single-box median ramp has two
  ticks with the same value, which React reported as a duplicate key.
