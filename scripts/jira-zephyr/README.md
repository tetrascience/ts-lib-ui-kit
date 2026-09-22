# Jira ↔ Zephyr coverage-link audit & apply

Two independent, read-mostly scripts that reconcile **which Zephyr Scale test
cases are linked to which Jira stories**, using this repository as the source of
truth for what _should_ be linked.

```
Jira + repo + Zephyr  →  audit  →  artifacts/zephyr-audit-*.json  →  human review / approval  →  apply  →  Zephyr COVERAGE links
```

- `yarn jira-zephyr:audit` is **read-only**. It never writes to Jira or Zephyr;
  its Zephyr client throws on any non-GET call.
- `yarn jira-zephyr:apply` executes **only** changes already recorded and approved
  in an audit artifact. It is a dry run unless `--execute` is passed.

> **Audit determines what should happen. Apply only executes an approved audit.**

## The mapping model this tool relies on

Found by inspecting the repo, its CI, the shared `ts-lib-zephyr-nodejs` library
and the live Jira/Zephyr configuration (September 2026). Nothing here is a new
convention — the tool only reads what already exists.

| Question                                   | Answer                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| How are Jira keys represented?             | `SW-1234` in commit subjects (`feat: SW-1234 …`, enforced by the PR-title check), in branch names (`SW-1234-…`, `feat/SW-1234-…` — visible in merge-commit subjects), and occasionally in story-source comments (`// SW-2528 — …` above an export, `Regression coverage for SW-1474` in a story's docs description).                                                                                       |
| How are Zephyr IDs represented?            | `SW-T1234` test case keys, **only** in `parameters.zephyr.testCaseId` on each CSF3 story export (`src/**/*.stories.tsx`). One ID per story; comma-separated lists are accepted. Legacy `[SW-T1,SW-T2] Story name` naming is recognised by the old scripts but no longer used.                                                                                                                              |
| Where does Jira → Zephyr live in Zephyr?   | As **COVERAGE issue links** on the test case (`GET /issuelinks/{issueKey}/testcases`, `POST /testcases/{key}/links/issues` with the numeric Jira `issueId`). Jira itself holds nothing: no remote links, no custom field, no issue-link type (verified on SW-2540).                                                                                                                                        |
| Where does Jira → Zephyr live in the repo? | Nowhere directly. The repo maps **indirectly**: Jira key → the commit(s) keyed to it → the story exports those commits introduced → their `testCaseId`s. The ID line itself is written later by the sync workflow's keyless `chore: add Zephyr test case IDs` commit (or lands inside an unrelated squash), so the reliable anchor is the **blame of the `export const … : Story` line**, not the ID line. |
| Cardinality                                | One Jira story → many stories → many Zephyr IDs (SW-2540 "Tree A" → 7 IDs). Bug fixes usually add one regression story → one ID (SW-2528). Cross-cutting tickets (SW-2305 Storybook regroup, SW-2139 a11y sweep) touch every story file without owning any story and must **not** be mapped — the blame rule handles this.                                                                                 |
| Epic membership                            | Company-managed project: children carry `parent` **and** the legacy Epic Link; `parent = SW-2301` and `"Epic Link" = SW-2301` both return the same 68 issues. The tool uses `parent in (…)`.                                                                                                                                                                                                               |
| Fix Version                                | Standard `fixVersions`, project-scoped, namespaced names such as `ts-lib-ui-kit:v1.1.0`. Resolved to the version **id** so the JQL cannot drift.                                                                                                                                                                                                                                                           |
| Existing clients                           | No Jira client existed anywhere. Zephyr HTTP normally goes through the JFrog-only `ts-lib-zephyr-nodejs`; this tool uses it when installed and otherwise a 40-line built-in fetch transport with the same semantics. The library's own `linkTestCaseToIssue` posts `issueKey` (the API requires `issueId`) and swallows errors, so it is deliberately not used for writes.                                 |

## Usage

Credentials (never logged):

| Variable                                | Purpose                                                                     |
| --------------------------------------- | --------------------------------------------------------------------------- |
| `JIRA_EMAIL`, `JIRA_API_TOKEN`          | Jira Cloud Basic auth (`ATLASSIAN_EMAIL` / `ATLASSIAN_API_TOKEN` also work) |
| `JIRA_BASE_URL`                         | Optional, default `https://tetrascience.atlassian.net`                      |
| `ZEPHYR_TOKEN` (or `ZEPHYR_API_TOKEN`)  | Zephyr Scale Cloud bearer token — same name the existing scripts use        |
| `ZEPHYR_BASE_URL`, `ZEPHYR_PROJECT_KEY` | Optional, default `https://api.zephyrscale.smartbear.com/v2` and `SW`       |

[`JIRA_API_TOKEN`](https://id.atlassian.com/manage-profile/security/api-tokens) must
belong to the `JIRA_EMAIL` account, and Atlassian offers two kinds — which one you
pick decides `JIRA_BASE_URL`:

| Token                              | Created with                   | Works against                                                                         |
| ---------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------- |
| Unscoped (**use this by default**) | _Create API token_             | The site URL — the default `https://tetrascience.atlassian.net`                       |
| Scoped                             | _Create API token with scopes_ | **Only** the gateway: set `JIRA_BASE_URL=https://api.atlassian.com/ex/jira/<cloudId>` |

A scoped token against the site URL always fails, whatever its scopes. This
tenant's cloud id is `42dbe661-2c94-4acb-ac0d-93666170efa9` (any site serves its
own at `/_edge/tenant_info`), so the scoped form is
`JIRA_BASE_URL=https://api.atlassian.com/ex/jira/42dbe661-2c94-4acb-ac0d-93666170efa9`.
Tokens also **expire** — one year by default, 365 days maximum, and every token
created before 2024-12-15 expired by May 2026 — so a token that used to work may
simply be dead.

Both scripts verify the credentials first via `/rest/api/3/myself` and fail with
the real reason. Without that check Jira Cloud is actively misleading: it answers
rejected Basic auth by downgrading the call to an _anonymous_ request rather than
returning 401, and anonymous users get `404` for every issue — so bad credentials
used to surface as `Epic SW-2301 was not found`. Verify yours with:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  "${JIRA_BASE_URL:-https://tetrascience.atlassian.net}/rest/api/3/myself"   # 200 = good
```

Run it in the **same shell** as the audit: `export`ed variables do not reach other
terminal tabs, and an empty variable makes the request anonymous — which is also a 401.

### 1. Audit (read-only)

```bash
yarn jira-zephyr:audit --epic SW-2301
yarn jira-zephyr:audit --fix-version "ts-lib-ui-kit:v1.1.0"
yarn jira-zephyr:audit SW-2540 SW-2528 SW-2445
yarn jira-zephyr:audit --jql 'project = SW AND sprint in openSprints()'
yarn jira-zephyr:audit --epic SW-2301 --epic SW-2061            # union, deduplicated
yarn jira-zephyr:audit --epic SW-2301 --fix-version "v4.7.0" --intersect
```

`--epic` with `--fix-version` is **rejected** unless `--intersect` is given;
explicit keys and `--jql` cannot be mixed with other selectors. Issue types
audited by default: Story, Task, Bug, Defect, Spike (`--issue-types` overrides);
workflow statuses audited by default: Code review, Verification, Closed
(`--statuses` overrides, `--all-statuses` disables the filter);
`--skip-story-only` additionally skips issues that changed no shipped code.
Everything else the scope returns is listed under `skipped` rather than dropped.

The audit:

1. Verifies each `--epic` really is an Epic and each `--fix-version` exists (exact name), then runs one JQL query.
2. **Freezes** the resolved issue keys into `scopeSnapshot.issueKeys` (with `resolvedJql`).
3. Indexes the repo once: every story export, its Zephyr IDs, the git history of story files, and (lazily) `git blame` per file.
4. For each issue derives evidence, fetches the live Zephyr links, checks that expected-but-missing test cases still exist in Zephyr, and classifies the ticket.
5. Writes `artifacts/zephyr-audit-<scope>.json` (gitignored — this repo is public) and prints a report like:

```
Zephyr Audit
Epic: SW-2301 ([React UI Kit v1.1.0] Upcoming Release)
Resolved JQL: parent in (SW-2301) ORDER BY key ASC
Issues resolved: 68 (47 audited, 21 skipped by issue type or status)
Statuses audited: Code review, Verification, Closed
Repo: main@13a643f

JIRA     TYPE     EXISTING  EXPECTED                       MISSING                        CONFIDENCE  ACTION
SW-2528  Task     -         SW-T5651                       SW-T5651                       exact       ADD
SW-2540  Story ·  -         SW-T5655,SW-T5656,SW-T5657,+4  SW-T5655,SW-T5656,SW-T5657,+4  exact       ADD
SW-2549  Task     -         SW-T4698,SW-T4711,SW-T4717,+3  SW-T4698,SW-T4711,SW-T4717,+3  medium      REVIEW
SW-2563  Task     -         SW-T5647,SW-T5649              SW-T5647,SW-T5649              high        ADD
SW-2573  Story ·  -         -                              -                              low         REVIEW
…
Summary
  Tickets scanned: 68
  Correct: 0
  Needs changes: 7
  Manual review: 18
  No mapping: 43
  Coverage gaps: 12 of 24 Story/Bug/Defect (·) issue(s) map to no story: SW-2573, …
```

#### Issue types, and which gaps are worth chasing

Every audited type gets a row — nothing is hidden — but only some types are
_expected_ to carry test cases. `Story`, `Bug` and `Defect`
(`COVERAGE_EXPECTED_ISSUE_TYPES` in [`shared/issue-types.ts`](./shared/issue-types.ts))
are marked `·` in the `TYPE` column, and only those count toward the
**Coverage gaps** line. A `Task` or `Spike` with no mapping is routine here —
tooling, docs and refactors ship no test case of their own — and burying a dozen
real gaps among forty of those is how the number stops being read.

This classification **only** affects counting and grouping. It never changes what
the audit recommends or what apply writes: a `Task` that does own stories still
shows its IDs, still gets `ADD`, and is still applied. That matters here, because
plenty of them do — `SW-2528`, `SW-2549` and `SW-2563` above are all Tasks that
introduced stories. Which types are audited **at all** is the separate
`--issue-types` flag.

#### Workflow status, and why the filter is by name

Only issues that have reached **code review** are audited; `Open` and
`In Progress` are recorded under `skipped` with their status and the reason. A
ticket still in flight has no settled coverage — its stories may not be written
and the sync workflow may not have generated its Zephyr IDs yet — so counting it
as a coverage gap reports normal work-in-progress as a problem. Override with
`--statuses "Code review,Verification,Closed,Done"`, or audit everything with
`--all-statuses`.

The filter matches **status names**, not Jira status categories, and that is
forced rather than chosen. Jira sorts every status into one of three categories,
which in the SW workflow fall out like this:

| Category    | Statuses                               |
| ----------- | -------------------------------------- |
| To Do       | Open                                   |
| In Progress | In Progress, Code review, Verification |
| Done        | Closed                                 |

The cutoff we want falls _inside_ the In Progress category, so no category
predicate can express it: `category = Done` drops Code review and Verification,
and anything wider lets plain In Progress back in. Names have the resolution the
categories lack.

What names cost is rename-safety — a renamed status would simply stop matching
and quietly shrink the audited set. The audit buys that back explicitly: before
partitioning, it reads the project's real statuses
(`GET /rest/api/3/project/{key}/statuses`) and fails if a configured name is not
among them, listing what does exist:

```
[ERROR] Status "Code review" does not exist in project SW — it was probably
renamed, which would otherwise silently shrink the audited set.

  Valid statuses:
    Open (To Do)
    In Progress (In Progress)
    In Review (In Progress)
    Verification (In Progress)
    Closed (Done)

  Pass --statuses to override the audited set, or --all-statuses to audit every status.
```

If that endpoint is not readable (a 403/404 on the project's workflow scheme),
validation no-ops rather than failing the run closed.

#### Pull-request evidence (on by default)

The repo scanner reads `git log` from **HEAD**, so it can only see a ticket whose
commits are ancestors of the current checkout. That misses a real case: a PR
squash-merged into a **feature branch that was later deleted**. Its commit is
then unreachable from every local ref, and the audit — finding no git evidence —
falls through to name similarity.

`SW-2578` is the worked example, and it produced a wrong answer. PR #204 merged
into `SW-2410-app-shell-simple-prototype`, since deleted. With no git evidence,
the summary _"Align **icons** on the side nav"_ matched `ui/icons.stories.tsx`
by name — the wrong component. The PR had actually changed `DataAppShell.tsx`,
`PrimaryNav.tsx` and `AppShellSimple.tsx`.

So when git yields nothing at medium confidence or better, the audit asks GitHub
(via the `gh` CLI) which PRs name the key, maps each **changed source file to the
story file beside it**, and takes those stories' Zephyr IDs:

```
SW-2578  Story ·  -  SW-T5532,SW-T5533,SW-T5534,+8  medium  REVIEW

  pr-changed-file (medium)
    PR #204 (fix: SW-2578 align side-nav icons to a shared gutter) changed
    DataAppShell.tsx; its sibling DataAppShell.stories.tsx owns
    SW-T5532, SW-T5533, SW-T5534, SW-T5535
```

Design points, each load-bearing:

- **Sibling matching, never name similarity.** A changed `Foo.tsx` maps to
  `Foo.stories.tsx` in the same directory. Where there is no same-named sibling
  (`PrimaryNav.tsx`), it falls back to the story named for the **component
  directory** — and only there. A flat directory of unrelated components like
  `ui/` gets no fallback, or `button.tsx` would drag in every story beside it,
  reproducing the very over-reach that made the icons match wrong.
- **Medium confidence.** It shows as EXPECTED and is reviewed, but never
  auto-applies at the default `--min-confidence high`. "This PR changed the
  component, so these are its test cases" is a sound inference, still an
  inference.
- **PR evidence outranks similarity.** Once a PR is found, the name-similarity
  fallback is suppressed entirely — that is what removes the wrong `icons` row
  rather than merely ranking it lower.
- **Sweeps are downgraded.** A PR spanning more than `sweepFileThreshold` (5)
  story files is a lint pass or repo-wide refactor, not those stories' origin.
  `SW-2305`'s PR changed 135 files and would otherwise claim ~400 test cases; it
  is reported at low confidence, which keeps it out of `expectedZephyrIds`. This
  mirrors `downgradeSweeps` for commits. The threshold counts **story** files,
  not changed files — `SW-2591` touched 17 files but only 9 stories and stays
  medium.
- **Git wins when it has something.** GitHub is consulted only when git found
  nothing at medium or better, so the network cost is paid per unmapped key.
- **Never fatal.** No `gh`, no auth, or a network failure degrades to git-only
  evidence with an `[INFO]` line. `--no-pr-evidence` disables it outright.

#### Existing COVERAGE links as corroboration

Other repos in the org link at **provisioning** time, not retroactively:
`ts-lib-zephyr-nodejs` takes a single `jiraTicket` for a whole run and links
every test case it creates to it (`provisioner.ts`, `storybook.ts`). Those links
are deliberate statements of intent, and nothing in the repository records them —
git and PR evidence cannot see them at all.

So when Zephyr already links an ID to the issue _and_ the repository
independently attributes that ID to the same issue, the audit records an
`existing-coverage-link` evidence row at medium confidence: two independent
mechanisms agreeing.

**It only ever promotes evidence the repository already found.** Three rules keep
this from becoming circular — `existingZephyrIds` comes from Zephyr, so if a link
could _create_ expectation, every link would justify its own existence and the
audit could never report a wrong one:

| Repo says                   | Zephyr says | Result                                                                           |
| --------------------------- | ----------- | -------------------------------------------------------------------------------- |
| attributes ID to this issue | linked here | corroborated, medium floor                                                       |
| attributes ID **elsewhere** | linked here | still `unexpectedZephyrIds` — a stale `jiraTicket` is exactly the error to catch |
| knows nothing about the ID  | linked here | stays `unmanagedZephyrIds`, no evidence row created                              |

#### Story-only issues (`--skip-story-only`, opt-in)

`--skip-story-only` skips any issue whose keyed commits touched **only**
`*.stories.tsx` files, on the reasoning that such a ticket changed no shipped
code and so needs no review. Skipped issues appear under `skipped` with the file
count, exactly like a status skip.

**Read the trade-off before turning this on.** Stories are the only thing this
tool derives Zephyr IDs from, so a story-only ticket is usually _pure test
coverage work_ — often the best-attributed row in the report. On `SW-2301` the
flag skips `SW-2305` (76 story files, the most-covered ticket in the epic) and
`SW-2465`. It is therefore **off by default**, and it never changes the
**Coverage gaps** count: a gap is a ticket with no stories at all, so a ticket
skipped for having only stories was never a gap.

An issue with **no keyed commits** is never skipped by this flag. An empty
history means "cannot tell", not "changed nothing" — skipping there would hide
precisely the unmapped tickets the audit exists to surface.

The file list comes from one repo-wide `git log --name-only` bucketed by the
Jira keys in each commit subject, computed lazily so runs without the flag do
not pay for it.

#### Issue type review (advisory)

The audit also reports where the Jira **issue type** disagrees with the
repository, in both directions:

| Signal                   | Raised when                                                              | Suggests                         |
| ------------------------ | ------------------------------------------------------------------------ | -------------------------------- |
| `retype-to-story-or-bug` | A `Task`/`Spike` the repository **does** attribute test cases to         | Re-type to Story/Bug             |
| `missing-coverage`       | A `Story`/`Bug`/`Defect` the repository maps to **nothing** (no-mapping) | Add coverage, or re-type to Task |

It earns its place: across this repo's whole history, 16 of the 43 issues that
introduced a story carrying a Zephyr ID are typed `Task`, and most are plainly
feature work (`Add PageHeader component`, `Add Text typography primitive`) or a
bug fix (`pad content placed directly in DialogContent`). Those own only 70 of
611 test cases, so the type is wrong far more often than the convention is.

It appears as its own `Issue type review` section in both reports, as
`typeReview: { signal, detail }` on the entry, and as a note. It is **advisory**:
the tool never edits Jira, the apply script never reads it, and a flagged `Task`
is still recommended and still applied exactly as before. Cross-cutting tickets
can pick up story attribution they don't deserve, so confirm before re-typing.

### 2. Review and approve

Every entry starts with `"approved": false`. Either edit the JSON (optionally
adding `"reviewNote"`), or:

```bash
yarn jira-zephyr:approve artifacts/zephyr-audit-epic-SW-2301.json SW-2540 SW-2528 --note "QE reviewed 2026-09-10"
yarn jira-zephyr:approve artifacts/zephyr-audit-epic-SW-2301.json --recommended   # every entry the audit recommends ADD
```

The helper refuses to approve entries with nothing to add or with `low`
confidence. `--recommended` selects every entry the audit itself recommends
`add` — confidence ≥ high, nothing unexpected, every test case exists — which is what the GitHub workflow's `approve: recommended` input uses. `--exclusive` makes the selection the complete set of approvals — every other entry is reset to `approved: false` — so re-approving an artifact that already carries approvals cannot drag stale ones along; the workflow always passes it.

### 3. Apply (dry run by default)

```bash
yarn jira-zephyr:apply artifacts/zephyr-audit-epic-SW-2301.json              # dry run: re-checks live state, writes nothing
yarn jira-zephyr:apply artifacts/zephyr-audit-epic-SW-2301.json --execute    # creates the approved links
yarn jira-zephyr:apply … --min-confidence medium --only SW-2540              # widen threshold / restrict to a subset
```

For every key in the **frozen** `scopeSnapshot.issueKeys` (never the live Epic /
Fix Version — an issue added to the epic after the audit is ignored until the
next audit) the apply script:

1. Refuses to start unless the live Jira site, Zephyr API URL and Zephyr project match the ones the audit recorded (`JIRA_BASE_URL` / `ZEPHYR_BASE_URL` / `ZEPHYR_PROJECT_KEY`), and — when `--expect-origin-run <id>` is given — unless the artifact was produced by that GitHub Actions run. Then checks `approved` and the confidence threshold (default `high`; `low` is never applied, whatever the flag).
2. Re-fetches the Jira issue and requires the same numeric issue id.
3. Re-fetches the live Zephyr links and compares them with `existingZephyrIdsAtAudit`.
4. Adds only the still-missing `missingZephyrIds`, skipping duplicates. It never removes links and never invents new mappings.
5. Writes `<audit>.apply-<timestamp>.json` with one outcome per issue.

| Outcome                                                                 | Meaning                                                                                              |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `applied` / `would-apply`                                               | Links created (execute) / would be created (dry run)                                                 |
| `already-correct`                                                       | Everything expected is already linked — someone applied it first; nothing written                    |
| `stale`                                                                 | Links were removed or added by someone else since the audit, or the Jira issue id changed → re-audit |
| `manual-review`                                                         | Issue vanished, or a test case to link no longer exists in Zephyr                                    |
| `skipped-not-approved`, `skipped-below-threshold`, `skipped-no-changes` | Gated out before any network call                                                                    |
| `error`                                                                 | An API call failed; partial progress is recorded in `added`                                          |

### 4. Report (Markdown, no credentials)

```bash
yarn jira-zephyr:report artifacts/zephyr-audit-epic-SW-2301.json                                   # Markdown to stdout
yarn jira-zephyr:report <audit.json> --apply <audit>.apply-<timestamp>.json --out report.md          # with the apply result
```

Renders the audit — and the apply result written against it — as GitHub-flavoured
Markdown: the GitHub Actions job summary below, or something to paste into a PR.
Jira ticket titles are omitted unless `--with-summaries` is passed;
`--redacted-copy <file>` writes a copy of the audit with titles blanked that is
still a valid input for the apply script.

## Cap'n Bugsby, the Jira coverage bot

Posts the audit's suggestions as a Jira comment and applies them when someone
replies. Same evidence, same safety rails as the CLI — it is a _front end_ to
`runApply`, not a second way to write links.

```bash
yarn jira-zephyr:bot notify  artifacts/zephyr-audit-epic-SW-2301.json            # dry run: prints each comment
yarn jira-zephyr:bot notify  artifacts/zephyr-audit-epic-SW-2301.json --execute  # posts them
yarn jira-zephyr:bot respond artifacts/zephyr-audit-epic-SW-2301.json --execute  # reads replies, links, answers
```

What lands on the ticket:

```
🏴‍☠️ Cap'n Bugsby here. Sailed the whole commit history so you don't have to —
SW-2443 looks to be missing 6 test case links.

I charted these from the files the PR touched. Reasonable, but it isn't proof —
give them a look.

All of these: PR #209 changed code beside button.stories.tsx.

|| Test case  || Title                                  ||
| 🟡 SW-T1202 | Dialog traps focus while open           |
| 🟡 SW-T1203 | Escape closes the dialog                |
…

🟡 fairly sure

Reply `@bugsby apply` and I'll link all 6. Reply `@bugsby apply SW-T123 SW-T456`
to take only some. If I've steered you wrong, ignore this — no hard feelings.
```

### Shape: a service, not a script

This is built for the Forge app it will become. All behaviour lives in
[`bot/service.ts`](./bot/service.ts), which takes **injected clients** and
returns plain data — it never reads `process.argv`, prints, or touches disk.
[`bot.ts`](../bot.ts) is argument parsing and printing over the top, and a Forge
function or hosted API is simply a second caller. The renderer
([`bot/comment.ts`](./bot/comment.ts)) is a pure `(entry, titles) → string`, so a
UI can render the same suggestions without the comment path at all.

| Module                           | Role                                                                                               |
| -------------------------------- | -------------------------------------------------------------------------------------------------- |
| `bot/persona.ts`                 | Bugsby's voice and the confidence markers. No Jira/Zephyr types — tone changes touch nothing else. |
| `bot/comment.ts`                 | Pure renderer: evidence → wiki-markup table.                                                       |
| `bot/reply.ts`                   | Parses `@bugsby apply …`. The trust boundary.                                                      |
| `bot/service.ts`                 | `notify` / `respond`, transport-free. **The future API surface.**                                  |
| `clients/jira-comment-client.ts` | The only module in this toolchain that writes to Jira.                                             |

### Safety

- **Dry run by default.** Both verbs need `--execute`; without it the Jira
  comment client is constructed read-only, so a write throws rather than slips
  through.
- **A reply cannot author links.** Explicit ids in a reply are a _filter_ over
  what Bugsby already suggested; anything else is rejected and reported. The
  reply chooses among suggestions, it does not invent them.
- **Applying goes through `runApply`.** Approval gate, `--min-confidence`, frozen
  scope and stale-state refusal all apply identically. There is no direct Zephyr
  write in the bot.
- **The mention must open the comment.** "I think @bugsby apply is wrong here" is
  not a command. Anyone who can comment can trigger a write, so the parser is
  strict on purpose.
- **Idempotent.** `notify` skips issues it has already commented on (`--force`
  overrides); `respond` records which comment id it answered and never answers
  twice. Re-running on a cron is the expected mode.
- **`JiraClient` stays read-only.** Comment writes live in a separate client so
  "read-only by construction" remains true of the one every other module imports.

### Not yet done

The Forge app itself — a real **Apply button** needs a Forge UI, which cannot run
`git`/`gh` and so must call a hosted evidence API. `bot/service.ts` is the piece
that moves to that repo unchanged; the reply path is the interim trigger.

## Running it from GitHub Actions (no personal Zephyr token needed)

[`.github/workflows/zephyr-coverage-audit.yml`](../../.github/workflows/zephyr-coverage-audit.yml)
runs the same scripts with the repository's `ZEPHYR_TOKEN` secret. Actions →
**Jira ↔ Zephyr coverage audit** → _Run workflow_:

| Input            | Meaning                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `mode`           | `audit` (report only) · `dry-run` (approve + re-check live state, write nothing) · `write` (create the approved links)  |
| `scope_type`     | `epic` · `fix-version` · `keys` · `jql`                                                                                 |
| `scope`          | Epic key(s), Fix Version name(s), issue keys (comma or space separated) or raw JQL. Ignored when `audit_run_id` is set. |
| `audit_run_id`   | dry-run / write only: apply the frozen audit uploaded by that earlier run instead of auditing again                     |
| `approve`        | dry-run / write only: `recommended` (default — every ticket the audit recommends ADD) or a list of issue keys           |
| `min_confidence` | dry-run / write only: `high` (default), `exact` or `medium`; `low` is never applied                                     |

The reviewable path is two runs. Run `audit` first: the job summary is the
report, and the frozen audit is uploaded as the `zephyr-audit` artifact (kept
30 days). Then run `write` with that run's id as `audit_run_id`: it applies
exactly the frozen issue keys after the usual live re-check, and issues added to
the Epic / Fix Version in between are never touched. A one-shot `write` without
`audit_run_id` audits and applies in the same run — convenient for an Epic you
have just looked at, but nobody reviews the artifact between the two steps, so
prefer the two-run path for anything broad. Nothing is ever approved in `audit`
mode, `approve: recommended` never touches medium- or low-confidence entries,
and the apply step still refuses `stale` entries.

Secrets: `ZEPHYR_TOKEN` (already configured), plus `JIRA_EMAIL` and
`JIRA_API_TOKEN`. The run fails fast, pointing at _Settings → Secrets and
variables → Actions_, when one is missing.

**Prefer a dedicated read-only service account for the repository secret.** An
unscoped personal token is a full-account Atlassian credential, and because
`scope_type: jql` accepts an arbitrary query, anyone who can dispatch this
workflow can read anything that account can see. The audit never writes to Jira,
so a service account with read-only Jira scopes is enough. Service-account tokens
are always scoped, so set `JIRA_BASE_URL` to the gateway form above. Keep the
unscoped personal token for local runs, where it only ever sees your own access.

Three more rails:

- The first step compares the **full** `github.ref` against `refs/heads/<default branch>`, so the secrets only ever meet workflow and script code that went through PR review. It deliberately does not use `github.ref_name`, which is `main` for a _tag_ named `main` as well as for the branch. Test workflow changes by merging them.
- Approvals are always applied with `--exclusive`, so a frozen audit downloaded from an earlier dry-run or write run cannot carry that run's approvals into this one.
- The audit records the run that produced it (`origin.runId`), and the apply step passes `--expect-origin-run`, so a mistyped `audit_run_id` fails loudly instead of silently applying a different audit's recommendations. The frozen issue keys are also printed before any write.

**Public repository caveat.** Job summaries, logs and uploaded artifacts are
world-readable. The workflow therefore never prints Jira ticket titles: the
summary shows keys, Zephyr IDs, confidence, actions and outcomes (all already
public via commit subjects and story files), the terminal report is kept out of
the log, and the uploaded audit is the `--redacted-copy` described above. For `--jql` scopes the summary names only the scope type, because raw JQL can quote Jira text. To read a report with titles, run the audit locally.

## Evidence and confidence

Evidence is derived in this order and every recommendation carries it:

| Evidence type                | Confidence                                           | Meaning                                                                                                          |
| ---------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `story-reference`            | exact                                                | The Jira key is written in the story's own source (leading comment, JSDoc, docs description).                    |
| `story-introduced-by-commit` | exact if the same commit created the file, else high | `git blame` of the `export const …` line is a commit keyed to the issue.                                         |
| `story-modified-by-commit`   | medium                                               | A keyed commit last changed lines inside a pre-existing story (the auto-generated `testCaseId` line is ignored). |
| `file-reference`             | medium (single-story file) / low                     | The key appears in the file outside any story.                                                                   |
| `file-touched-by-commit`     | low, no IDs                                          | A keyed commit touched the file but none of its story lines survive — informational only.                        |
| `summary-similarity`         | low                                                  | The Jira summary names the component (fallback; ≤ 3 files or it is dropped as too generic).                      |
| `zephyr-attribution`         | —                                                    | Explains an _unexpected_ link: which story owns that ID and which ticket the repo attributes it to.              |

Two different medium signals for the same ID promote it to high. Two guards keep
cross-cutting tickets from claiming every story they brushed against: lines the
sync workflow writes (`parameters: { zephyr: { testCaseId } }`) and bare
punctuation never count as edits, and a commit whose story-level evidence spans
more than five files is treated as a sweep (introduced → medium, modified → low)
— so a docs pass or an a11y sweep surfaces for review instead of as 50 expected
IDs. Similarity runs only when no medium-or-better evidence exists at all.
`expectedZephyrIds` contains only IDs backed by **medium or better** evidence;
low-confidence candidates appear in `evidence` and `notes` only. A ticket's
confidence is the weakest among its missing IDs. Recommended actions:

- `add` — missing IDs, confidence ≥ high, nothing unexpected, all test cases exist.
- `none` — Zephyr already links exactly the expected IDs (`status: correct`).
- `review` — anything else: medium/low evidence, unexpected links, vanished test cases, or `no-mapping`.

Zephyr links the repo knows nothing about (e.g. manual test cases) are listed as
`unmanagedZephyrIds` and never count against a ticket; links the repo attributes
to a **different** ticket are `unexpectedZephyrIds` and force review — this tool
never removes a link.

## Artifact schema

Defined with zod in [`shared/audit-schema.ts`](./shared/audit-schema.ts)
(`schemaVersion: 1`); the apply script validates the file, its internal
consistency (tickets ⊆ snapshot, missing ⊆ expected, …) and refuses anything
else. Key fields per ticket: `jira`, `jiraIssueId`, `existingZephyrIdsAtAudit`,
`expectedZephyrIds`, `missingZephyrIds`, `unexpectedZephyrIds`,
`unmanagedZephyrIds`, `confidence`, `recommendedAction`, `status`, `approved`,
`evidence[]`, `notes[]`. The artifact also records `scope`, `scopeSnapshot`,
`skipped`, and the repo `head`/`branch`/`dirty` state the evidence was derived from.

## Layout

```
scripts/jira-zephyr/
├── audit/      audit.ts (CLI) · scope.ts · repo-scanner.ts · mapper.ts · reporter.ts
├── apply/      apply.ts (CLI) · validator.ts · writer.ts
├── approve.ts  optional approval helper (--recommended is what the workflow uses)
├── report.ts   Markdown / job-summary renderer + redacted upload copy
├── clients/    jira-client.ts · zephyr-client.ts · env.ts
├── shared/     audit-schema.ts (zod) · confidence.ts · keys.ts · markdown.ts · redact.ts · table.ts · types.ts
└── __tests__/  vitest unit + git-integration tests (run with `yarn test`)
```

`yarn typecheck:scripts` type-checks all of `scripts/` through `scripts/tsconfig.json` (the root `tsconfig.json` covers `src/` only). `yarn test` runs the tests; the scanner test builds a real
temporary git repository.

## Known limits

- Stories whose export line was rewritten by a later ticket blame to that ticket; the original ticket then only gets `story-modified-by-commit`/`file-touched` evidence.
- ~50 % of commits carry no Jira key (chores, e2e work, sync commits); stories introduced by those have no attribution and surface as `no-mapping` or low-confidence candidates.
- The audit needs both Jira and Zephyr credentials; there is deliberately no offline mode, so an artifact always reflects real Zephyr state.
- Only Zephyr COVERAGE links are managed. Removing links, editing test cases and Jira fields are out of scope by design.
