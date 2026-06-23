# UI + AI integration options — tradeoffs (draft)

> Status: **draft for discussion** · Related: SW-1730 (Storybook MCP POC), 1705 (broadened from sandbox requirements)
>
> Goal of this doc: separate the options by *what they actually are* (they sit at
> different layers and are often conflated), define evaluation criteria, and frame
> the one decision that unblocks everything else.

## The conflation to clear up first

"Storybook MCP", "agent framework", and "generative UI" are not three competing
products — they are three different layers:

| Term | What it is | Layer |
| --- | --- | --- |
| **MCP** | A *protocol* for exposing data/tools to an LLM | Transport |
| **Agent framework** (LangGraph, Mastra, AI SDK agents) | *Orchestration* — LLM + tools + control flow; MCP servers plug in here | Orchestration |
| **Generative UI** | A *runtime UX pattern* — the model picks components + props and the app renders them live to an end user | Runtime / product |

"Storybook MCP" is one MCP server. It is **design-time and developer-facing**:
it feeds a *coding agent* (Claude Code/Cursor) authoritative component
metadata so the **code the agent writes** uses real imports and valid props.
Nothing renders at runtime; no end user is involved.

"Generative UI" is **runtime and end-user-facing**: a chatbot renders kit
components on the fly. That needs a different stack — a runtime component
registry, a model-facing prop schema, and a validation/sandbox layer (you are
letting a model choose props that hit your live UI).

**Same library, two reuse paths.** The component catalog our docs MCP already
generates (`components.json`: props, variants, examples) is also exactly what a
generative-UI runtime registry would need — so the metadata work feeds both
directions and is not wasted whichever way we go.

## The decision that unblocks the rest

> **Are we trying to help developers build data apps faster, or render kit
> components live inside a chat experience?**

- **Build apps faster (design-time)** → a docs MCP (Storybook MCP or our custom
  one) is the fit. Done as a POC in SW-1730.
- **Render components live in chat (runtime)** → generative UI; the MCP is not
  sufficient and we need a runtime stack.

These are not mutually exclusive long-term, but they have different owners,
different risk profiles, and different "done" definitions, so we should name the
primary target before comparing tools.

## Options to evaluate

**A. Design-time / developer-facing**
1. **Storybook MCP** (`@storybook/addon-mcp`) — official, full local toolset
   (docs + write/test stories). Deployed flavor requires hosting (we solved this
   with a serverless function; Storybook's own path is Chromatic).
2. **Custom docs MCP** (what we built in SW-1730) — small serverless function
   over a generated catalog; tailored, no extra SaaS.

**B. Runtime / end-user-facing (generative UI)**
3. **Vercel AI SDK generative UI** (`streamUI` / RSC, or tool→component mapping
   with the `ai` package) — model output mapped to React components.
4. **Hosted generative-UI services** (e.g. Thesys C1, Tambo, similar) — managed
   model→UI rendering.
5. **Homegrown registry** — our own component registry + per-component JSON
   schema + a render + validation layer, fed by the same `components.json`.

**C. Orchestration (orthogonal — likely used *with* A or B, not instead of)**
6. Agent frameworks (LangGraph, Mastra, OpenAI Agents SDK).

## Evaluation axes (standard design-doc criteria)

- **Fit to the actual goal** (design-time vs runtime) — the dominant factor.
- **Maturity & maintenance** — release cadence, backing org, issue health, churn.
- **Security model** — especially for B: rendering model-chosen props is a real
  attack surface (prop injection, unexpected component trees).
- **Integration cost with `ts-lib-ui-kit`** — how much glue, and does it reuse our
  existing metadata catalog?
- **Hosting / ops** — what has to run, where, and who maintains it.
- **Lock-in** — proprietary SaaS vs open protocol/library.
- **End-user value vs developer value** — who benefits and how directly.

## Comparison sketch (to be filled in during investigation)

| Option | Layer | Target user | Output | Reuses our catalog | Maturity | Hosting | Lock-in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Storybook MCP | design-time | dev + coding agent | source code | yes (docs) | TBD | dev server / Chromatic | low |
| Custom docs MCP (ours) | design-time | dev + coding agent | source code | yes (we own it) | n/a (ours) | Vercel fn | none |
| AI SDK generative UI | runtime | end user | rendered UI | partial (registry) | TBD | app runtime | medium |
| Hosted gen-UI (Thesys/Tambo/…) | runtime | end user | rendered UI | TBD | TBD | SaaS | high |
| Homegrown registry | runtime | end user | rendered UI | yes | n/a | app runtime | none |

## Tentative recommendation

If the near-term goal is **faster, more correct data-app development** (which is
what SW-1730 targeted and where the immediate pain is), the docs MCP is the
low-risk, high-leverage choice and is already working. Generative UI is a larger,
runtime-and-security-heavy investment that should be its own track with a clear
end-user use case behind it — and when we get there, it can reuse the same
metadata catalog.

## Open questions

1. Primary target for 1705: design-time or runtime? (the unblocking decision)
2. If runtime: what is the concrete end-user use case driving it?
3. Maturity check on `@storybook/addon-mcp` and the generative-UI libraries
   (cadence, backing, breaking-change history).
4. Security requirements for any runtime model→UI rendering.
