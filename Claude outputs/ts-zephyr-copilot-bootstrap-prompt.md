# Bootstrap prompt — `ts-zephyr-copilot`

> **How to use this:** create the empty repo, clone it, and paste everything below
> the line into Claude Code from inside that clone. Have the source repo
> (`ts-lib-ui-kit`) checked out nearby — the prompt tells the agent to copy from
> it and gives the path.

---

You are bootstrapping a new repository, `ts-zephyr-copilot`, at TetraScience.

It takes a mature CLI toolchain that currently lives inside another repo's
`scripts/` folder and turns it into a standalone service: an evidence engine, a
REST API, and a web UI for running audits, reviewing them, and applying Zephyr
coverage links. A Jira (Forge) app comes later and is **out of scope for this
build** — but the architecture must not foreclose it.

## Source material

The existing tool is at:

```
/Users/oseer/Development/git/ts-lib-ui-kit/scripts/jira-zephyr/
```

~5,200 lines of TypeScript across 30 source files plus 14 test files (187
passing tests). **Read it before planning.** Start with its `README.md` (564
lines) — it documents the mapping model, the evidence/confidence rules, and the
reasoning behind several non-obvious decisions. Then read `shared/audit-schema.ts`
(the zod artifact schema, the contract everything shares), `audit/mapper.ts` (the
evidence engine), and `apply/writer.ts` (the write path and its safety rails).

Also read `.github/workflows/zephyr-coverage-audit.yml` in that repo — the
existing dispatch workflow, which shows how the tool runs in CI today.

## What the tool does

Reconciles which Zephyr Scale test cases are linked (via COVERAGE links, stored
in Zephyr, not Jira) to which Jira issues, using a git repository as the source
of truth:

```
Jira key → keyed commits → the story exports they introduced
         → those stories' Zephyr IDs → compare with live Zephyr links
```

Three CLI entry points today: `audit` (read-only, writes a JSON artifact),
`approve` (marks entries in that artifact), `apply` (writes the approved links to
Zephyr). Plus `bot` — posts suggestions as a Jira comment as **Cap'n Bugsby**, a
faintly piratical character, and applies them when someone replies
`@bugsby apply`.

## Target architecture

```
┌─ Web UI ─────────── run audits · review evidence · approve · apply
│
├─ API (REST, typed) ─ POST /audits · GET /audits/:id · POST /audits/:id/apply
│         │
│         └─ worker ── git clone/fetch · git log · git blame · gh pr list
│                      (needs a real filesystem — see the constraint below)
│
├─ Persistence ─────── audit artifacts + approval state
│
└─ Integrations ────── Jira (read + comment) · Zephyr Scale (read + link) · GitHub
```

**The load-bearing constraint:** the evidence engine shells out to `git` and the
`gh` CLI against a real checkout on disk. It cannot run on Forge, and it cannot
run on a filesystem-less serverless platform. Deploy the API+worker somewhere
with a filesystem and a persistent work directory (Fly.io, Render, ECS —
whatever matches TetraScience's norms; ask rather than assume). A future Forge
app calls this API; it never runs git itself.

## Phasing

Build **phase 1** now. Phases 2 and 3 are stated so phase 1 doesn't design them
out — do not build them.

- **Phase 1 (this build):** port the engine unchanged; wrap it in a typed API;
  ship a minimal but genuinely usable UI for audit → review → apply. Keep the
  CLI working.
- **Phase 2 (later):** Forge app with a real Apply button in the Jira issue view,
  calling this API.
- **Phase 3 (later):** scheduled bot runs, multi-repo support at scale, dashboards.

## Non-negotiable invariants

These come from real incidents and review findings in the source repo. Preserve
every one; each has a comment or test explaining it there.

1. **The artifact is the contract.** `shared/audit-schema.ts` defines it in zod.
   `scopeSnapshot.issueKeys` is a *frozen* set — apply may never touch an issue
   outside it. Schema is versioned (`AUDIT_SCHEMA_VERSION`); changing it needs a
   version bump and a migration path.
2. **Audit is strictly read-only.** Its Zephyr client is constructed read-only
   and throws on any non-GET. Keep that guarantee structural, not conventional.
3. **`JiraClient` is read-only by construction.** Comment writes live in a
   *separate* `JiraCommentClient`. Do not merge them — several call sites depend
   on being able to tell, from the import alone, whether a module can write.
4. **Dry-run is the default everywhere.** Writing requires an explicit
   `--execute` / equivalent API flag.
5. **Stale state refuses.** Before writing, re-fetch the Jira issue (same numeric
   id?) and the live Zephyr links; refuse anything that moved since the audit.
6. **Low confidence never auto-applies.** The ladder is `exact > high > medium >
   low`; default apply threshold is `high`.
7. **A reply cannot author links.** In the bot, explicit IDs in a reply are a
   *filter* over what was already suggested — never a way to attach an arbitrary
   test case. Anyone who can comment on a Jira issue can trigger this path, so it
   is a trust boundary.
8. **An existing COVERAGE link can never justify itself.** It corroborates
   repo-derived evidence (promoting it to medium) but cannot *create* expectation
   — otherwise every link would be self-confirming and a wrong one could never be
   reported. There are tests for this; keep them.
9. **Sweeps are downgraded.** A commit or PR spanning more than ~5 story files is
   a cross-cutting sweep, not those stories' origin. One real PR touched 135
   files and would otherwise have claimed ~400 test cases.
10. **Never invent or copy Zephyr test case IDs.** They are minted by the sync
    workflow, never by hand.
11. **Artifacts carry Jira summaries.** The source repo is public and gitignores
    them. Whatever persistence you choose, treat artifact contents as internal —
    and never log Jira titles into anything world-readable.
12. **Bot tone is data, not logic.** `bot/persona.ts` holds every user-facing
    string and no Jira/Zephyr types. No test asserts Bugsby's exact wording, so
    tone can be edited in one file without breaking anything. Keep it that way.

## Porting notes

- **Copy the engine as-is first, then refactor.** `audit/`, `apply/`, `bot/`,
  `clients/`, `shared/` and all 14 test files should land and pass before
  anything is redesigned. 187 tests passing is your regression net — get them
  green in the new repo before you touch behaviour.
- **Dependencies are light:** `zod`, `ts-morph`, plus node builtins. Everything
  else is dev tooling (tsx, vitest, typescript). No heavy runtime to port.
- **`repo-scanner.ts` assumes `cwd` + `srcDir` ("src")** and scans
  `**/*.stories.tsx`. For multi-repo support these must become per-repo config,
  not constants. Design the config shape now even if only one repo is wired up.
- **`bot/service.ts` is already transport-free** — it takes injected clients and
  returns plain data, with no `process.argv`, printing or disk access. It was
  written this way specifically so an API or Forge function could call it. Use it
  as the service layer rather than reimplementing.
- **`bot/comment.ts` is a pure `(entry, titles) → string`.** The UI can render
  suggestions from the same data without going near the comment path.
- **Keep the CLI.** It is how the tool is operated today and how you will debug
  the service. The API should call the same functions the CLI calls.

## API sketch

Design properly, but roughly:

```
POST   /audits                 { repo, scope: {epic|fixVersion|keys|jql}, options }  → audit id
GET    /audits/:id             → artifact + status
GET    /audits/:id/report      → rendered report (markdown/terminal)
POST   /audits/:id/approvals   { jiraKeys[] | "recommended" }
POST   /audits/:id/apply       { execute: bool, minConfidence }  → per-ticket outcomes
POST   /audits/:id/notify      { execute: bool }                 → Bugsby comments
```

Audits are long-running (clone + scan + per-issue Zephyr calls), so make them
asynchronous with a status the UI can poll. Dry-run apply must be a first-class
response, not a side effect.

## UI scope (keep it minimal)

Three screens, no more:

1. **Start an audit** — pick repo + scope (epic / fix version / issue keys /
   JQL), options (statuses, issue types, PR evidence on/off).
2. **Review** — the ticket table (Jira · type · existing · expected · missing ·
   confidence · action), expandable per-ticket evidence with the *reasons*, not
   just IDs. Approve individually or in bulk.
3. **Apply** — dry-run preview first, then execute, then per-ticket outcomes.

Use `@tetrascience-npm/tetrascience-react-ui` for components. Data-dense, not
marketing — this is an internal tool for people reconciling hundreds of rows.

## Conventions to follow

- Yarn 4, Node >=20, TypeScript strict, no `any`, no `eslint-disable`
- Branches `<JIRA>-<description>`; PR titles `type: SW-1234 Description`
- Conventional Commits
- Comments explain *why*, not *what* — match the source repo's density, which is
  high in the load-bearing places and absent elsewhere
- Tests: Vitest. Port the existing suite; add tests for new API/UI surface

## Before you write code

1. Read the source README and the four core files named above.
2. Ask about anything genuinely ambiguous — particularly: deployment target,
   persistence choice (Postgres vs. object store + index), auth (the QE dashboard
   at `ts-qe-dashboard` uses JumpCloud SSO; look at how, and match it), and
   whether the service is single- or multi-tenant across Jira projects.
3. Propose a repo layout and a phase-1 plan. Get agreement before building.

Do not begin the port until you have read the source and the plan is agreed.

## Known open items inherited from the source

- The audit artifact for epic SW-2301 in the source repo is **stale** — generated
  before PR-evidence and status-filter work landed. Regenerate rather than trust it.
- A patch exists for `ts-qe-dashboard` making its test-landscape classifier read
  Zephyr **labels** (not just folder names), because ~3,700 UI-kit test cases are
  labelled `automated` yet classify as `unclassified`. Unrelated to this port,
  but the same person will care.
- No Zephyr seat is available locally for most engineers here; the source repo
  runs Zephyr operations through a GitHub Actions workflow holding the org token.
  The new service needs its own service-account token story — resolve this early,
  it affects local development.
