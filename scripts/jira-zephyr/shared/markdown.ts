/**
 * GitHub-flavoured Markdown for the audit and apply artifacts — the job-summary
 * view when the scripts run in GitHub Actions
 * (.github/workflows/zephyr-coverage-audit.yml); also pasteable into a PR.
 *
 * This repository is PUBLIC, so a workflow run's logs, job summary and uploaded
 * artifacts are world-readable. These renderers print only what the repository
 * already publishes — Jira keys (commit subjects), Zephyr test case keys (story
 * parameters), confidence, actions, outcomes — and never Jira ticket titles
 * unless `includeSummaries` is switched on deliberately (private consumers).
 */
import { SCOPE_TYPE_LABELS } from "./audit-schema";
import {
  COVERAGE_EXPECTED_LABEL,
  coverageGaps,
  expectsCoverage,
  TYPE_SIGNAL_ACTIONS,
  typeReviews,
} from "./issue-types";
import { compareIssueKeys } from "./keys";

import type { ApplyArtifact, ApplyOutcome, AuditArtifact, AuditEntry } from "./types";

export interface MarkdownOptions {
  /** Print Jira ticket titles. Off by default — see the module comment. */
  includeSummaries?: boolean;
  /** GitHub Actions run id that uploaded this audit; enables the workflow-specific next steps. */
  runId?: string;
}

const NEEDS_ATTENTION: ReadonlySet<ApplyOutcome> = new Set<ApplyOutcome>(["stale", "manual-review", "error"]);

/** Makes arbitrary text safe inside a GFM table cell (pipes, line breaks). */
export function escapeCell(text: string): string {
  // Backslashes first, or an input backslash before a pipe would neutralise the pipe escape.
  return text.replace(/\r?\n/g, " ").replace(/\\/g, "\\\\").replace(/\|/g, "\\|").trim();
}

function code(text: string): string {
  return `\`${text.replace(/`/g, "'")}\``;
}

function table(headers: readonly string[], rows: ReadonlyArray<readonly string[]>): string {
  const line = (cells: readonly string[]) => `| ${cells.join(" | ")} |`;
  return [line(headers), line(headers.map(() => "---")), ...rows.map(line)].join("\n");
}

function idList(ids: readonly string[]): string {
  return ids.length === 0 ? "-" : ids.join(", ");
}

function jiraLink(baseUrl: string | undefined, key: string): string {
  return baseUrl ? `[${key}](${baseUrl}/browse/${key})` : key;
}

function byKey(a: { jira: string }, b: { jira: string }): number {
  return compareIssueKeys(a.jira, b.jira);
}

function keyLinks(baseUrl: string, entries: readonly AuditEntry[]): string {
  return [...entries]
    .sort(byKey)
    .map((entry) => `${jiraLink(baseUrl, entry.jira)} (${entry.issueType})`)
    .join(", ");
}

function details(summary: string, body: string): string {
  return `<details>\n<summary>${summary}</summary>\n\n${body}\n\n</details>`;
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function renderAuditMarkdown(artifact: AuditArtifact, options: MarkdownOptions = {}): string {
  const { scope, summary, jira, repo } = artifact;
  // Raw JQL is user-written and may quote Jira text, so a JQL scope shows only its type here;
  // the JQL derived for the other scope types contains nothing but keys and version ids.
  const isRawJql = scope.type === "jql";
  const scopeValues = isRawJql ? "(raw JQL — see the audit artifact)" : scope.values.map(code).join(", ");
  const lines: string[] = [`## Zephyr coverage audit — ${SCOPE_TYPE_LABELS[scope.type]}: ${scopeValues}`, ""];
  if (scope.resolvedJql && !isRawJql) lines.push(`- **Resolved JQL:** ${code(scope.resolvedJql)}`);
  lines.push(
    `- **Issues:** ${artifact.scopeSnapshot.issueKeys.length} audited · ${artifact.skipped.length} skipped by issue type or status (audited types: ${scope.issueTypes.join(", ")})`,
    ...(scope.statuses ? [`- **Statuses audited:** ${scope.statuses.join(", ")}`] : []),
    ...(scope.skipStoryOnly ? ["- **Story-only issues:** skipped (`--skip-story-only`)"] : []),
    `- **Repository:** ${code(repo.branch)} @ ${code(repo.head.slice(0, 7))}${repo.dirty ? " (dirty working tree)" : ""}`,
    `- **Generated:** ${artifact.generatedAt}`,
    "",
    table(
      ["Tickets scanned", "Correct", "Needs changes", "Manual review", "No mapping"],
      [
        [summary.ticketsScanned, summary.correct, summary.needsChanges, summary.manualReview, summary.noMapping].map(
          String,
        ),
      ],
    ),
  );

  // Only some issue types are expected to carry test cases, so lead with that count:
  // a Task or Spike without a mapping is normal, a Story or Bug without one is a gap.
  const gaps = coverageGaps(artifact.tickets);
  const expectCoverage = artifact.tickets.filter((ticket) => expectsCoverage(ticket.issueType));
  const gapLinks = gaps.map((ticket) => jiraLink(jira.baseUrl, ticket.jira)).join(", ");
  const gapSuffix = gaps.length > 0 ? `: ${gapLinks}.` : ".";
  const otherTypes = scope.issueTypes.filter((type) => !expectsCoverage(type)).join(", ") || "none";
  lines.push(
    "",
    `**Coverage gaps: ${gaps.length} of ${expectCoverage.length} ${COVERAGE_EXPECTED_LABEL} issue(s)** map to no story in this repository${gapSuffix}`,
    `Other audited types (${otherTypes}) are reported but not expected to carry test cases.`,
  );

  const actionable = artifact.tickets
    .filter((ticket) => ticket.status === "needs-changes" || ticket.status === "manual-review")
    .sort(byKey);
  lines.push("", `### Tickets needing changes or review (${actionable.length})`, "");
  if (actionable.length === 0) {
    lines.push("None — every audited ticket is either already correct or has no repository mapping.");
  } else {
    const withSummary = options.includeSummaries === true;
    lines.push(
      table(
        [
          "Jira",
          "Type",
          ...(withSummary ? ["Summary"] : []),
          "Existing",
          "Expected",
          "Missing",
          "Unexpected",
          "Confidence",
          "Action",
          "Approved",
        ],
        actionable.map((ticket) => [
          jiraLink(jira.baseUrl, ticket.jira),
          ticket.issueType,
          ...(withSummary ? [escapeCell(ticket.summary) || "-"] : []),
          idList(ticket.existingZephyrIdsAtAudit),
          idList(ticket.expectedZephyrIds),
          idList(ticket.missingZephyrIds),
          idList(ticket.unexpectedZephyrIds),
          ticket.confidence,
          ticket.recommendedAction.toUpperCase(),
          ticket.approved ? "yes" : "-",
        ]),
      ),
    );
  }

  // Advisory, and deliberately its own section rather than a column: it asks a human
  // to change the Jira issue type, which this tool never does and apply never reads.
  const flaggedTypes = typeReviews(artifact.tickets);
  if (flaggedTypes.length > 0) {
    lines.push(
      "",
      `### Issue type review (${flaggedTypes.length})`,
      "",
      "Advisory only. The audit never edits Jira, and none of this changes what apply writes.",
      "",
      table(
        ["Jira", "Type", "Suggests", "What the repository shows"],
        flaggedTypes.map((ticket) => [
          jiraLink(jira.baseUrl, ticket.jira),
          ticket.issueType,
          TYPE_SIGNAL_ACTIONS[ticket.typeReview.signal],
          escapeCell(ticket.typeReview.detail),
        ]),
      ),
    );
  }

  const correct = artifact.tickets.filter((ticket) => ticket.status === "correct");
  const noMapping = artifact.tickets.filter((ticket) => ticket.status === "no-mapping");
  const unmanaged = artifact.tickets.filter((ticket) => ticket.unmanagedZephyrIds.length > 0).sort(byKey);
  const sections: string[] = [];
  if (correct.length > 0) {
    sections.push(
      details(
        `Correct — Zephyr already links exactly the expected IDs (${correct.length})`,
        keyLinks(jira.baseUrl, correct),
      ),
    );
  }
  // Split by whether the type is expected to carry coverage: the first list is
  // the actual backlog of gaps, the second is routine and only here for completeness.
  const noMappingExpected = noMapping.filter((ticket) => expectsCoverage(ticket.issueType));
  const noMappingOther = noMapping.filter((ticket) => !expectsCoverage(ticket.issueType));
  if (noMappingExpected.length > 0) {
    sections.push(
      details(
        `Coverage gaps — ${COVERAGE_EXPECTED_LABEL} issues no story in this repository is attributed to (${noMappingExpected.length})`,
        keyLinks(jira.baseUrl, noMappingExpected),
      ),
    );
  }
  if (noMappingOther.length > 0) {
    sections.push(
      details(
        `No repository mapping, but not expected to carry test cases (${noMappingOther.length})`,
        keyLinks(jira.baseUrl, noMappingOther),
      ),
    );
  }
  if (unmanaged.length > 0) {
    sections.push(
      details(
        `Linked in Zephyr but not managed by this repository, e.g. manual test cases — informational (${unmanaged.length})`,
        unmanaged
          .map((ticket) => `- ${jiraLink(jira.baseUrl, ticket.jira)}: ${ticket.unmanagedZephyrIds.join(", ")}`)
          .join("\n"),
      ),
    );
  }
  if (artifact.skipped.length > 0) {
    sections.push(
      details(
        `Skipped by issue type or status (${artifact.skipped.length})`,
        [...artifact.skipped]
          .sort(byKey)
          .map((skipped) => {
            const status = skipped.status ? `, ${skipped.status}` : "";
            return `- ${jiraLink(jira.baseUrl, skipped.jira)} (${skipped.issueType}${status}) — ${skipped.reason}`;
          })
          .join("\n"),
      ),
    );
  }
  if (sections.length > 0) lines.push("", sections.join("\n\n"));
  return lines.join("\n");
}

export function renderApplyMarkdown(apply: ApplyArtifact, options: { jiraBaseUrl?: string } = {}): string {
  const counts = Object.entries(apply.summary)
    .filter((entry): entry is [string, number] => entry[1] !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([outcome, count]) => [outcome, String(count)]);
  const lines: string[] = [
    `## Zephyr apply — ${apply.mode === "execute" ? "executed" : "dry run"} (min confidence: ${apply.minConfidence})`,
    "",
    `- **Audit:** ${code(apply.auditFile)} generated ${apply.auditGeneratedAt}`,
    `- **Applied at:** ${apply.appliedAt}`,
    "",
    table(["Outcome", "Count"], counts),
  ];
  const results = [...apply.results].sort(byKey);
  if (results.length > 0) {
    lines.push(
      "",
      table(
        ["Jira", "Outcome", "Added", "Detail"],
        results.map((item) => [
          jiraLink(options.jiraBaseUrl, item.jira),
          item.outcome,
          idList(item.added),
          escapeCell(item.detail),
        ]),
      ),
    );
  }
  return lines.join("\n");
}

function renderNextSteps(audit: AuditArtifact, apply: ApplyArtifact | undefined, options: MarkdownOptions): string {
  const lines = ["### Next steps", ""];
  const frozen = plural(audit.scopeSnapshot.issueKeys.length, "issue key");
  const frozenNote = `That applies exactly this frozen audit (${frozen}) after re-checking live Zephyr state; issues added to the Epic / Fix Version since are never touched.`;
  const rerun = (mode: string) => {
    const modeInput = code("mode: " + mode);
    const runInput = code("audit_run_id: " + options.runId);
    return `run the workflow again with ${modeInput} and ${runInput}`;
  };

  if (apply?.mode === "execute") {
    const applied = apply.results.filter((item) => item.outcome === "applied");
    const added = applied.reduce((total, item) => total + item.added.length, 0);
    lines.push(`- Created ${plural(added, "COVERAGE link")} across ${plural(applied.length, "ticket")}.`);
    const attention = apply.results.filter((item) => NEEDS_ATTENTION.has(item.outcome)).sort(byKey);
    if (attention.length > 0) {
      lines.push(
        `- Needs attention — stale, manual-review or error, see the detail column: ${attention.map((item) => item.jira).join(", ")}. Run a fresh audit before retrying.`,
      );
    }
    return lines.join("\n");
  }

  if (apply) {
    const would = apply.results.filter((item) => item.outcome === "would-apply");
    const links = would.reduce((total, item) => total + item.added.length, 0);
    if (would.length === 0) {
      lines.push("- Dry run: nothing would be written (the outcome column says why each ticket was skipped).");
      return lines.join("\n");
    }
    lines.push(`- Dry run: ${plural(links, "link")} across ${plural(would.length, "ticket")} would be created.`);
    lines.push(
      options.runId
        ? `- To create them, ${rerun("write")} (same ${code("approve")} and ${code("min_confidence")}). ${frozenNote}`
        : `- To create them, run ${code("yarn jira-zephyr:apply <audit.json> --execute")}.`,
    );
    return lines.join("\n");
  }

  const recommended = audit.tickets.filter((ticket) => ticket.recommendedAction === "add").sort(byKey);
  if (recommended.length === 0) {
    lines.push(
      "- Nothing the tool can write automatically: no ticket has an ADD recommendation. Tickets under review need a human to fix the evidence or the links first, then a fresh audit.",
    );
    return lines.join("\n");
  }
  const links = recommended.reduce((total, ticket) => total + ticket.missingZephyrIds.length, 0);
  lines.push(
    `- The audit recommends adding ${plural(links, "link")} to ${plural(recommended.length, "ticket")}: ${recommended.map((ticket) => ticket.jira).join(", ")}.`,
  );
  lines.push(
    options.runId
      ? `- To preview, ${rerun("dry-run")}. To write, ${rerun("write")} with ${code("approve: recommended")} (or a list of issue keys). ${frozenNote}`
      : `- Approve entries with ${code("yarn jira-zephyr:approve <audit.json> --recommended")} (or specific keys), dry-run with ${code("yarn jira-zephyr:apply <audit.json>")}, then add ${code("--execute")}.`,
  );
  return lines.join("\n");
}

/** The full job-summary document: audit, optional apply result, and what to do next. */
export function renderRunMarkdown(audit: AuditArtifact, apply?: ApplyArtifact, options: MarkdownOptions = {}): string {
  const parts = [renderAuditMarkdown(audit, options)];
  if (apply) parts.push(renderApplyMarkdown(apply, { jiraBaseUrl: audit.jira.baseUrl }));
  parts.push(renderNextSteps(audit, apply, options));
  return parts.join("\n\n");
}
