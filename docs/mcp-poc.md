# Storybook MCP for `ts-lib-ui-kit` — POC & deployment notes

> Spike: [SW-1730](https://tetrascience.atlassian.net/browse/SW-1730) · Parent epic: SW-1673 \[v0.6.0] React Toolkit

## TL;DR

An MCP (Model Context Protocol) server lets AI coding agents (Claude Code, Cursor,
Claude Desktop) query this UI kit for authoritative component lists, props,
variant options, and usage examples — reducing hallucinated component APIs when an
agent scaffolds a data app.

There are **two delivery paths**, and we ship both:

| Path | When it runs | Tools available | How |
| --- | --- | --- | --- |
| **Local** | `storybook dev` (a dev's machine) | Full set — docs **+** dev (write/preview stories) **+** testing | `@storybook/addon-mcp` at `http://localhost:6006/mcp` |
| **Deployed** | The static Storybook on Vercel | Docs only — discover components, props/variants, usage examples | Custom serverless function at `https://ts-lib-ui-kit-storybook.vercel.app/api/mcp` |

## Why the deployed path needed custom work

Storybook's official `@storybook/addon-mcp` only serves `/mcp` from a **running
`storybook dev` Node process**. Our Storybook deploys to **Vercel as a static
build** (`storybook build` → `storybook-static`), which has no long-running
server to answer `/mcp`. Storybook's own answer for hosted MCP is Chromatic; we
deploy via Vercel and don't use Chromatic.

So for the deployed case we add a **Vercel serverless function** that implements a
stateless Streamable-HTTP MCP server over a metadata catalog generated at build
time. This is the "custom MCP server" alternative called out in the spike's scope
(item 4), kept deliberately small.

## What was added

1. **`@storybook/addon-mcp`** + Storybook upgrade to `^10.4.6` (MCP requires ≥10.3).
   Registered in [`.storybook/main.ts`](../.storybook/main.ts). Gives every dev a
   full-featured local `/mcp` for free.
2. **`scripts/mcp/build-metadata.ts`** — runs after `storybook build`. Uses
   `storybook-static/index.json` (the published inventory) as the spine and
   enriches it from the `*.stories.tsx` sources via `ts-morph`, emitting the
   catalog twice: `storybook-static/mcp/components.json` (for reference) and
   `api/_components.json` (gitignored) next to the function. Each component carries
   `argTypes` (the exact allowed variant/size options), default args, and per-story
   args (concrete, copy-pasteable usage examples). Wired into `build-storybook`.
3. **`api/mcp.ts`** — Vercel serverless function. Stateless Streamable-HTTP MCP
   server (`@modelcontextprotocol/sdk`) that exposes three tools:
   - `list_components` — full inventory with story counts and tags
   - `get_component` — props/variants, default args, stories with example args, import hint
   - `search_components` — fuzzy search by name/title/tag/prop

   It `import`s `api/_components.json`; Vercel's bundler inlines that JSON into the
   function, so the function makes **no outbound request** — no user-controlled
   URL, no SSRF surface.
4. **`vercel.json`** — **required**. Pins `buildCommand` to `yarn build-storybook`
   (so the metadata step writes `api/_components.json` *before* the function is
   bundled), sets the static `outputDirectory`, and declares the `api/mcp.ts`
   function. Without it the deployed function 404s: the build reverts to dashboard
   settings, `api/_components.json` is never generated, and the import fails to
   bundle. Vercel auto-routes `api/mcp.ts` to `/api/mcp` (no rewrite needed).

## How to use it

### Local (full toolset)

```bash
yarn storybook          # starts dev server on :6006, serving /mcp
npx mcp-add --type http --url "http://localhost:6006/mcp" --scope project
```

### Deployed (read-only docs toolset, no local Storybook needed)

```bash
npx mcp-add --type http --url "https://ts-lib-ui-kit-storybook.vercel.app/api/mcp"
```

Or in Claude Code's MCP config:

```json
{ "mcpServers": { "ts-ui-kit": { "type": "http", "url": "https://ts-lib-ui-kit-storybook.vercel.app/api/mcp" } } }
```

## Verification done

- Storybook upgraded to 10.4.6 and builds cleanly with `addon-mcp` registered.
- `build-metadata` produces a catalog of **108 components** with correct
  variant/size options and per-story example args (spot-checked `Button`, charts).
- The serverless handler was driven over HTTP locally: `initialize`, `tools/list`
  (3 tools), `get_component(Button)` (returns correct variant options + import
  hint), and `search_components("chart")` (13 matches) all succeed.
- **Live on a Vercel preview deployment**: MCP `initialize` (200) and `tools/call
  get_component(Button)` returned correctly against the deployed `/api/mcp` — the
  function works in the real Vercel runtime.
- **Negative result:** a deploy with `vercel.json` removed served the static
  Storybook but returned **404 on `/api/mcp`** — the function was not built. The
  function only deploys with `vercel.json` present (it pins the build command that
  generates `api/_components.json` and declares the function). Hence `vercel.json`
  is required, not optional.
- **Local `@storybook/addon-mcp`**: with `yarn storybook` running, an MCP client
  connected to `localhost:6006/mcp`, listed 6 tools, and `list-all-documentation`
  returned this repo's component catalog (Button, Heatmap, …).
- `yarn typecheck` and `yarn lint` pass.

> Still to do: a head-to-head agent scaffolding test (MCP vs. baseline). Tracked
> as a follow-up below.

## Gaps in our component metadata (and how to close them)

The catalog is only as good as what stories expose. Observed gaps:

- **Prop coverage is limited to authored `argTypes`/`args`.** Components whose
  stories don't declare `argTypes` surface no prop list. We deliberately did *not*
  extract full TS prop types (unreliable without a full type program), so props
  beyond what stories document are invisible to agents.
  → *Fix:* encourage complete `argTypes` in stories, or add `react-docgen`-based
  prop extraction in a follow-up.
- **No prose descriptions.** `argTypes[].description` and component-level
  descriptions are mostly absent, so tools return shape without intent.
  → *Fix:* add JSDoc/`parameters.docs.description` to high-traffic components.
- **Composition patterns aren't represented.** Compound components (e.g. `Dialog`
  + `DialogTrigger` + `DialogContent`) appear as separate stories with no "use
  these together" signal.
  → *Fix:* a curated `patterns` section, or richer composed-component stories.
- **No design-token surface.** Agents can't currently query the oklch tokens.
  → *Fix:* optionally emit `src/index.css` tokens into the catalog.

## Recommendation

**Proceed, incrementally.** The local addon is zero-risk, high-value, and ships
today. The deployed serverless server is a small, self-contained addition that
makes the kit queryable by any agent without a local checkout — the key win for
data-app builders. Biggest ROI next is **improving story metadata** (above), since
both paths read from it.

### Suggested follow-up tickets

1. Head-to-head agent scaffolding eval (MCP vs. baseline) on a representative data-app component.
2. Metadata enrichment pass: complete `argTypes`, add descriptions to top components.
3. (Optional) `react-docgen` prop extraction + design-token surfacing in the catalog.
4. (Optional) Auth for the deployed endpoint if we ever gate the Storybook.

> Live deployed endpoint confirmed working on a Vercel preview; the production URL
> is `https://ts-lib-ui-kit-storybook.vercel.app/api/mcp` after merge to `main`.
