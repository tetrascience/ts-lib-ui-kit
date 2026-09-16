/**
 * Human-readable output for the audit: terminal report + artifact naming.
 * The JSON artifact is the source of truth; this is the summary a reviewer
 * reads first.
 */
import { SCOPE_TYPE_LABELS } from "../shared/audit-schema";
import { COVERAGE_EXPECTED_LABEL, coverageGaps, expectsCoverage } from "../shared/issue-types";
import { formatIdList, renderTable } from "../shared/table";

import type { AuditArtifact, AuditScope } from "../shared/types";

function sanitize(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

function timestampSlug(iso: string): string {
  return iso.replace(/\.\d{3}Z$/, "Z").replace(/[:.]/g, "-");
}

/** e.g. zephyr-audit-epic-SW-2301.json, zephyr-audit-fix-version-ts-lib-ui-kit-v1.1.0.json */
export function auditArtifactFileName(scope: AuditScope, generatedAt: string): string {
  const base = `zephyr-audit-${scope.type}`;
  if (scope.type === "jql") return `${base}-${timestampSlug(generatedAt)}.json`;
  if (scope.type === "keys" && scope.values.length <= 3) return `${base}-${scope.values.map(sanitize).join("-")}.json`;
  if (scope.values.length === 1) return `${base}-${sanitize(scope.values[0])}.json`;
  return `${base}-multi-${timestampSlug(generatedAt)}.json`;
}

export interface ReportContext {
  /** Resolved labels for the scope values (e.g. epic summaries). */
  labels?: string[];
  artifactPath?: string;
  totalResolved?: number;
}

export function renderAuditReport(artifact: AuditArtifact, context: ReportContext = {}): string {
  const lines: string[] = ["Zephyr Audit"];
  const scopeValues = context.labels && context.labels.length > 0 ? context.labels : artifact.scope.values;
  lines.push(`${SCOPE_TYPE_LABELS[artifact.scope.type]}: ${scopeValues.join("; ")}`);
  if (artifact.scope.resolvedJql) lines.push(`Resolved JQL: ${artifact.scope.resolvedJql}`);
  const resolved = context.totalResolved ?? artifact.scopeSnapshot.issueKeys.length + artifact.skipped.length;
  lines.push(
    `Issues resolved: ${resolved} (${artifact.scopeSnapshot.issueKeys.length} audited, ${artifact.skipped.length} skipped by issue type)`,
  );
  lines.push(
    `Repo: ${artifact.repo.branch}@${artifact.repo.head.slice(0, 7)}${artifact.repo.dirty ? " (dirty working tree)" : ""}`,
  );
  lines.push("");

  // A trailing "·" marks the types that are expected to carry coverage, so a
  // missing mapping on one of those rows reads as a gap rather than as noise.
  const rows = artifact.tickets.map((ticket) => [
    ticket.jira,
    `${ticket.issueType}${expectsCoverage(ticket.issueType) ? " ·" : ""}`,
    formatIdList(ticket.existingZephyrIdsAtAudit),
    formatIdList(ticket.expectedZephyrIds),
    formatIdList(ticket.missingZephyrIds),
    ticket.confidence,
    ticket.recommendedAction.toUpperCase(),
  ]);
  lines.push(renderTable(["JIRA", "TYPE", "EXISTING", "EXPECTED", "MISSING", "CONFIDENCE", "ACTION"], rows));

  const flagged = artifact.tickets.filter((ticket) => ticket.unexpectedZephyrIds.length > 0);
  if (flagged.length > 0) {
    lines.push("", "Unexpected links (linked in Zephyr, attributed elsewhere by the repo):");
    for (const ticket of flagged) lines.push(`  ${ticket.jira}: ${ticket.unexpectedZephyrIds.join(", ")}`);
  }

  if (artifact.skipped.length > 0) {
    lines.push("", "Skipped (issue type not audited):");
    for (const skipped of artifact.skipped) lines.push(`  ${skipped.jira} (${skipped.issueType})`);
  }

  const { summary } = artifact;
  lines.push(
    "",
    "Summary",
    `  Tickets scanned: ${summary.ticketsScanned}`,
    `  Correct: ${summary.correct}`,
    `  Needs changes: ${summary.needsChanges}`,
    `  Manual review: ${summary.manualReview}`,
    `  No mapping: ${summary.noMapping}`,
  );
  const gaps = coverageGaps(artifact.tickets);
  const expectCoverage = artifact.tickets.filter((ticket) => expectsCoverage(ticket.issueType));
  const gapKeys = gaps.map((ticket) => ticket.jira).join(", ");
  const gapSuffix = gaps.length > 0 ? `: ${gapKeys}` : "";
  lines.push(
    `  Coverage gaps: ${gaps.length} of ${expectCoverage.length} ${COVERAGE_EXPECTED_LABEL} (·) issue(s) map to no story${gapSuffix}`,
  );
  if (context.artifactPath) {
    lines.push(
      "",
      `Artifact: ${context.artifactPath}`,
      `Next: review the artifact, set "approved": true on the entries to apply (or run yarn jira-zephyr:approve ${context.artifactPath} SW-1234 …),`,
      `      then dry-run with yarn jira-zephyr:apply ${context.artifactPath} and add --execute to write.`,
    );
  }
  return lines.join("\n");
}
