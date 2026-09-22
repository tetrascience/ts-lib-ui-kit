# Tetra App Builder — architecture and phased plan

> Status: **draft for review** · Author: O. Williams · Date: 2026-07-30 (rev 2, post-verification)
> Supersedes the "design-time vs runtime" open question in [`ui-ai-integration-tradeoffs.md`](./ui-ai-integration-tradeoffs.md) (SW-1730 / 1705)
> Related: SW-1730 (Storybook MCP POC), SW-2007 (lazy heavy deps), SW-2118 (DataAppShell)

---

## 1. The one-paragraph version

Tetra App Builder is a browser-based, prompt-driven environment where a **scientist** describes a
data app in natural language, watches it build and render live, corrects it through both chat and
direct visual manipulation, and publishes it to the TetraOS Data & AI Workspace gallery. The agent
is a **`deepagents` harness** (TypeScript) whose filesystem *is* the app's source tree; it is
grounded in `ts-lib-ui-kit` through the component catalog MCP this repo already ships, and
constrained by the existing `ts-data-app-frontend-quality`, `ts-data-app-engineer`, and
`ts-data-app-product-sign-off` skills loaded as deep-agent Skills. The agent streams to the browser
over **AG-UI**. Preview runs in-browser in a **WebContainer**. Publish is the one step that cannot
stay in the browser: the session's file tree is exported to a server-side builder that produces the
Docker image and runs `ts-cli publish`.

**The strategic point:** this answers open question #1 in the tradeoffs doc — *"design-time or
runtime?"* — with **design-time, but with the scientist as the developer**. That is a third option
the tradeoffs doc did not consider, and it is the one that matters commercially. We are not building
generative UI (a model choosing props against live UI, with all its prop-injection risk). We are
building a coding agent whose user happens to be a bench scientist rather than a frontend engineer.
The MCP catalog investment pays off immediately, and the runtime-security surface stays closed.

---

## 2. Scope

### 2.1 Users

| Persona | Needs | Success looks like |
| --- | --- | --- |
| **Scientist (primary)** | Turn a workflow they already do in Excel/Spotfire into an app on their own TetraOS data. No React, no Docker, no CLI. | Publishes a working app in one afternoon without opening a terminal |
| **Data-app engineer (secondary)** | Skip boilerplate; take over a scientist's app and harden it | Can clone the generated repo and it passes `yarn lint && yarn typecheck` (§5.10) |
| **Platform / UI-UX team (owner)** | Every generated app is on-brand, accessible, and uses the kit rather than hand-rolled UI | Zero hand-rolled dialogs/tables in generated output |

### 2.2 In scope

Builder UI · agent loop · component grounding · TetraOS data grounding · in-browser preview ·
design harness · multi-session state with resume · scaffolded data-app template · generated-app
verification · publish to the gallery · engineer handoff.

### 2.3 Explicitly out of scope

- **Generative UI** (model-chosen components rendered into live end-user UI). Separate track, per the
  tradeoffs doc. The catalog we build here feeds it later if we go there.
- Authoring **Tetraflows, IDS, protocols, or pipelines**. The app builder consumes existing Tetra
  Data; it does not create it. `ts-tetraflow-builder` and `ts-data-engineer` own that.
- Python/Streamlit apps. React-only for v1 (see §5.8).
- Replacing `ts-cookiecutter` for engineer-authored apps.
- **Real-time collaborative editing** (two people in one session simultaneously). Sequential handoff
  is in scope (§5.11); Google-Docs-style co-editing is not.

---

## 3. Decision record

### 3.1 Agent runtime — `deepagents` (TypeScript)

**Decision: `deepagents` (npm, v1.12.0, MIT) on the LangGraph runtime, in TypeScript.**

The tradeoffs doc correctly separates transport (MCP) / orchestration (agent framework) / runtime
(generative UI) and lists LangGraph, Mastra, and the OpenAI Agents SDK as orchestration candidates
without picking one. Picking `deepagents` rather than bare LangGraph is the substantive choice, and
it is justified by what the harness gives us for free — every item below is something we would
otherwise build:

| Capability we need | `deepagents` gives us | Why it matters here |
| --- | --- | --- |
| Agent edits a project source tree | Virtual filesystem with `ls`/`read_file`/`write_file`/`edit_file`/`glob`/`grep`/`delete` over **pluggable backends** | The app's source tree *is* the agent's filesystem. No custom file tools. |
| Run `tsc`, `eslint`, `vite build` | **Sandbox backend** → `execute` tool | See §3.4 — this is a decision, not a freebie |
| Load our existing conventions | **Skills** (Agent Skills standard, `SKILL.md`, progressive disclosure) | The three data-app skills are already valid skills. Drop them in. |
| Persistent per-project conventions | **Memory** via `AGENTS.md` | Scientist's app-level preferences carry across sessions |
| Long build sessions without context blowout | Summarization + tool-result offloading + prompt caching | A 40-turn build session is normal |
| "Fix the failing build" without polluting main context | **Subagents** (`task` tool), isolated context, single handoff | §5.3 |
| Visible plan for a non-technical user | `TodoListMiddleware` → `write_todos` | The scientist needs to see *what the agent is doing*. Opt-in as of v0.7. |
| Approval before irreversible steps | `interrupt_on` (LangGraph interrupts) | Publishing must be gated |
| Resumable sessions | LangGraph checkpointer | §5.7 |
| Storybook catalog + TetraOS access | Native MCP client support | §5.4 |
| Tracing | `langsmith` is a declared peer | §5.12 |

**TypeScript, not Python.** `deepagents` is first-party in both. TS wins because: the agent writes
React/TS and can therefore share types and the real `tsc` with the target app; the AG-UI React client
and the builder frontend are TS; the kit's own tooling is TS (`scripts/mcp/build-metadata.ts` uses
ts-morph, `api/mcp.ts` uses `@modelcontextprotocol/sdk`); and one language for the whole product
lowers the maintenance burden on a small team.

Full peer set for `deepagents` 1.12.0: `langchain ^1.5.0`, `langsmith ^0.7.1`, `@langchain/core ^1.2.0`,
`@langchain/langgraph ^1.4.4`, `@langchain/langgraph-sdk ^1.9.23`,
`@langchain/langgraph-checkpoint ^1.1.2`.

**Rejected alternatives**

- **Bare LangGraph** — we would reimplement the filesystem, skills, summarization, and subagent
  layers. `deepagents` *is* LangGraph underneath (`createDeepAgent` returns a compiled graph), so we
  keep every LangGraph escape hatch. No lock-in cost.
- **Claude Agent SDK** — excellent harness, but the AG-UI ecosystem's first-party integration is
  LangGraph, and we would give up the checkpointer/Studio/interrupt tooling that the session model in
  §5.7 leans on. LangChain publishes a direct comparison; worth re-reading before Phase 1 locks.
- **Vercel AI SDK agents** — the kit already depends on `ai ^6.0.168` for its AI Elements components,
  so this was the path of least resistance. But it has no filesystem, skills, or subagent primitives;
  we would be building the harness ourselves. We still use `ai` in the *frontend* for stream
  rendering.
- **Mastra / OpenAI Agents SDK** — Mastra has AG-UI support; neither has the filesystem+skills
  harness. Not worth a second evaluation unless `deepagents` disappoints in Phase 1.

### 3.2 UI transport — AG-UI

**Decision: AG-UI, with `@ag-ui/langgraph` (v0.0.42, MIT) server-side and a CopilotKit-free custom
React client built from the kit's own AI Elements.**

AG-UI is the event protocol for agent↔user interaction: lifecycle events (`RUN_STARTED`,
`RUN_FINISHED`), streamed messages, tool calls, **state patches**, interrupts, frontend tool calls,
and custom events, over HTTP/SSE. LangGraph is a 1st-party partnership integration.

Three AG-UI features map directly onto hard requirements:

1. **Shared state with streamed diffs** — the file tree, the todo list, and the build status are
   agent state that the UI must mirror. That is exactly AG-UI's shared-state channel; we are not
   inventing a websocket protocol for it.
2. **Frontend tool calls** — the design harness (§5.6) needs the *agent* to call *into the browser*:
   screenshot the preview, read the console, resolve an element to a source location. AG-UI models
   this as a typed agent→frontend call with a result returned.
3. **Interrupts** — `interrupt_on` in `deepagents` surfaces as an AG-UI interrupt the UI can render
   as an approval card, without losing state.

**On CopilotKit.** CopilotKit is the reference AG-UI client (`@copilotkit/react-core` v1.64.1, MIT)
and the fastest way to a working chat pane. But its prebuilt chat components would fight
`ts-lib-ui-kit`, and we have 18 AI Elements components in `src/components/ai/` — `conversation`,
`message`, `prompt-input`, `reasoning`, `task`, `tool`, `chain-of-thought`, `sources`,
`stream-status`, `confirmation`, `queue`, `attachments`, `speech-input`, `suggestion`, `context`,
`inline-citation`, `model-selector`, `shimmer` — which are on-brand, accessibility-tested, and
already published.

> **We build the builder's chat UI out of our own AI Elements.** This is the highest-value
> dogfooding available to us: the app builder becomes the most demanding consumer of the kit, and
> every gap it hits is a real gap for our customers.

So: consume the protocol via `@ag-ui/client`, render with our own components. Use CopilotKit in a
Phase 0 spike to validate the event flow, then drop it. Note `@ag-ui/client` is pre-1.0 (0.0.57) —
pin exactly and expect churn.

**Phase 0 must confirm one protocol capability:** whether AG-UI supports genuinely **UI-originated**
custom events, or only frontend-tool *results* and message input. `design.intent` (§5.6) is designed
as UI-originated. If the protocol does not support it, the fallback is to model design edits as
structured message input, which is workable but less clean.

### 3.3 Preview — in-browser WebContainer

**Decision confirmed, with two caveats that must be resolved in Phase 0.**

WebContainer (`@webcontainer/api` v1.6.4) runs Node and Vite in the browser via WASM. Per-session
infra cost is zero, HMR is instant, and there is no container orchestration to operate. For a
UI-centric builder this is the right default.

**Caveat 1 — dependency weight is the real risk, and it is worse than it looks.**

The kit ships `monaco-editor` and `@monaco-editor/react` as **hard `dependencies`**, not optional
peers. The pinned `monaco-editor ^0.52.2` is about **94 MB unpacked**. Optional peers add more if the
app needs them: `plotly.js-dist ^2.35.2` ~10.3 MB, `@rdkit/rdkit` ~13.5 MB. The kit itself is a modest
4.45 MB / 633 files. A cold `npm install` inside a WebContainer against that tree is not a viable
first-paint experience.

Mitigations, to be benchmarked in Phase 0 in this order:

1. **Pre-warmed snapshot.** Build the template's `node_modules` once in CI, serve it as a compressed
   tarball from CDN, and `mount()` it into the WebContainer. Cold start becomes a download, not a
   resolve-and-install. This is the primary plan.
2. **Trim the closure.** Charts and the code editor are the heavy tail and most scientist apps need
   neither on first paint. Gate them behind a **capability set** the agent declares and that is
   **persisted on the Project** (§5.7) — not a transient event. The kit's SW-2007 lazy loading
   (`loadPlotly()`, the slim Shiki highlighter) means a static import is already forbidden, so absent
   deps degrade gracefully. **But degradation must be loud**: a missing capability renders a banner,
   never a blank chart.
3. **Escalate to a server container.** Keep a server-side sandbox path behind a flag for apps that
   outgrow the browser (real FastAPI backend, very large data). Do not build this in v1, but do not
   design it out.

**Caveat 2 — licensing.** WebContainer requires a **commercial license from StackBlitz** for
production use in a for-profit setting; POCs do not. This needs a procurement conversation before
Phase 2, and it is a genuine single-vendor dependency. Enterprise self-hosted/VPC options exist.
*Owner: unassigned — see OQ1.*

**One thing WebContainer settles for us:** the kit is published to **public npm**
(`@tetrascience-npm/tetrascience-react-ui`, 0.7.0, Apache-2.0, 112 versions) — not only to internal
JFrog. So the browser can install it with no registry auth. That matters, because authenticating to a
private registry from inside a WebContainer is a known-broken path
(`stackblitz/webcontainer-core#1767`).

> **Constraint to hold: everything a generated app imports at *preview* time must be installable from
> public npm.** The server-side publish build (§5.9) may use JFrog for build-only tooling, but no
> runtime dependency of a generated app may be private, or preview and production diverge.

### 3.4 Verification surface — sandbox backend, from Phase 1

**Decision: the agent gets a sandbox backend with `execute`, scoped to the project directory.**

An earlier draft of this document said "no shell tool in v1". That was incoherent: `build-fixer`
needs build output, and Phase 1's exit criterion is that generated apps pass lint and typecheck.
Vite's dev-server stderr in the WebContainer does not run `eslint` or `tsc`, and the publish-time
server build is Phase 2.

So there are two execution surfaces, deliberately separated:

| Surface | Runs | Used for | Trust boundary |
| --- | --- | --- | --- |
| **WebContainer** (browser) | `vite dev` + HMR | Live preview, runtime console, screenshots | Browser sandbox; generated app code |
| **Sandbox backend** (server) | `yarn lint`, `tsc --noEmit`, `vite build`, `git` | Correctness verification, `build-fixer`, publish build | `deepagents` sandbox provider; no network except the package registry; project dir only |

`execute` is allowlisted to a fixed command set in v1 — not an arbitrary shell. Arbitrary shell is a
Phase 3 consideration at most. This revises the §6 security posture accordingly.

---

## 4. System architecture

```
┌────────────────────────────── BROWSER ───────────────────────────────┐
│  ┌── Builder shell (DataAppShell) ──────────────────────────────┐   │
│  │  ┌─ Chat pane ─────────┐  ┌─ Preview ─────────┐  ┌─ Files ─┐ │   │
│  │  │ kit AI Elements:    │  │  <iframe>         │  │ tree +  │ │   │
│  │  │ Conversation,       │  │   WebContainer    │  │ Monaco  │ │   │
│  │  │ Message, Reasoning, │  │   Vite dev + HMR  │  │ (kit    │ │   │
│  │  │ Task, Tool,         │  │   ▲ postMessage   │  │  CodeEditor)│ │
│  │  │ PromptInput,        │  │   ▼ bridge (§5.6) │  └─────────┘ │   │
│  │  │ Confirmation        │  └───────┬───────────┘              │   │
│  │  └─────────┬───────────┘  ┌───────┴──────────────────────┐   │   │
│  │            │              │ Design harness (overlay)     │   │   │
│  │            │              │ picker · tokens · property   │   │   │
│  │            │              │ panel · console · screenshot │   │   │
│  └────────────┼──────────────┴───────┬──────────────────────┘   │   │
│               │  AG-UI (SSE)         │  frontend-tool results       │
└───────────────┼──────────────────────┼──────────────────────────────┘
                │                      │
┌───────────────▼──────────────────────▼──────────────────────────────┐
│                    AGENT SERVICE  (Node / TS)                        │
│   @ag-ui/langgraph  ──►  deepagents  createDeepAgent()               │
│   ┌───────────────────────────────────────────────────────────────┐ │
│   │ Middleware: Filesystem · Todo · Summarization · Offload       │ │
│   │ Skills: frontend-quality · data-app-engineer · sign-off ·     │ │
│   │         tetra-app-builder-scientist                           │ │
│   │ Memory: the project's AGENTS.md                               │ │
│   │ Subagents: build-fixer · design-reviewer · component-scout ·  │ │
│   │            data-scout · publish-validator                     │ │
│   │ Tools:  MCP(ui-kit catalog) · MCP(TetraOS) · execute(allowlist)│ │
│   │ Frontend tools: request_screenshot · read_console ·           │ │
│   │                 resolve_element                                │ │
│   │ interrupt_on: publish · dependency add · destructive fs ops    │ │
│   └───────────────────────────────────────────────────────────────┘ │
│   FS backend  ──► project source tree (object storage + git)         │
│   Sandbox     ──► lint / typecheck / build  (§3.4)                  │
│   Checkpointer ──► Postgres (thread state, resume)                  │
│   Tracing     ──► LangSmith (§5.12)                                 │
└──────┬────────────────────────────┬─────────────────────────────────┘
       │                            │
┌──────▼──────────────┐   ┌─────────▼────────────────────────────────┐
│ ts-lib-ui-kit       │   │ PUBLISH SERVICE  (server-side only)      │
│ catalog MCP         │   │ validate → docker build → ts-cli publish │
│ /api/mcp (Vercel)   │   │        → Data & AI Workspace gallery     │
└─────────────────────┘   └──────────────────────────────────────────┘
```

Note the asymmetry: **the source tree lives server-side and is authoritative**; the WebContainer is a
disposable renderer that receives file patches. This is deliberate — it is what makes sessions
resumable (§5.7) and publishing consistent (§5.9). A browser-authoritative design would make both
much harder.

---

## 5. Component design

### 5.1 Builder frontend

Built from `ts-lib-ui-kit` throughout — `DataAppShell` for the shell, `ResizablePanelGroup` /
`ResizablePanel` / `ResizableHandle` for the split, `CodeEditor` for the file view, and the AI
Elements for the chat.

**Three resizable panes (Chat · Preview · Files) plus the design harness as an overlay on the
preview.** The harness is not a fourth pane; it is chrome over the iframe.

| Pane | Kit components | Notes |
| --- | --- | --- |
| **Chat** | `Conversation`, `Message`, `PromptInput`, `Reasoning`, `ChainOfThought`, `Task`, `Tool`, `Confirmation`, `StreamStatus`, `Queue`, `Attachments`, `SpeechInput` | `Task` renders `write_todos` state — the plan the scientist watches. `Confirmation` renders AG-UI interrupts. |
| **Preview** | iframe + `Spinner`, `Banner` for build/capability errors | WebContainer-served |
| **Files** | `CodeEditor` (Monaco), `sidebar`, `Badge` for dirty state | Read-only by default; direct editing is an explicit mode (§5.11) |
| **Design overlay** | `Popover`, `Slider`, `Select`, `Tabs`, token swatch controls (composed, not a kit export) | §5.6 |

Deliberate UX choices for a non-developer audience:

- **The plan is always visible.** `write_todos` state renders as a persistent checklist, not buried
  in chat. A scientist who cannot read the diff needs to see the intent.
- **Diffs are described, not shown, by default.** "Added a filter above the results table" with the
  diff behind a disclosure. The `Tool` component's collapsed state does this well.
- **Errors never surface as stack traces.** The `build-fixer` subagent gets first attempt; the
  scientist sees "fixing a problem with the chart" and only sees raw output if it fails twice.
- **Every irreversible action is a `Confirmation` card**, never a chat message the user might miss.

**The builder itself must meet the kit's own accessibility bar** — keyboard navigable, WCAG AA in
both themes, `prefers-reduced-motion` honoured. It would be indefensible to ship an inaccessible tool
whose selling point is that it generates accessible apps. i18n is deferred but the string layer
should not be hardcoded inline.

### 5.2 AG-UI event contract

Standard AG-UI events carry messages, tool calls, lifecycle, and interrupts. The table below is the
frontend↔backend contract and should be the first artifact written in code. Note the direction
column carefully: the three inspection tools are **agent→UI calls** whose results return to the
agent.

| Direction | Name | Payload | Purpose |
| --- | --- | --- | --- |
| agent → UI | `state` patch: `files` | JSON-patch (RFC 6902) on the file tree | File pane sync |
| agent → UI | `state` patch: `todos` | JSON-patch on `{id, content, status}[]` | Plan checklist |
| agent → UI | `state` patch: `buildStatus` | JSON-patch on `{phase, message?, detail?}`; `phase ∈ idle\|installing\|building\|ok\|error` | Preview chrome |
| agent → UI | custom `fs.patch` | `{path, op, content?, encoding?}[]`; `op ∈ write\|delete\|rename\|mkdir`; `encoding ∈ utf8\|base64` (base64 for `images/icon.png` etc.) | Apply to WebContainer, trigger HMR |
| agent → UI | custom `capability.set` | `{charts: bool, editor: bool, chem: bool}` — full desired state, not a delta | Mount/unmount lazy dep bundles |
| agent → UI **call** | frontend tool `request_screenshot` | in `{selector?, viewport?}` → out `{url}` (uploaded blob, **not** inline base64 — SSE payload limits) | Visual self-review |
| agent → UI **call** | frontend tool `read_console` | in `{since, limit}` → out `{entries: {level, text, ts, stack?}[], truncated}` | Runtime error capture |
| agent → UI **call** | frontend tool `resolve_element` | in `{x, y}` → out `{file, line, component, dataSlot, classes}` | Element picker → source |
| UI → agent | custom `design.intent` | see §5.6 | Structured design edits |
| UI → agent | custom `source.edit` | `{path, content, baseCommit}` | Human direct edit (§5.11) |
| UI → agent | custom `session.op` | `{op: fork\|undo\|restore, targetCommit?}` | Session lifecycle (§5.7) |
| UI → agent | interrupt response | `approve \| reject \| edit` | Gated actions |

Contract rules: every custom event carries a `v` field so the set can version; `resolve_element`'s
output shape is normative here and §5.6 must match it; SSE reconnect replays from the last
acknowledged event id, and the checkpointer — which covers agent state, not event delivery — is the
backstop if replay fails.

`resolve_element` is the load-bearing one. Everything good about the design harness depends on
mapping a clicked pixel back to a line of source; everything frustrating about it comes from that
mapping being wrong.

### 5.3 Deep agent configuration

**Filesystem backend.** A custom backend over the session's project tree in object storage, with
`permissions` rules denying writes to `manifest.json`'s identity fields, `Dockerfile`, and CI config
(the scaffold owns those; the agent proposes changes through a dedicated tool that validates first).
Deny reads of anything resembling a credential.

**Sandbox backend.** Per §3.4, with `execute` allowlisted to `yarn lint`, `tsc --noEmit`,
`vite build`, `yarn test`, and a fixed set of `git` invocations.

**Skills.** The existing skills are already Agent Skills-standard directories and load as-is:

- `ts-data-app-frontend-quality` — **16 rules**, and the most valuable artifact we have for this
  project. It is *already written as agent constraints*: compose from the kit (Rule 1), map data to
  data (Rule 2), Tailwind not inline styles (Rule 5), lucide not emojis (Rule 11),
  try/catch/finally (Rule 12), controlled forms with the `Field` family (Rule 13), no
  `dangerouslySetInnerHTML` / no client secrets / validate URLs (Rule 14), all four data states
  (Rule 15). Its `references/kit-primitives.md` is the raw-HTML→kit-component mapping table.
- `ts-data-app-engineer` — manifest schema, auth (`jwtManager`, `ts-auth-token` / `ts-token-ref`
  cookies), injected env vars (`ORG_SLUG`, `TDP_ENDPOINT`, `JWT_TOKEN_PARAMETER`, …), persistence
  (K/V, EFS at `/var/data`, ManagedTables), publish commands.
- `ts-data-app-product-sign-off` — README conventions and the release checklist; drives §5.9.
- **New:** `tetra-app-builder-scientist` — the one skill we must write. It encodes how to talk to a
  non-engineer: ask about the *science* not the *schema*, propose rather than ask when the choice is
  cheap (Rule 6 already says this), name TetraOS concepts in the scientist's vocabulary.

> **Cross-cutting concern:** overlapping UI-kit skills exist in the environment
> (`ts-ui-kit-developer` in the tetrascience plugin; `ts-ui-kit-contributor` and
> `ts-devex-ui-kit-contributor` in another namespace) with near-identical descriptions. Resolve to one
> before wiring skill auto-invocation, or the agent will load contradictory guidance — and they
> already *do* contradict each other (see OQ5, now answered). Also note these skills are ~90% about
> *contributing to* the kit, which is the wrong posture for a consumer; only the "extend, don't fork"
> guidance, the consumer theme-override pattern, and the chart theming guidance apply.

**Memory.** Each project gets an `AGENTS.md` the agent maintains: the app's purpose, the scientist's
stated preferences, decisions already made, known dead ends.

**Subagents.** This is the canonical roster; §3.1 and §4 defer to it.

| Subagent | Job | Why isolated | Phase |
| --- | --- | --- | --- |
| `build-fixer` | Given a lint/type/build failure from `execute`, fix it | Error output is long and noisy | 1 |
| `component-scout` | "Which kit component does X?" over the catalog MCP | Prevents catalog dumps in main context | 1 |
| `data-scout` | "What data does this org actually have?" over the TetraOS MCP | Schema responses are large (§5.4) | 1 |
| `design-reviewer` | Given a screenshot + the a11y/design rules, list concrete fixes | Multimodal, verbose reasoning | 2 |
| `publish-validator` | Run the §5.9 gate list, report pass/fail | Long deterministic checklist | 2 |

**Interrupts.** `interrupt_on` for: `publish` (always), adding a dependency, deleting files, and any
write to the manifest.

### 5.4 Grounding: components and data

Two grounding problems, one already solved and one not.

#### 5.4.1 Component grounding — use what SW-1730 built

Two catalog generators exist in this repo:

1. `@storybook/addon-mcp` (installed **0.6.0**; 0.7.0 current on npm) writes
   `storybook-static/manifests/components.json` — **94 entries, of which 6 are docs pages, so ~88
   components** — with react-docgen props, per-story JSX snippets, and a ready-made import string.
   Keys are story-title slugs (`components-button`, `ai-elements-chat`), not component names. Its full
   toolset is served at `localhost:6006/mcp` **only while `storybook dev` runs**, so the builder
   cannot consume it in production.
2. Our own `scripts/mcp/build-metadata.ts` (ts-morph) writes `storybook-static/mcp/components.json`
   with **`argTypes` — the exact variant/size option arrays** — plus default and per-story args and
   `hasPlayTest`. Served statelessly by `api/mcp.ts` at
   `https://ts-lib-ui-kit-storybook.vercel.app/api/mcp` with `list_components`, `get_component`,
   `search_components`. **This file is not in the current checkout** — only the generator is; it is
   produced by `yarn build-storybook:metadata` and `vercel.json` includes it in the function bundle.

The custom one is the spine for this product, for a specific reason: **react-docgen does not
enumerate CVA variant values.** It reports that `Button` has a `variant` prop with default
`"default"`, but not that the legal set is `default | outline | secondary | ghost | destructive |
link`. Only the ts-morph `argTypes` extraction has that. An agent guessing `variant="primary"`
produces code that type-checks against `string` and looks wrong on screen — the worst failure mode.

**Retrieval strategy.** 125 component files and 479 unique exports will not fit in context. So:

1. **Always-on primer in the system prompt** — a compact ~2 KB table of the 40 highest-frequency
   components with their variant sets. Generated from the catalog in CI, never hand-written.
2. **`component-scout` subagent** for anything else, over the MCP. Returns a name, an import, and one
   exemplar snippet — never a prop dump.
3. **The exemplar snippet is the highest-leverage payload.** A real story snippet teaches correct
   usage far better than a prop table. All 109 story files are CSF3 and 103 carry `autodocs`, so we
   have good exemplars for nearly everything.

**The catalog must cover `./server`, and today it does not.** The kit has a second entrypoint —
`dist/server.d.ts`, 28 exports including `jwtManager`, `JwtTokenManager`, `getProviderConfigurations`,
`buildProvider`, `AthenaProvider`, `SnowflakeProvider`, `DatabricksProvider`, `getTdpAthenaProvider`,
`TdpSearchManager`, plus the `./server/providers/{athena,snowflake,databricks}` subpaths. None of it
is in either catalog, because both are Storybook-derived and server code has no stories. Yet this is
*precisely* the surface a data app needs to reach TetraOS data. **Extending
`scripts/mcp/build-metadata.ts` to emit a second section for `./server` from `dist/server.d.ts` is a
Phase 1 deliverable.** Caveat: AGENTS.md says `src/server/` is being extracted to a separate package —
so the catalog must key off the entrypoint, not the path, to survive that move.

**Freshness contract, and a correction to an earlier draft.** An earlier version of this document
named `dist/index.d.ts` an authoritative source. It is not: `dist/` is gitignored, and the local build
is weeks stale. Concretely — `DataAppShell` was rewritten on 2026-07-24 (SW-2118) *after* both the
local `dist/` build and the published 0.7.0 (cut 2026-06-30). So `rightPanel`, `secondaryBar`,
`navVariant`, `primaryNav`, `showTopBar`, `headerLeft`, and `headerCenter` **exist in `src/` but not in
npm 0.7.0**. An agent grounded on the published package and a `src`-derived catalog will hallucinate
props that are real but unreleased. Therefore:

- **The only authoritative in-repo source is `src/`.** Catalogs are derived artifacts.
- The catalog must record `packageVersion`, and the builder must **fail loudly** if it does not match
  the kit version pinned in the app template.
- **The catalog must be generated from the published tag, not from `main`.** Generating from `main`
  is how the unreleased-prop failure above happens.
- CI regenerates the catalog and the snapshot on the **npm publish event**, not on tag push:
  `publish-public.yml` gates the PROD publish behind a manual `environment: PROD` approval, and
  `release.yml` is `workflow_dispatch` only, so tag push does not imply a published package.

**Do not ground on:** `registry.json`, `dist/`, `storybook-static/` as checked out, `DESIGN.md` §2–3,
`get_started_1.md`, or the README's version claim. All stale — see Appendix B.

#### 5.4.2 Data grounding — the gap that matters most

§2.1's headline success is "an app on their own TetraOS data", and no amount of component correctness
delivers that. The agent must be able to answer: *what data does this org actually have, and how do I
query it?*

A **TetraOS MCP server** (read-only) exposed to the agent, fronted by the `data-scout` subagent:

| Tool | Returns | Backed by |
| --- | --- | --- |
| `list_ids_types` | IDS types present in the org, with file counts | Data Lake search |
| `get_ids_schema` | JSON schema for an IDS type | Artifact API |
| `list_tables` | Tetraflow / ManagedTables tables and columns, `full_table_name` | dbx-management / lakehouse |
| `sample_rows` | A small, **redacted** sample from a table | Athena |
| `list_providers` | Configured providers and their injected env var names | Provider config |
| `search_files` | Elasticsearch query against the Data Lake | Data Lake search |

Three non-negotiables:

1. **All calls use the scientist's own token**, so RBAC, DARs and EARs apply. Never the connector
   token for reads — the `ts-data-app-engineer` skill is explicit that the app token is Member-only
   and bypasses DAR/EAR enforcement.
2. **Read-only.** No tool in this server mutates anything.
3. **Sample data is a governance decision, not a technical one.** See §6 and OQ8: sending real
   scientific values to a model is the question a customer's QA function will ask first. Default in
   v1 should be **schema and column names only, no values**, with `sample_rows` behind an explicit
   per-org opt-in.

The generated app then queries data at runtime through the kit's `./server` providers, which is why
§5.4.1's server-catalog work is a hard dependency of this section.

### 5.5 Preview runtime

WebContainer boots the template, runs `vite dev`, and serves into an iframe. Agent file writes arrive
as `fs.patch` events, are applied via the WebContainer FS API, and Vite HMR does the rest.

Boot sequence:

1. Fetch the pre-warmed `node_modules` snapshot for `(kit version, template version, capability set)`
   — capability set read from the **Project record**, not from a transient event.
2. `mount()` the snapshot plus the session's file tree at `commit_ref`.
3. Start Vite. Stream stdout/stderr as `buildStatus` + the console tap.
4. On `capability.set` change, fetch and mount the additional dep bundle and restart.

**Snapshot invalidation** keyed on that same triple, rebuilt in CI on the kit's npm-publish event
(§5.4.1).

**Known limits to design around, not fight:** no Docker, no real Python backend, no arbitrary native
modules, memory-bound per browser tab. Every one of these argues for the same thing: the browser is a
*renderer*, the server is the *source of truth*.

### 5.6 Design harness

The premise: chat is a bad instrument for "this padding is wrong". Four surfaces, each emitting a
structured `design.intent` event rather than synthesised prose. Structured intent is the whole point —
"make the spacing on the card tighter" round-trips badly; `{target: {file, line, component: "Card"},
op: "spacing", from: "p-6", to: "p-4"}` does not.

| Surface | Interaction | Mechanism | Agent's job |
| --- | --- | --- | --- |
| **Element picker** | Click any element in the preview | `resolve_element` → `{file, line, component, dataSlot, classes}` | Scope the next edit to that element |
| **Token editor** | Adjust `--primary`, `--radius`, spacing scale, dark mode | `design.intent {tokens}` | Write to the app's CSS override block — **never** touch kit source |
| **Property panel** | For a resolved kit component, edit its *real* variants from the catalog | `design.intent {component, prop, value}` | Apply as a source edit |
| **Console / error tap** | Automatic | `read_console` | Feed `build-fixer` |
| **Screenshot review** | "Does this look right?" | `request_screenshot` | `design-reviewer` returns concrete fixes |

**The property panel is the sharpest idea here and the most defensible.** Because the catalog knows
the exact legal variant set, the panel can offer a *dropdown of real options* instead of a text box.
The scientist cannot invent `variant="primary"`, and neither can the agent when it reads the panel's
output. This is the design-time analogue of the prop-validation layer the tradeoffs doc says
generative UI would need — and we get it without any runtime risk.

**Implementation, including the cross-origin problem.** Use the kit's existing `data-slot`
attributes — **350 distinct values**, every component tags its root. That is a far better anchor than
a React-fiber walk, and it exists already. Pair it with a Vite plugin injecting `data-source-loc` for
the line mapping.

But the preview iframe is **cross-origin** (WebContainer serves it from its own origin) and §6
requires a restrictive CSP, so the parent frame cannot hit-test into it, read its console, or
screenshot it directly. This requires an **instrumentation bridge**: a small script injected into the
preview by the Vite plugin that owns hit-testing, console capture, and `html2canvas`-style capture,
and answers the parent over `postMessage` with a strict message schema and origin check.

*Phase 0 spike, and this is the single highest-risk unknown in the harness:* confirm that the
`data-slot` + `data-source-loc` pair plus the postMessage bridge resolves reliably through nested
compound components (a `Card` inside a `DataTable` cell inside a `Sheet`).

### 5.7 Sessions, persistence, resume

Requirement: multiple named sessions per scientist, each saveable and resumable.

**Data model**

```
Organization
└── Project                 # one app; owns the repo, manifest identity, published versions
    ├── AGENTS.md           # deep-agent memory: purpose, preferences, decisions
    ├── capabilitySet       # {charts, editor, chem} — persisted, drives snapshot choice
    ├── kitVersion          # pinned; must match catalog packageVersion
    ├── source tree         # object storage + git; server-side, authoritative
    ├── lock                # single-writer advisory lock (see below)
    └── Session[]           # a named conversation thread against the project
        ├── thread_id       # LangGraph checkpointer key
        ├── checkpoint[]    # full agent state per turn
        └── commit_ref      # git SHA at session end
```

Separating **Project** (the artifact) from **Session** (the conversation) is the important call. A
scientist will have several conversations against one app — "add the QC tab", "fix the colours",
"prepare for release" — and conflating them into one endless thread makes both context management
and resume worse.

**Three layers of state, three mechanisms:**

| State | Mechanism | Resume behaviour |
| --- | --- | --- |
| Conversation + agent internals | LangGraph **checkpointer** (Postgres), keyed by `thread_id` | Exact resume, mid-plan, including pending interrupts |
| Source tree | **git**, one commit per accepted agent turn *and* per accepted human edit | Every turn is a restore point |
| Preview container | **not persisted** | Rebooted from snapshot + tree on resume |

That third row is a feature. WebContainer state is derived, so throwing it away removes a whole class
of "works in my tab" bugs. Resume = fetch snapshot, mount tree at `commit_ref`, `vite dev` — the same
work as a cold start, so **resume and cold start share one budget** (§8 Phase 0); an earlier draft
gave them different targets, which was incoherent.

**Because turns are commits, we get for free:** undo ("go back to before the chart change"), fork
("try a different layout"), and a real diff for the engineer who inherits the app. Expose undo and
fork in the UI via `session.op`; scientists will use them constantly, and they are the main thing that
makes an AI builder feel safe to experiment in.

**Concurrency.** Multiple sessions against one Project means multiple writers to one tree. v1 takes
the boring, correct option: a **single-writer advisory lock on the Project**. A second session opens
read-only with an explicit "another session is editing this app" banner and a one-click "take over"
that requires the first session to be idle. Merge semantics are deliberately not attempted.

**Auth scoping.** Sessions are scoped to `(org, user)`. The scientist's TetraOS identity comes from
the `ts-auth-token` / `ts-token-ref` cookie via `jwtManager`, exactly as any data app does — the
builder is itself a data app (OQ6), so this is the standard path, not a new one.

### 5.8 The app template stub

**React + Vite + Express**, matching the public `ts-cli init data-app --template react` shape
(`packages/client` + `packages/server`, Yarn 4, ViteExpress, supervisord, port 80).

Rationale for not using the React+FastAPI cookiecutter, despite it being the platform's stated
strategic direction: it is internal-only, and — the real reason — **the server-escalation path in
§5.5 is not built in v1**. Python cannot run in WebContainer, so a FastAPI template would have no
live preview of its backend, which is the core loop. This is a v1 sequencing decision, not a
judgement on the stack; when server-side preview lands, FastAPI becomes viable and should be
revisited (Risk 8).

Generated at scaffold time:

```
manifest.json          type:"connector" + labels[{subtype:data-app}], namespace private-<org>,
                       slug ts-data-app-<name>, version v0.1.0, icon images/icon.png,
                       exposesPorts {"80": {...}}, minSpecs.cloudStorage,
                       supportedPlatformVersion.minVersion (no "v" prefix)
AGENTS.md              agent memory seed
README.md              scaffolded to the ts-data-app-product-sign-off convention, sections in order
Dockerfile             multi-stage + supervisord; agent-write-denied
packages/client/       main.tsx (imports kit CSS once) · App.tsx (DataAppShell) · Router.tsx
                       features/ components/ services/ store/ providers/ lib/ types/
                         — exactly the ts-data-app-frontend-quality Rule 4 layout
                       ErrorBoundary at app + route level
                       one reference feature demonstrating all four data states
packages/server/       Express + cookie-parser + jwtManager wiring
                       one provider-backed query using the kit's ./server exports
                       K/V persistence helper (see below)
.github/workflows/     publish-pr / publish-merge / release
```

**Persistence in the template.** The scientist's "replace my Excel workflow" app will need to save
state, so the template must ship one working pattern rather than leaving it to the agent. Default:
**connector K/V store** (GA since TDP 4.0.0, ~1 MB/key, right for view config and preferences), with
EFS at `/var/data` available when `minSpecs.cloudStorage` is set. **ManagedTables is Beta (TDP 4.4.2,
behind `ENABLE_MANAGED_TABLES_FOR_DATA_APPS`) and is not the v1 default** — but note it is the only
option that survives uninstall, so it is the right answer eventually. See OQ7.

Two design rules for the template:

1. **The template must satisfy the sign-off checklist on day zero.** §4 of the sign-off skill
   (manifest sanity) gates on "no leftover cookiecutter/template fields — demo `ui.components`
   config, placeholder descriptions". If the scaffold is clean by construction, that gate is free
   forever.
2. **The template pre-answers the frontend-quality rules.** `services/` exists, `Field`-based form
   patterns exist, an Error Boundary wraps the app, the four data states are demonstrated once. The
   agent then follows the pattern in front of it, which is far more reliable than following a rule in
   a prompt.

### 5.9 Publish pipeline

Publishing is server-side. WebContainer cannot build a Docker image, and `ts-cli` needs credentials
that must never reach the browser (frontend-quality Rule 14: no secrets in the client).

```
Scientist clicks Publish
  │
  ├─ 1. Interrupt → Confirmation card: namespace, slug, version, visibility
  ├─ 2. publish-validator subagent runs the gate list (below)
  ├─ 3. Server: git archive @ commit_ref → build context
  ├─ 4. yarn install · lint · typecheck · test · vite build
  │       JFrog creds used for build tooling only; no private runtime dep (§3.3)
  ├─ 5. docker build (multi-stage, supervisord, port 80)
  ├─ 6. ts-cli publish . --type data-app --namespace <ns> --slug <slug> \
  │         --version <ver> -c auth.json -f
  └─ 7. Poll gallery; surface "Get Started" deep link when Running
```

**Gate list** — derived from the sign-off skill, and note *why* it must be exhaustive: the skill
documents that `ts-cli` and the platform validate weakly and fail silently. Special characters in a
slug produce a *silent publish failure*; a missing `exposesPorts` produces an app that publishes
fine and is then unreachable. **We must do this validation ourselves because nothing downstream
will.**

| Gate | Check |
| --- | --- |
| Slug | Alphanumeric + hyphens only. Silent failure otherwise. |
| `type` / `labels` | `"connector"` + `{subtype: data-app}` |
| `exposesPorts` | Present, object-keyed-by-port-string (not an array), `hubDefaultPort` set. If missing, the app is unreachable. |
| `minSpecs.cloudStorage` | Inside `minSpecs`, not at root |
| `supportedPlatformVersion.minVersion` | Present, semver **without** `v` prefix (contrast: `version` uses `v`) |
| Version consistency | `manifest.json` version == README version; semver bump matches change type |
| README | All required sections present, in order; changelog imperative mood, no trailing periods |
| Content hygiene | No internal GitHub/Slack links, no secrets, no customer names |
| `common` namespace | Scan README + UI labels + queries for customer-specific vocabulary (ID prefixes like `tr_`, `ppb_`; LIMS-specific naming). Block if found. |
| Scaffold hygiene | No placeholder descriptions, no demo config left behind |
| Build | `yarn lint --max-warnings 0`, `tsc --noEmit`, `yarn test`, `vite build` all clean |
| Accessibility | Generated play-function tests pass, incl. the kit's a11y assertions (§5.10) |
| Security | No `dangerouslySetInnerHTML` on dynamic content, no secrets in the client bundle, URL schemes validated |

**Terminology correction, and it matters for the UI copy.** The user-facing surface is the
**Data & AI Workspace** gallery (also "Data Apps gallery"). The phrase *"Data App Marketplace"*
appears nowhere in the platform skills. Use the platform's term or we ship copy that does not match
the product the scientist is looking at.

**Namespace policy.** `private-<org>` only for scientist-authored apps in v1. The sign-off skill warns
there is *no easy way to remove an app from `common` once published*, so promotion to `common` stays
an engineer/PM action behind the existing TDA sign-off process. See OQ3.

**Lifecycle after publish.** Version bump + republish is the supported update path. Rollback = publish
the previous version again (versions are immutable). **Unpublish and deprecate are platform gaps we
inherit, not gaps we can close** — which is the substantive reason for the `private-only` policy
above. Upgrading a published app to a new kit version is an agent task: bump the pin, regenerate the
snapshot, run the gate list, republish.

### 5.10 Verification of generated apps

An app that lints is not an app that works. Three layers, and the first one is the differentiator:

1. **Generated play-function tests.** The kit's own convention is Storybook play functions in a real
   browser (103 of 109 story files have them), and `.storybook/preview.ts` sets
   `parameters.a11y.test = 'error'` so a11y violations *fail the test*. The agent should generate
   stories with play functions for each feature it builds, and inherit that a11y enforcement for
   free. This is the highest-value thing we can copy from this repo into generated apps — it converts
   accessibility from a review opinion into a build failure. Note: `parameters.zephyr.testCaseId` is
   auto-generated in this repo and must be left empty in generated apps.
2. **Smoke test against real data.** One test per data-backed view asserting it renders and the
   query returns, run in the sandbox against the scientist's own org with their token.
3. **`design-reviewer` on screenshots.** Catches what tests cannot: visual hierarchy, spacing,
   whether it actually looks like a Tetra app.

Layer 1 lands in Phase 1 (it gates the exit criterion). Layers 2–3 in Phase 2.

### 5.11 Direct human edits and engineer handoff

**Direct edits.** The Files pane is read-only by default with an explicit "edit directly" mode. An
accepted edit arrives as `source.edit {path, content, baseCommit}` and is committed like an agent
turn, so it is in the same undo/fork history. If `baseCommit` is stale (the agent committed while the
human was typing) the edit is rejected with a diff and the human re-applies — the boring option, and
correct for v1. While an agent turn is in flight the editor is locked; the Project lock (§5.7)
handles the multi-session case.

**Engineer handoff** is a Phase 2 deliverable, not an emergent property of using git. On request:
create the GitHub repo as `ts-data-app-<slug>` under the org, push the full history (every turn is a
commit, so the engineer inherits a readable narrative), enable the `.github/workflows/` the template
already ships, and open a TDA ticket linking repo to Project. After handoff the Project is marked
`externally-owned` and the builder stops writing to it — two-way sync between builder and a live repo
is not something we should attempt.

### 5.12 Observability, cost, and limits

Absent from the first draft and non-optional for a service that spends money per keystroke.

| Concern | Mechanism |
| --- | --- |
| Tracing | **LangSmith** — already a declared `deepagents` peer. Every session traced; `thread_id` is the correlation key across AG-UI, checkpointer, and traces. |
| Token / cost accounting | Per-turn token and cost recorded on the Session; rolled up per Project, user, and org. This is what answers OQ2. |
| Quotas | Per-org monthly budget and per-session turn cap, both surfaced in the UI before they bite. |
| Model routing | Frontier model for planning and design; cheaper model for `build-fixer` and `component-scout`. Measure before assuming the split works. |
| Rate limiting | Per-user concurrent session cap; publish rate limit per org. |
| SLOs | Time-to-first-token, time-to-first-render, publish success rate. |
| Audit | Immutable log of publishes: who, what version, which namespace, which commit. Required for any regulated customer. |

---

## 6. Security and governance

The design keeps the dangerous surfaces closed by construction rather than by policy:

| Risk | Control |
| --- | --- |
| Prompt injection via TetraOS data the agent reads | Data is data, never instructions. TetraOS MCP is read-only. No tool acts on instructions found in file or query content. |
| Model-chosen props hitting live UI | **Not applicable** — we generate source code, not runtime component trees. This is the main security argument for design-time over generative UI. |
| Secrets in the generated client bundle | Rule 14 in the loaded skill; a bundle scan in the publish gate |
| Publish credentials | Server-side only; never in an AG-UI event, never in the WebContainer |
| Agent escaping its sandbox | Filesystem `permissions` rules; `execute` allowlisted to a fixed command set (§3.4), no arbitrary shell in v1, no network from the sandbox except the package registry |
| Untrusted app code executing | WebContainer is a browser sandbox; preview runs cross-origin in an iframe with a restrictive CSP and a schema-checked, origin-checked postMessage bridge (§5.6) |
| Cross-tenant leakage | Sessions scoped `(org, user)`; TetraOS calls use the *user's* token so RBAC/DAR/EAR apply — never the connector token for reads |

**Data governance — the question a customer's QA function asks first.** Whether customer scientific
data reaches the model is a policy decision, and the architecture must support the strictest answer:

- **v1 default: schema and column names only. No values.** `sample_rows` (§5.4.2) is off unless an
  org explicitly opts in.
- Region and residency follow the TetraOS deployment; model calls must not cross it.
- Retention: prompts and completions are retained only as long as the Session, and the audit log
  records metadata not content.
- **GxP:** an app authored by a scientist and published to their own org is, in a regulated lab, a
  computerised system. We should not claim validation. State plainly that generated apps are
  unvalidated by default and that promotion to a validated context goes through the existing
  engineering and QE process. See OQ8.

---

## 7. Risks and open questions

**Risks, highest first**

| # | Risk | Mitigation | Owner / phase |
| --- | --- | --- | --- |
| 1 | **WebContainer cold start** under the kit's ~110 MB dep closure (monaco alone ~94 MB) | Pre-warmed snapshot; capability-gated deps. **Benchmark in Phase 0 — this can kill the in-browser approach.** | Phase 0 gate |
| 2 | **WebContainer commercial licensing** — single vendor, unpriced | Procurement conversation; keep the server-container escalation designed-in | OQ1, before Phase 2 |
| 3 | **`resolve_element` + cross-origin bridge** through nested compound components | Phase 0 spike on `data-slot` + source-loc + postMessage | Phase 0 gate |
| 4 | **Catalog staleness / unreleased props** — catalogs are gitignored, `dist/` is stale, `src/` is ahead of npm | Generate from the published tag; version-match contract that fails loudly; CI on npm-publish event | Phase 1 |
| 5 | **Pre-1.0 dependencies** — `@ag-ui/client` 0.0.57, `@ag-ui/langgraph` 0.0.42 | Pin exact; thin adapter module so churn is contained | Phase 1 |
| 6 | **Scientist abandons mid-build** because the output is subtly wrong and they cannot diagnose it | This is the *product* risk and the one most likely to be underweighted. `design-reviewer` + `build-fixer` + visible plan + one-click undo + generated tests. Measure completion rate. | Phase 3, pilot |
| 7 | Generated apps drift from platform conventions as the platform moves | Skills are the single source; primer regenerated in CI; retrospective loop in Phase 3 | Phase 3 |
| 8 | Platform's strategic stack is React+FastAPI; we ship React+Express | §5.8; revisit when server-side preview lands | Phase 3 |
| 9 | **Data governance blocks the pilot** because sample data reached the model | Schema-only default (§6) | OQ8, Phase 0 |

**Open questions**

| # | Question | Blocks | Home |
| --- | --- | --- | --- |
| 1 | WebContainer licence cost and terms. **Owner unassigned.** | Phase 2 | Start in Phase 0 |
| 2 | Model choice and per-app cost envelope; does a cheap model handle `build-fixer`? | Phase 1 scope | §5.12 instruments it; answer during Phase 1 |
| 3 | Can a scientist publish at all, or only *request* publication? §5.9 recommends `private-<org>` only. | Phase 2 | Product decision, needed by Phase 2 start |
| 4 | Which of the overlapping UI-kit skills is canonical? | Skill wiring | Phase 0 (documentation fix) |
| 5 | ~~Does the kit export `ButtonProps`?~~ **ANSWERED: no.** Zero occurrences in `dist/index.d.ts`; `button.tsx` exports only `{Button, buttonVariants}`. `ts-data-app-frontend-quality` is correct ("derive it"); `ts-ui-kit-developer`'s extension example is **wrong** and should be fixed in that skill. | — | Closed |
| 6 | Where does the builder itself run? It is a data app, implying it deploys through the pipeline it operates. | Infra planning | Confirm in Phase 0 |
| 7 | ManagedTables (Beta) or K/V+EFS as the generated-app default? §5.8 picks K/V for v1. | Template design | Confirm by Phase 1 |
| 8 | **Data governance:** may scientific values reach the model at all? GxP posture for generated apps? | Pilot | Phase 0 — legal/QA input needed |

---

## 8. Phased plan

**Phase 0 — De-risk (2–3 weeks).** Answer the questions that can invalidate the architecture, and
nothing else. Ship no product.

- Benchmark WebContainer boot with the real kit dep closure; build one pre-warmed snapshot; measure
  with and without charts/editor. **Go/no-go on in-browser preview.**
- Spike `resolve_element`: `data-slot` + Vite source-loc + cross-origin postMessage bridge.
- Wire `deepagents` + `@ag-ui/langgraph` + CopilotKit end-to-end: one prompt → one file written →
  HMR in the preview. Throwaway UI. Confirm AG-UI supports UI-originated custom events.
- Point the agent at the deployed catalog MCP; measure variant-correctness unaided.
- Resolve OQ4 and OQ6 (documentation/confirmation). Start OQ1 and OQ8 conversations.

**Exit criteria — thresholds, not aspirations:**

| Criterion | Threshold | Conditions |
| --- | --- | --- |
| Preview cold start (= resume) | **p50 ≤ 12 s, p95 ≤ 20 s** | Warm CDN, 50 Mbps / 50 ms, base capability set (no charts, no editor), Chrome, mid-range laptop |
| Cold start with charts | **p95 ≤ 30 s** | Same, charts capability on |
| `resolve_element` accuracy | **≥ 19/20** hand-labelled targets, including ≥ 5 in nested compound components | Correct = exact file + line ±1 |
| Variant correctness | Baseline recorded; **≥ 85%** of generated kit-component usages use a legal variant | 30 fixed prompts, unaided, single attempt |
| AG-UI round trip | Demo passes | — |

**Phase 1 — Prompt to preview (6–8 weeks).** The core loop, engineer-usable.

- Template stub, clean against the sign-off checklist by construction, with K/V persistence and a
  provider-backed reference query.
- Deep agent: filesystem + sandbox backends, the three existing skills, `TodoListMiddleware`,
  `build-fixer` / `component-scout` / `data-scout` subagents.
- Catalog work: `./server` section added to `build-metadata.ts`; primer generated in CI; freshness
  contract; generation from the published tag.
- TetraOS read-only MCP (schema-only by default).
- Builder UI in the kit's own AI Elements: chat + preview + files. Replace CopilotKit.
- Sessions: Postgres checkpointer, git-per-turn, resume, undo, Project lock.
- Generated play-function tests with a11y enforcement (§5.10 layer 1).
- LangSmith tracing + per-session token/cost accounting.

**Exit criteria:**

| Criterion | Threshold |
| --- | --- |
| Reference build | An engineer builds the **fixed reference app** (3 routes: a filterable `DataTable` over a real IDS type, a chart view, a settings form) from prompts alone, **≤ 25 turns, no manual file editing** |
| Correctness | Generated app passes `yarn lint --max-warnings 0`, `tsc --noEmit`, and its generated play tests — **on the agent's own first non-error report**, not after human fixes |
| Resume | Session survives browser restart and resumes mid-plan with pending interrupt intact, **10/10 trials** |
| Grounding | Zero imports of non-existent or unreleased kit exports across the reference build |
| Cost | Reference build cost recorded; answers OQ2 |

**Phase 2 — Design harness and publish (6–8 weeks).** Scientist-usable.

- Element picker, property panel (catalog-driven dropdowns), token editor, console tap, screenshot
  review + `design-reviewer`.
- Publish service: gate list, server build, `ts-cli publish`, gallery polling, audit log.
- Interrupts and `Confirmation` cards for every gated action.
- `tetra-app-builder-scientist` skill.
- Multi-session management UI; fork; direct-edit mode; engineer handoff (§5.11).
- Smoke tests against real data (§5.10 layer 2).

**Exit criteria:**

| Criterion | Threshold |
| --- | --- |
| End-to-end | A scientist with no React experience publishes an app to `private-<org>`; it runs in the Data & AI Workspace |
| **Design harness** | On a **20-item corpus of visual defects**, the harness + agent fixes **≥ 15** with no chat-typed CSS from the user; **zero** edits land in kit source |
| Publish gate — no false negatives | Against a **12-app known-bad corpus** (bad slug, missing `exposesPorts`, `v`-prefixed `minVersion`, README drift, customer vocabulary in a `common` app, secret in bundle, …): **12/12 blocked** |
| Publish gate — no false positives | **10/10** known-good apps pass |
| Handoff | Engineer clones a handed-off repo and CI goes green with no manual fixes |

**Phase 3 — Pilot and harden (ongoing).** 5–10 scientists on real workflows.

Instrument **completion rate** (sessions started → app published) and **turns-to-working-app** as the
headline metrics, alongside the cost accounting from §5.12 — both matter; the earlier draft wrongly
opposed them. Feed every failure back into the skills: **the skills are the product's learning
mechanism, and a failure that does not become a rule will recur.** Also here: server-container
escalation, FastAPI reconsideration (Risk 8), ManagedTables when GA, i18n.

---

## Appendix A — Verified facts

Read from the repo or the npm registry on 2026-07-30 and independently re-verified. Versions move;
re-check before implementation.

| Fact | Value | Source |
| --- | --- | --- |
| Kit package | `@tetrascience-npm/tetrascience-react-ui` | `package.json` |
| Kit version / licence | 0.7.0, Apache-2.0, 112 versions on public npm | npm registry |
| Kit published to | public npm **and** JFrog; public PROD publish is behind a manual `environment: PROD` approval | `.github/workflows/publish-*.yml` |
| Kit unpacked size | 4.45 MB, 633 files | npm registry |
| Component impl files | 125 (`ui` 59, `composed` 35, `ai` 18, `charts` 13) | `src/components/` |
| Main-entry exports | 839 `export declare`; 479 unique capitalized | `dist/index.d.ts` (stale — see Appendix B) |
| `./server` exports | `dist/server.d.ts`, 28 `export declare` — `jwtManager`, `JwtTokenManager`, `getProviderConfigurations`, `buildProvider`, `AthenaProvider`, `SnowflakeProvider`, `DatabricksProvider`, `getTdpAthenaProvider`, `TdpSearchManager`, + 3 provider subpaths | `package.json` exports map |
| `ButtonProps` | **Not exported.** `button.tsx` exports `{Button, buttonVariants}` only | `src/components/ui/button.tsx:68` |
| `data-slot` values | 350 distinct | `src/components/` |
| Story files | 109, all CSF3; **103** with `autodocs`; **103** with play functions | `src/**/*.stories.tsx` |
| a11y enforcement | `parameters.a11y.test = 'error'` — violations fail tests | `.storybook/preview.ts` |
| Storybook | 10.4.6; `@storybook/addon-mcp` **0.6.0 installed** (0.7.0 on npm); its MCP serves only under `storybook dev` | `package.json`, `node_modules` |
| Deployed catalog MCP | `https://ts-lib-ui-kit-storybook.vercel.app/api/mcp` | `README.md`, `api/mcp.ts` |
| Catalog tools | `list_components`, `get_component`, `search_components` | `api/mcp.ts` |
| argTypes catalog | `storybook-static/mcp/components.json` via `scripts/mcp/build-metadata.ts` (ts-morph). **Generator exists; file absent from the current checkout.** | repo |
| docgen catalog | `storybook-static/manifests/components.json` via addon-mcp; `meta.docgen: "react-docgen"`; **94 entries incl. 6 docs pages → ~88 components**; keys are story slugs | repo |
| `DataAppShell` exports | `DataAppShell`, `DataAppShellPrimaryNav`, `DataAppShellSecondaryNav`, `DataAppShellRightPanel`, `DataAppShellRightPanelTrigger`, `ShellCollapseButton`, `useDataAppShell` | `src/components/composed/DataAppShell/index.ts` |
| `DataAppShell` drift | Rewritten 2026-07-24 (SW-2118), **after** npm 0.7.0 (2026-06-30). `rightPanel`, `secondaryBar`, `navVariant`, `primaryNav`, `showTopBar`, `headerLeft`, `headerCenter` are in `src` but **not in the published package**. | git log, `dist/server.d.ts` vs `src/` |
| Tokens | `src/index.tailwind.css`, 840 lines; oklch; `@custom-variant dark (&:is(.dark *))` at line 18 | repo |
| Dark mode | `.dark` class on `document.documentElement` | `.storybook/preview.ts`, `src/hooks/use-is-dark.ts` |
| Charts | Plotly.js via optional peer `plotly.js-dist ^2.35.2` (~10.3 MB); lazy `loadPlotly()` | `src/components/charts/plotly-loader.ts`, npm |
| Heavy hard deps | `monaco-editor ^0.52.2` (**~94 MB unpacked**), `@monaco-editor/react ^4.7.0` | `package.json`, npm |
| Other heavy optional peer | `@rdkit/rdkit` ~13.5 MB | npm |
| AI Elements | 18 components; the §3.2 list matches `src/components/ai/` exactly | `src/components/ai/` |
| Confirmed existing kit components | `Field`, `FieldLabel`, `FieldError`, `CodeEditor`, `Banner`, `Spinner`, `ResizablePanelGroup`/`ResizablePanel`/`ResizableHandle`, `DataTable`/`TableToolbar`/`useDataTable` | `dist/index.d.ts`, `src/` |
| No app template exists | `examples/` has exactly one file (`vite-themed-app/src/useKvStore.ts`) | repo |
| `deepagents` (TS) | npm 1.12.0, MIT, published 2026-07-29; exports `.`, `./browser`, `./node` | npm |
| `deepagents` peers | `langchain ^1.5.0`, `langsmith ^0.7.1`, `@langchain/core ^1.2.0`, `@langchain/langgraph ^1.4.4`, `@langchain/langgraph-sdk ^1.9.23`, `@langchain/langgraph-checkpoint ^1.1.2` | npm |
| `@ag-ui/langgraph` | 0.0.42, MIT | npm |
| `@ag-ui/client` | 0.0.57 | npm |
| `@copilotkit/react-core` | 1.64.1, MIT | npm |
| `@webcontainer/api` | 1.6.4, MIT package licence; **commercial use needs a StackBlitz licence** | npm, webcontainers.io/enterprise |
| WebContainer private registry | Known-broken auth path | `stackblitz/webcontainer-core#1767` |
| frontend-quality skill | Exactly 16 rules; all rule numbers cited in §5.3 verified | `ts-data-app-frontend-quality/SKILL.md` |
| Template-hygiene gate location | §4 "manifest.json Sanity Check", line 114 (not §5) | `ts-data-app-product-sign-off/SKILL.md` |
| Publish command | `ts-cli publish . --type data-app --namespace <ns> --slug <slug> --version <ver> -c auth.json -f` | `ts-data-app-engineer` skill |
| Gallery name | "Data & AI Workspace" — zero occurrences of "Marketplace" in any platform skill | `ts-data-app-engineer`, `ts-data-app-product-sign-off` |

## Appendix B — Known-stale sources (do not ground the agent on these)

**The only authoritative in-repo source is `src/`.** Everything below is stale, gitignored, or both.

| Source | Problem |
| --- | --- |
| `dist/` (incl. `index.d.ts`) | **Gitignored and weeks stale.** Local build 2026-07-07; `src/` has moved since. Missing the SW-2118 `DataAppShell` API. Useful for export *counts*, not for API truth. |
| `storybook-static/` (checked out) | Stale local build; lists renamed/removed chart components (`charts-areagraph`, `bargraph`, `heatmap-deprecated`, `linegraph`, `chromatogramchart`, `scattergraph`, `dotplot`) |
| `storybook-static/mcp/components.json` | Absent from the checkout entirely; must be generated |
| `registry.json` | 5 declared file paths do not exist; declares a `recharts` dep the repo lacks |
| `DESIGN.md` §2–3 | Token values and component inventory both outdated (§4 is fine) |
| `get_started_1.md` | Describes the pre-migration atom/molecule/organism API |
| `README.md` version claim | Says v0.5.0; actual 0.7.0 |
| `catalog_keys` in `ts-data-app-engineer/references/troubleshooting.md` | Contradicts the canonical manifest example in the same skill |
| `ts-ui-kit-developer` §`ButtonProps` example | Factually wrong — the kit does not export `ButtonProps` (see OQ5). Fix the skill. |

## Appendix C — Corrections applied in rev 2

Recorded so reviewers of rev 1 do not re-raise them: story counts (103, not 101/102);
`storybook-static/mcp/components.json` absent not present; 94 catalog entries ≈ 88 components;
`dist/index.d.ts` removed from authoritative sources and added to Appendix B; `DataAppShell`'s
unreleased-props hazard added; shell subpart export names corrected; `./server` entrypoint added to
scope and catalog work; `deepagents` peer list completed (incl. `langsmith`); sign-off gate is §4 not
§5; `ButtonProps` question answered and closed; snapshot rebuild moved from tag push to npm-publish
event; monaco 94 MB / plotly 10.3 MB at pinned ranges; frontend-tool call direction corrected;
`resolve_element` payload unified; **the no-shell contradiction resolved by adopting a sandbox backend
(§3.4)**; subagent roster unified with `data-scout` added; capability set persisted on the Project;
resume and cold start share one budget; cost measurement reconciled with OQ2; JFrog vs public-npm
constraint scoped to preview-vs-build; pane count fixed at three plus overlay; skill count fixed at
four; cross-origin postMessage bridge designed; addon-mcp removed from builder-dependency risk;
phase gating aligned; exit criteria given thresholds and conditions. New sections added for TetraOS
data grounding (§5.4.2), generated-app verification (§5.10), direct edits and handoff (§5.11),
observability and cost (§5.12), concurrency locking (§5.7), app lifecycle (§5.9), template
persistence (§5.8), data governance and GxP (§6), and builder accessibility (§5.1).
