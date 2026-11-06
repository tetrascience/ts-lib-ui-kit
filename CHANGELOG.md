# [1.1.1](https://github.com/tetrascience/ts-lib-ui-kit/compare/v1.1.0...v1.1.1) (2026-10-26)

### Bug Fixes

- SW-2624 wait for the Select listbox before querying its options ([#225](https://github.com/tetrascience/ts-lib-ui-kit/pull/225)) ([bff78b0](https://github.com/tetrascience/ts-lib-ui-kit/commit/bff78b008e2543d4a07b2e487b8ae12dd2cef764))

# [1.1.0](https://github.com/tetrascience/ts-lib-ui-kit/compare/v1.0.0...v1.1.0) (2026-10-16)

No breaking API changes, but the first two notes below change what you see without opting in. Read
them before upgrading if you embed the kit in a page you don't own, style its rendered DOM, or use
`BarChart`.

### Upgrade notes

- **Kit CSS no longer leaks into the host document.** Tokens and component styles now sit in
  `@layer ts-ui-kit`, so a host's unlayered `:root` always wins. Chart class names are namespaced:
  `.divider` → `.histogram-legend-divider`, `.sequence-header` → `.electropherogram-sequence-header`,
  `@keyframes shimmer` → `ts-shimmer`, and so on. The full map is in
  [#219](https://github.com/tetrascience/ts-lib-ui-kit/pull/219). Update any CSS you wrote against
  the old names. Microfrontend remotes and embedded widgets should switch to the new
  `index.scoped.css` entry (see README › _Embedding in a host page_)
  ([#219](https://github.com/tetrascience/ts-lib-ui-kit/pull/219)) ([e8ecb51](https://github.com/tetrascience/ts-lib-ui-kit/commit/e8ecb51))
- **`BarChart` default `barWidth` changed.** It was a fixed 24 x-data units. It is now 0.24 × the
  smallest gap between x positions, narrowing for four or more grouped series. Charts with x values
  about 100 apart look the same. Other spacings now get bars sized to their axis. An explicit
  `barWidth` is unaffected
  ([#222](https://github.com/tetrascience/ts-lib-ui-kit/pull/222)) ([c69363e](https://github.com/tetrascience/ts-lib-ui-kit/commit/c69363e))
- **New `./telemetry` entry point** (`TelemetryProvider`, `useTetraEvents`, `TSErrorBoundary`,
  `installGlobalErrorHandlers`). Install `@tetrascience-npm/request` `>=0.4.0` if you use it. It is
  an optional peer, so apps that don't import `./telemetry` never pull it
  ([#193](https://github.com/tetrascience/ts-lib-ui-kit/pull/193), [#234](https://github.com/tetrascience/ts-lib-ui-kit/pull/234))
- **v1.0.0 known issues fixed.** `./ui/progress` and `./ui/snippet` now ship a runtime module and
  are exported from the root ([#198](https://github.com/tetrascience/ts-lib-ui-kit/pull/198)). Root-entry
  builds no longer fail when `@streamdown/math` / `@streamdown/mermaid` are not installed; markdown
  renders without math or mermaid instead ([#226](https://github.com/tetrascience/ts-lib-ui-kit/pull/226)).

### Features

- SW-2136 Make PlateMapEditor layout, slots, labels and edit-state composable ([#224](https://github.com/tetrascience/ts-lib-ui-kit/pull/224)) ([ae1b7a5](https://github.com/tetrascience/ts-lib-ui-kit/commit/ae1b7a5))
- SW-2298 Address visual issues across the Plotly chart components ([#222](https://github.com/tetrascience/ts-lib-ui-kit/pull/222)) ([c69363e](https://github.com/tetrascience/ts-lib-ui-kit/commit/c69363e))
- SW-2383 build-info footer in the app shells ([#207](https://github.com/tetrascience/ts-lib-ui-kit/pull/207)) ([de99fde](https://github.com/tetrascience/ts-lib-ui-kit/commit/de99fde))
- SW-2410 add AppShellSimple component ([#194](https://github.com/tetrascience/ts-lib-ui-kit/pull/194)) ([fb59acd](https://github.com/tetrascience/ts-lib-ui-kit/commit/fb59acd))
- SW-2445 Button/ButtonGroup selected state (aria-pressed) ([#195](https://github.com/tetrascience/ts-lib-ui-kit/pull/195)) ([a77551a](https://github.com/tetrascience/ts-lib-ui-kit/commit/a77551a))
- SW-2526 Add Text typography primitive with independent as/variant ([#200](https://github.com/tetrascience/ts-lib-ui-kit/pull/200)) ([c2baf18](https://github.com/tetrascience/ts-lib-ui-kit/commit/c2baf18))
- SW-2540 Add accessible Tree compound component ([#201](https://github.com/tetrascience/ts-lib-ui-kit/pull/201)) ([5191487](https://github.com/tetrascience/ts-lib-ui-kit/commit/5191487))
- SW-2541 Tree roving tabindex, typeahead, expand-all and focus retention ([#221](https://github.com/tetrascience/ts-lib-ui-kit/pull/221)) ([e712531](https://github.com/tetrascience/ts-lib-ui-kit/commit/e712531))
- SW-2542 Add empty and error placeholder states to Tree ([#228](https://github.com/tetrascience/ts-lib-ui-kit/pull/228)) ([fa681b4](https://github.com/tetrascience/ts-lib-ui-kit/commit/fa681b4))
- SW-2547 Export Progress and Snippet from the barrel, fix Progress value forwarding ([#198](https://github.com/tetrascience/ts-lib-ui-kit/pull/198)) ([13a643f](https://github.com/tetrascience/ts-lib-ui-kit/commit/13a643f))
- SW-2563 unified selected state for Toggle & ToggleGroup ([#196](https://github.com/tetrascience/ts-lib-ui-kit/pull/196)) ([47f203a](https://github.com/tetrascience/ts-lib-ui-kit/commit/47f203a))
- SW-2570 Add PageHeader component ([#202](https://github.com/tetrascience/ts-lib-ui-kit/pull/202)) ([6ee0196](https://github.com/tetrascience/ts-lib-ui-kit/commit/6ee0196))
- SW-2588 add xs size to Toggle and ToggleGroup ([#211](https://github.com/tetrascience/ts-lib-ui-kit/pull/211)) ([a45295f](https://github.com/tetrascience/ts-lib-ui-kit/commit/a45295f))
- SW-2591 add size prop to Checkbox and RadioGroup ([#213](https://github.com/tetrascience/ts-lib-ui-kit/pull/213)) ([7c7c6ef](https://github.com/tetrascience/ts-lib-ui-kit/commit/7c7c6ef))
- SW-2591 add size prop to Input, Textarea, Select and Combobox ([#212](https://github.com/tetrascience/ts-lib-ui-kit/pull/212)) ([b31ce6b](https://github.com/tetrascience/ts-lib-ui-kit/commit/b31ce6b))
- SW-2591 add size prop to Switch and Slider ([#214](https://github.com/tetrascience/ts-lib-ui-kit/pull/214)) ([0a1dd36](https://github.com/tetrascience/ts-lib-ui-kit/commit/0a1dd36))
- SW-2592 differentiate the assistant panel in AssistantLayout ([#216](https://github.com/tetrascience/ts-lib-ui-kit/pull/216)) ([c9f4d2b](https://github.com/tetrascience/ts-lib-ui-kit/commit/c9f4d2b))
- SW-2592 raised surface for DataAppShellRightPanel ([#217](https://github.com/tetrascience/ts-lib-ui-kit/pull/217)) ([8bc0a10](https://github.com/tetrascience/ts-lib-ui-kit/commit/8bc0a10))
- SW-2596 Stop shipping document-level CSS — layered tokens, namespaced classes, scoped entry ([#219](https://github.com/tetrascience/ts-lib-ui-kit/pull/219)) ([e8ecb51](https://github.com/tetrascience/ts-lib-ui-kit/commit/e8ecb51))
- **telemetry:** SW-2322 React bindings for product-event telemetry, exported from `./telemetry` ([#193](https://github.com/tetrascience/ts-lib-ui-kit/pull/193)) ([6fadd0c](https://github.com/tetrascience/ts-lib-ui-kit/commit/6fadd0c))
- **telemetry:** SW-2322 carry the artifact kind, defaulting to data-app ([#193](https://github.com/tetrascience/ts-lib-ui-kit/pull/193)) ([44b06bc](https://github.com/tetrascience/ts-lib-ui-kit/commit/44b06bc)), closes tetrascience/ts-lib-request#10 (private repository)

### Bug Fixes

- SW-2007 Load optional streamdown peers with dynamic import ([#226](https://github.com/tetrascience/ts-lib-ui-kit/pull/226)) ([99a52e0](https://github.com/tetrascience/ts-lib-ui-kit/commit/99a52e0))
- SW-2441 Prevent data table pagination overflow ([#210](https://github.com/tetrascience/ts-lib-ui-kit/pull/210)) ([2f0062e](https://github.com/tetrascience/ts-lib-ui-kit/commit/2f0062e))
- SW-2443 per-variant disabled treatment for legible contrast ([#209](https://github.com/tetrascience/ts-lib-ui-kit/pull/209)) ([134aad6](https://github.com/tetrascience/ts-lib-ui-kit/commit/134aad6))
- SW-2528 pad content placed directly in DialogContent ([#205](https://github.com/tetrascience/ts-lib-ui-kit/pull/205)) ([057fd9a](https://github.com/tetrascience/ts-lib-ui-kit/commit/057fd9a))
- SW-2535 make table action cells reachable on touch ([#218](https://github.com/tetrascience/ts-lib-ui-kit/pull/218)) ([1318f7b](https://github.com/tetrascience/ts-lib-ui-kit/commit/1318f7b))
- SW-2699 Grant caller permissions for OIDC id-token in publish workflows ([#227](https://github.com/tetrascience/ts-lib-ui-kit/pull/227)) ([44cb39c](https://github.com/tetrascience/ts-lib-ui-kit/commit/44cb39c))
- UXT-243 Make @tetrascience-npm/request an optional peer dependency ([#234](https://github.com/tetrascience/ts-lib-ui-kit/pull/234))
- **telemetry:** expose `counter` from `useTetraEvents` — the bindings had omitted it ([#193](https://github.com/tetrascience/ts-lib-ui-kit/pull/193)) ([eb0134b](https://github.com/tetrascience/ts-lib-ui-kit/commit/eb0134b))
- **build:** point `./telemetry` types at the declarations that are actually emitted ([#193](https://github.com/tetrascience/ts-lib-ui-kit/pull/193)) ([1b5dd5c](https://github.com/tetrascience/ts-lib-ui-kit/commit/1b5dd5c))
- **ci:** tolerate multi-registry archives for the `@tetrascience-npm` scope ([#193](https://github.com/tetrascience/ts-lib-ui-kit/pull/193)) ([9efff76](https://github.com/tetrascience/ts-lib-ui-kit/commit/9efff76))
- **ci:** use checksumBehavior ignore so --immutable installs succeed ([#193](https://github.com/tetrascience/ts-lib-ui-kit/pull/193)) ([132f6ed](https://github.com/tetrascience/ts-lib-ui-kit/commit/132f6ed))
- **e2e:** bridge the JFrog credential env var name ([#193](https://github.com/tetrascience/ts-lib-ui-kit/pull/193)) ([5b4fba6](https://github.com/tetrascience/ts-lib-ui-kit/commit/5b4fba6))
- **e2e:** import waitForSpanNamed, and typecheck the e2e suite at all ([#193](https://github.com/tetrascience/ts-lib-ui-kit/pull/193)) ([beb0e7a](https://github.com/tetrascience/ts-lib-ui-kit/commit/beb0e7a))
- **e2e:** start the traced span after mount, not in a child effect ([#193](https://github.com/tetrascience/ts-lib-ui-kit/pull/193)) ([6d66c94](https://github.com/tetrascience/ts-lib-ui-kit/commit/6d66c94))

# [1.0.0](https://github.com/tetrascience/ts-lib-ui-kit/compare/v0.7.0...v1.0.0) (2026-08-07)

First stable major release. See [MIGRATION.md](./MIGRATION.md#migrating-from-v07x-to-v100) for the
full v0.7.x → v1.0.0 upgrade guide, including the chart rename map and the optional peer dependencies
you now install yourself.

### ⚠ BREAKING CHANGES

- **Charts renamed.** `AreaGraph` → `AreaPlot`, `BarGraph` → `BarChart`, `Boxplot` → `BoxPlot`,
  `LineGraph` → `LinePlot`, `ScatterGraph` → `ScatterPlot`, `ChromatogramChart` → `StackedChromatogram`
  ([#174](https://github.com/tetrascience/ts-lib-ui-kit/pull/174)) ([417913e](https://github.com/tetrascience/ts-lib-ui-kit/commit/417913e))
- **Charts removed.** `DotPlot` and `Heatmap` are no longer exported and have no successor. Unlike
  `Drawer`/`InputOTP` these were never formally deprecated; the removal is being confirmed under
  [SW-2472](https://tetrascience.atlassian.net/browse/SW-2472)
  ([#174](https://github.com/tetrascience/ts-lib-ui-kit/pull/174)) ([417913e](https://github.com/tetrascience/ts-lib-ui-kit/commit/417913e))
- **Deprecated components removed.** `Drawer` and `InputOTP` are gone; use `Sheet` and `Input`
  ([#146](https://github.com/tetrascience/ts-lib-ui-kit/pull/146)) ([d75083d](https://github.com/tetrascience/ts-lib-ui-kit/commit/d75083d))
- **Heavy dependencies are now optional peer dependencies** and are no longer installed for you.
  Install `plotly.js-dist` for charts, `@streamdown/math` + `@streamdown/mermaid` for the AI/markdown
  components, `@rdkit/rdkit` for `MoleculeStructure`, and the provider SDKs for the `/server` utilities
  you use ([#184](https://github.com/tetrascience/ts-lib-ui-kit/pull/184)) ([4d6dbf2](https://github.com/tetrascience/ts-lib-ui-kit/commit/4d6dbf2))

### Features

- SW-2007 cut heavy eager deps — lazy Plotly/Shiki/mermaid/KaTeX + optional peer deps ([#184](https://github.com/tetrascience/ts-lib-ui-kit/pull/184)) ([4d6dbf2](https://github.com/tetrascience/ts-lib-ui-kit/commit/4d6dbf2))
- SW-2007 add per-component entries and single-file Jest support ([#188](https://github.com/tetrascience/ts-lib-ui-kit/pull/188)) ([586b7aa](https://github.com/tetrascience/ts-lib-ui-kit/commit/586b7aa))
- SW-2100 add molecule structure primitive (SMILES → 2D) ([#182](https://github.com/tetrascience/ts-lib-ui-kit/pull/182)) ([f31bbd5](https://github.com/tetrascience/ts-lib-ui-kit/commit/f31bbd5))
- SW-2118 evolve Data App Shell into composable AppShell container ([#183](https://github.com/tetrascience/ts-lib-ui-kit/pull/183)) ([e8519bf](https://github.com/tetrascience/ts-lib-ui-kit/commit/e8519bf))
- SW-2117 add RightPanel (docked, resizable, persisted width, FAB) to Data App Shell ([#176](https://github.com/tetrascience/ts-lib-ui-kit/pull/176)) ([7a6d50b](https://github.com/tetrascience/ts-lib-ui-kit/commit/7a6d50b))
- SW-2116 add SecondaryNav (vertical / horizontal / collapse-to-rail) to Data App Shell ([#173](https://github.com/tetrascience/ts-lib-ui-kit/pull/173)) ([50b3f5b](https://github.com/tetrascience/ts-lib-ui-kit/commit/50b3f5b))
- SW-2115 add PrimaryNav (rail / sidebar / top) to Data App Shell ([#170](https://github.com/tetrascience/ts-lib-ui-kit/pull/170)) ([34ba183](https://github.com/tetrascience/ts-lib-ui-kit/commit/34ba183))
- SW-2114 extract reusable TopBar and UserMenu from Data App Shell ([#165](https://github.com/tetrascience/ts-lib-ui-kit/pull/165)) ([6ad300a](https://github.com/tetrascience/ts-lib-ui-kit/commit/6ad300a))
- SW-2096 add AssistantLayout composed component (dockable AI assistant panel) ([#167](https://github.com/tetrascience/ts-lib-ui-kit/pull/167)) ([854b1f3](https://github.com/tetrascience/ts-lib-ui-kit/commit/854b1f3))
- SW-2292 dark-mode styling polish (palette + selected/hover contrast) ([#179](https://github.com/tetrascience/ts-lib-ui-kit/pull/179)) ([6906827](https://github.com/tetrascience/ts-lib-ui-kit/commit/6906827))
- SW-2016 unify shadows on elevation tokens 0–7 with dark-mode support ([#127](https://github.com/tetrascience/ts-lib-ui-kit/pull/127)) ([c3b609b](https://github.com/tetrascience/ts-lib-ui-kit/commit/c3b609b))
- SW-2159 add text-2xs (10px) font-size token ([#169](https://github.com/tetrascience/ts-lib-ui-kit/pull/169)) ([5115cc3](https://github.com/tetrascience/ts-lib-ui-kit/commit/5115cc3))
- SW-2054 refine Data App Shell nav rail + workflow step styling ([#138](https://github.com/tetrascience/ts-lib-ui-kit/pull/138)) ([9b6cd7f](https://github.com/tetrascience/ts-lib-ui-kit/commit/9b6cd7f))
- SW-2047 add background fill to checkbox and radio ([#158](https://github.com/tetrascience/ts-lib-ui-kit/pull/158)) ([e0d18cf](https://github.com/tetrascience/ts-lib-ui-kit/commit/e0d18cf))
- **stream-status:** SW-1886 add tetra-branded thinking spinner variant ([#162](https://github.com/tetrascience/ts-lib-ui-kit/pull/162)) ([2a62c5a](https://github.com/tetrascience/ts-lib-ui-kit/commit/2a62c5a))
- SDA-810 add customizability to Chromatograms ([#79](https://github.com/tetrascience/ts-lib-ui-kit/pull/79)) ([1896950](https://github.com/tetrascience/ts-lib-ui-kit/commit/1896950))

### Bug Fixes

- SW-2352 prefer proxy-injected ts-auth-token header in JwtTokenManager ([#186](https://github.com/tetrascience/ts-lib-ui-kit/pull/186)) ([4580651](https://github.com/tetrascience/ts-lib-ui-kit/commit/4580651))
- SW-2254 render charts in Inter Variable; centralize font family ([#172](https://github.com/tetrascience/ts-lib-ui-kit/pull/172)) ([fef7a71](https://github.com/tetrascience/ts-lib-ui-kit/commit/fef7a71))
- SW-2139 resolve all a11y violations in Storybook stories ([#177](https://github.com/tetrascience/ts-lib-ui-kit/pull/177)) ([faabf08](https://github.com/tetrascience/ts-lib-ui-kit/commit/faabf08))
- SW-2044 consistent focus state in PlateMapEditor custom-render story ([#181](https://github.com/tetrascience/ts-lib-ui-kit/pull/181)) ([e1d5288](https://github.com/tetrascience/ts-lib-ui-kit/commit/e1d5288))
- **sidebar:** SW-2097 keep collapsed SidebarSeparator within the rail ([#154](https://github.com/tetrascience/ts-lib-ui-kit/pull/154)) ([e1bfb7d](https://github.com/tetrascience/ts-lib-ui-kit/commit/e1bfb7d))

### Known Issues

Found by QE review after the tag was cut ([SW-2472](https://tetrascience.atlassian.net/browse/SW-2472)).
Workarounds are documented in [MIGRATION.md](./MIGRATION.md#known-issues-in-v100):

- `./ui/progress` and `./ui/snippet` resolve types but have no runtime module — importing either
  typechecks and then fails the build. Neither component is exported from the root barrel.
- Root-entry consumers must install `@streamdown/math` and `@streamdown/mermaid` even when they use
  no AI/markdown component. Importing via per-component subpaths avoids this.
- `MoleculeStructure` needs `RDKit_minimal.wasm` served by your app in addition to the
  `@rdkit/rdkit` install; without it the component renders "Invalid structure" for valid SMILES.

# [0.7.0](https://github.com/tetrascience/ts-lib-ui-kit/compare/v0.6.0...v0.7.0) (2026-06-30)

### Bug Fixes

- SW-2157 Responsive container sizing for Plotly charts and bottom-legend overlap ([#159](https://github.com/tetrascience/ts-lib-ui-kit/pull/159)) ([a2d10af](https://github.com/tetrascience/ts-lib-ui-kit/commit/a2d10af347d6d8400e4085bf8c98889133922c96))
- SW-2058 Remove data-point dots from area graph legend and traces ([#157](https://github.com/tetrascience/ts-lib-ui-kit/pull/157)) ([49c28cc](https://github.com/tetrascience/ts-lib-ui-kit/commit/49c28ccf9c46b979ad9d9e1c0641d77d7c2753ce))
- SW-1889 stop chart title defaulting to component name ([#152](https://github.com/tetrascience/ts-lib-ui-kit/pull/152)) ([c01efcd](https://github.com/tetrascience/ts-lib-ui-kit/commit/c01efcd1fb77f2ff1e1edf9255ebc93c1a93c9b6))
- SW-1890 Fix PieChart legend rendering unstyled ([#145](https://github.com/tetrascience/ts-lib-ui-kit/pull/145)) ([ccd2cca](https://github.com/tetrascience/ts-lib-ui-kit/commit/ccd2ccaa4c6ddbfc25f5e997f4be32be9b43cfde))
- SW-2072 chat input grey by default — scope input-group disabled greying to the control ([#143](https://github.com/tetrascience/ts-lib-ui-kit/pull/143)) ([65e7e73](https://github.com/tetrascience/ts-lib-ui-kit/commit/65e7e73632866a77d63e83593661f0bb2b8325be))
- **DataAppShell:** SW-2097 align collapsed sidebar divider under the icon column ([#153](https://github.com/tetrascience/ts-lib-ui-kit/pull/153)) ([84c2018](https://github.com/tetrascience/ts-lib-ui-kit/commit/84c2018d9c19991642593142ed0c2f817efb8cea))
- SW-2076 harmonize hover states — add missing button & select hovers ([#149](https://github.com/tetrascience/ts-lib-ui-kit/pull/149)) ([7eef1d0](https://github.com/tetrascience/ts-lib-ui-kit/commit/7eef1d0a85442fa222d6c0285a817a1ade83fa95))
- SW-2094 default tab active state — white pill instead of blue ([#148](https://github.com/tetrascience/ts-lib-ui-kit/pull/148)) ([d90c397](https://github.com/tetrascience/ts-lib-ui-kit/commit/d90c3977fe66536a5014f3a23276dcba3de440c9))
- SW-2075 normalize combobox & select to 32px field height + keyboard focus fixes ([#141](https://github.com/tetrascience/ts-lib-ui-kit/pull/141)) ([afaf6de](https://github.com/tetrascience/ts-lib-ui-kit/commit/afaf6de5d9b8fd249ff5e13963d7b1391cd8f6e7))
- SW-2043 remove doubled inner shadow on input-group focus ([2a04e66](https://github.com/tetrascience/ts-lib-ui-kit/commit/2a04e663476c2ea813f2ec612266cbdf66bcd492))

### Features

- SW-1891 add xTickText prop for categorical x-axis labels ([#147](https://github.com/tetrascience/ts-lib-ui-kit/pull/147)) ([693f449](https://github.com/tetrascience/ts-lib-ui-kit/commit/693f44942f46ff9944ba13adf81059e0d3b7dba5))
- SW-2120 add gutter and hover/focus reveal to Resizable handle ([#156](https://github.com/tetrascience/ts-lib-ui-kit/pull/156)) ([e2de26f](https://github.com/tetrascience/ts-lib-ui-kit/commit/e2de26f1cc6d3e996d8b4013bc68d1883644fdb5))
- SW-2071 move hover/interactive surfaces from muted to accent ([#140](https://github.com/tetrascience/ts-lib-ui-kit/pull/140)) ([5fdc069](https://github.com/tetrascience/ts-lib-ui-kit/commit/5fdc0692ee21aca6954967188a1af01ac316f8a3))
- SW-2053 add collapsible nav rail (showNavRail) to Data App Shell ([#137](https://github.com/tetrascience/ts-lib-ui-kit/pull/137)) ([964b8e3](https://github.com/tetrascience/ts-lib-ui-kit/commit/964b8e3e625e2d10f468fa70101cc5119d5680f8))
- SW-2038 Use the design-system tooltip for all chart hovers ([#129](https://github.com/tetrascience/ts-lib-ui-kit/pull/129)) ([8df7344](https://github.com/tetrascience/ts-lib-ui-kit/commit/8df734464b2d0e5f49be325b8b67eb5bc42589ba))
- SW-2037 Wire CVD chart palette tokens into chart components ([#128](https://github.com/tetrascience/ts-lib-ui-kit/pull/128)) ([a7b47c9](https://github.com/tetrascience/ts-lib-ui-kit/commit/a7b47c981fb6315f30caa8976cd32e855732e31b))
- SW-2052 update Data App Shell breadcrumb labels ([#136](https://github.com/tetrascience/ts-lib-ui-kit/pull/136)) ([cd9aeba](https://github.com/tetrascience/ts-lib-ui-kit/commit/cd9aebab9f199e762a69d03500d57a4dc604a9d4))

# [0.6.0](https://github.com/tetrascience/ts-lib-ui-kit/compare/v0.5.0...v0.6.0) (2026-06-15)

### Bug Fixes

- SW-1904 update status color tokens to meet WCAG AA contrast on white ([3514ee8](https://github.com/tetrascience/ts-lib-ui-kit/commit/3514ee826319f3d48eeb08127acb6294ee4f8a64))
- **tokens:** address review — update MD3 primitives, keep var() references ([1cf53c6](https://github.com/tetrascience/ts-lib-ui-kit/commit/1cf53c6b3ca6aa6c4a48b2ecf3abef14b02ac7d3))
- **ui:** SW-1925 — darken muted-foreground to `#526175` for contrast ([#118](https://github.com/tetrascience/ts-lib-ui-kit/pull/118)) ([4823af3](https://github.com/tetrascience/ts-lib-ui-kit/commit/4823af3aefa5e975830253539bc503cbcabc7ee5))

### Features

- **button:** SW-1947 make outline variant background transparent ([#119](https://github.com/tetrascience/ts-lib-ui-kit/pull/119)) ([e238a6a](https://github.com/tetrascience/ts-lib-ui-kit/commit/e238a6ab576eb81cc58d26d72d144ecf934b8184))
- **dropdown-menu:** SW-2014 — Storybook examples with caret & kebab triggers ([#125](https://github.com/tetrascience/ts-lib-ui-kit/pull/125)) ([7094a81](https://github.com/tetrascience/ts-lib-ui-kit/commit/7094a8149e956a51889460371dc39f18b1287167))
- **platemapeditor:** SW-1916 break PlateMapEditor into composable form, grid, and manifest panels ([#115](https://github.com/tetrascience/ts-lib-ui-kit/pull/115)) ([416ce8c](https://github.com/tetrascience/ts-lib-ui-kit/commit/416ce8c361cb43d070541c74f32b10c974258666))
- SW-1566 Add column grouping to DataTable ([#101](https://github.com/tetrascience/ts-lib-ui-kit/pull/101)) ([011c9a5](https://github.com/tetrascience/ts-lib-ui-kit/commit/011c9a57bdf6d6e2ac97096f23d33c979d4d5cad))
- SW-1579 Restore Platemap Editor ([#110](https://github.com/tetrascience/ts-lib-ui-kit/pull/110)) ([f04b2f2](https://github.com/tetrascience/ts-lib-ui-kit/commit/f04b2f257846495d4ac5d010540e715455f4338e))
- SW-1579 update story titles to reflect 'Design Patterns' category ([#114](https://github.com/tetrascience/ts-lib-ui-kit/pull/114)) ([4404706](https://github.com/tetrascience/ts-lib-ui-kit/commit/4404706a7d8d9e0fb0ffd3a440dd6020045b69f0))
- SW-1826 Consolidate Storybook design patterns navigation ([#104](https://github.com/tetrascience/ts-lib-ui-kit/pull/104)) ([e4de1f6](https://github.com/tetrascience/ts-lib-ui-kit/commit/e4de1f6867240cb2843a40a8912252f3d5cdde5e))
- **tokens:** update light mode semantic color tokens to TetraScience brand palette ([59cc95b](https://github.com/tetrascience/ts-lib-ui-kit/commit/59cc95bfa64e8faf95089834bb1115bb0f439c91))
- **ui:** SW-1795 — CVD-friendly chart color palette tokens ([#124](https://github.com/tetrascience/ts-lib-ui-kit/pull/124)) ([0ea9345](https://github.com/tetrascience/ts-lib-ui-kit/commit/0ea9345c9a50738b71d2fc94f17840e69e851999))
- **ui:** SW-1920 — white field/table backgrounds, softer input border, 50% Card ([#116](https://github.com/tetrascience/ts-lib-ui-kit/pull/116)) ([7bf40b2](https://github.com/tetrascience/ts-lib-ui-kit/commit/7bf40b2f8fa6659aa75c98dc8cf0eb5ce7ccc3f0))
- **ui:** SW-1929 — dialog background (bg-card/90), light mode ([#120](https://github.com/tetrascience/ts-lib-ui-kit/pull/120)) ([da203e2](https://github.com/tetrascience/ts-lib-ui-kit/commit/da203e283ff43ecd7f9ddd38908eed6232f6f0c1))
- **ui:** SW-2015 — soften focus-visible treatment ([SW-2015](https://tetrascience.atlassian.net/browse/SW-2015)) ([#126](https://github.com/tetrascience/ts-lib-ui-kit/pull/126)) ([84c2721](https://github.com/tetrascience/ts-lib-ui-kit/commit/84c272130e3b97cb41078d4c847ebd604c60bb2a))
