/**
 * Validation for the apply script: the artifact must parse against the schema
 * AND be internally consistent before a single network call is made. Gating
 * (approval, confidence threshold) is also decided here so it is unit-testable
 * without any client.
 */
import { parseAuditArtifact } from "../shared/audit-schema";
import {
  CONFIDENCE_LEVELS,
  isConfidence,
  meetsThreshold,
  NEVER_AUTO_APPLY,
  type Confidence,
} from "../shared/confidence";

import type { ApplyOutcome, AuditArtifact, AuditEntry } from "../shared/types";

export class AuditValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuditValidationError";
  }
}

/** Parses + cross-checks an audit artifact; throws listing every problem found. */
export function validateAuditArtifact(json: unknown): AuditArtifact {
  const artifact = parseAuditArtifact(json);
  const problems: string[] = [];

  const snapshotKeys = artifact.scopeSnapshot.issueKeys;
  const snapshot = new Set(snapshotKeys);
  if (snapshot.size !== snapshotKeys.length) problems.push("scopeSnapshot.issueKeys contains duplicates");

  const seen = new Set<string>();
  for (const ticket of artifact.tickets) {
    if (seen.has(ticket.jira)) problems.push(`duplicate ticket entry for ${ticket.jira}`);
    seen.add(ticket.jira);
    if (!snapshot.has(ticket.jira)) problems.push(`ticket ${ticket.jira} is not in scopeSnapshot.issueKeys`);
    for (const id of ticket.missingZephyrIds) {
      if (!ticket.expectedZephyrIds.includes(id))
        problems.push(`${ticket.jira}: missing id ${id} is not in expectedZephyrIds`);
      if (ticket.existingZephyrIdsAtAudit.includes(id)) {
        problems.push(`${ticket.jira}: missing id ${id} is already listed in existingZephyrIdsAtAudit`);
      }
    }
  }
  for (const key of snapshotKeys) {
    if (!seen.has(key)) problems.push(`scopeSnapshot key ${key} has no ticket entry`);
  }

  if (problems.length > 0) {
    const list = problems.map((problem) => `  - ${problem}`).join("\n");
    throw new AuditValidationError(`Audit artifact is inconsistent:\n${list}`);
  }
  return artifact;
}

export function parseMinConfidence(value?: string, fallback: Confidence = "high"): Confidence {
  if (value === undefined) return fallback;
  if (!isConfidence(value)) {
    throw new AuditValidationError(`--min-confidence must be one of ${CONFIDENCE_LEVELS.join(", ")} (got "${value}")`);
  }
  if (value === NEVER_AUTO_APPLY) {
    throw new AuditValidationError(
      `--min-confidence ${NEVER_AUTO_APPLY} is not allowed: low-confidence mappings are never applied`,
    );
  }
  return value;
}

export type GateDecision =
  | { proceed: true; toAdd: string[] }
  | { proceed: false; outcome: ApplyOutcome; detail: string };

/** Decides whether an approved entry may be acted on at all. Pure. */
export function gateEntry(entry: AuditEntry, minConfidence: Confidence): GateDecision {
  if (!entry.approved) return { proceed: false, outcome: "skipped-not-approved", detail: "approved is false" };
  if (entry.missingZephyrIds.length === 0) {
    return {
      proceed: false,
      outcome: "skipped-no-changes",
      detail:
        entry.recommendedAction === "review"
          ? "approved, but the audit found nothing to add (review-only entry)"
          : "nothing to add",
    };
  }
  if (entry.confidence === NEVER_AUTO_APPLY) {
    return {
      proceed: false,
      outcome: "skipped-below-threshold",
      detail: "confidence is low; low-confidence mappings are never applied, whatever the threshold",
    };
  }
  if (!meetsThreshold(entry.confidence, minConfidence)) {
    return {
      proceed: false,
      outcome: "skipped-below-threshold",
      detail: `confidence ${entry.confidence} is below --min-confidence ${minConfidence}`,
    };
  }
  return { proceed: true, toAdd: [...entry.missingZephyrIds] };
}

export interface LiveTargets {
  jiraBaseUrl: string;
  zephyrBaseUrl: string;
  zephyrProjectKey: string;
}

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "").toLowerCase();
}

/**
 * The apply script must talk to the same Jira site, Zephyr API and Zephyr
 * project the audit recorded; otherwise the Jira-id re-check could pass on one
 * instance while the write lands on another. Pure; throws listing every mismatch.
 */
export function assertTargetsMatch(artifact: AuditArtifact, live: LiveTargets): void {
  const problems: string[] = [];
  if (normalizeUrl(live.jiraBaseUrl) !== normalizeUrl(artifact.jira.baseUrl)) {
    problems.push(`Jira base URL: audit recorded ${artifact.jira.baseUrl}, environment resolves ${live.jiraBaseUrl}`);
  }
  if (normalizeUrl(live.zephyrBaseUrl) !== normalizeUrl(artifact.zephyr.baseUrl)) {
    problems.push(
      `Zephyr base URL: audit recorded ${artifact.zephyr.baseUrl}, environment resolves ${live.zephyrBaseUrl}`,
    );
  }
  if (live.zephyrProjectKey.trim().toUpperCase() !== artifact.zephyr.projectKey.trim().toUpperCase()) {
    problems.push(
      `Zephyr project: audit recorded ${artifact.zephyr.projectKey}, environment resolves ${live.zephyrProjectKey}`,
    );
  }
  if (problems.length > 0) {
    const list = problems.map((problem) => `  - ${problem}`).join("\n");
    throw new AuditValidationError(
      `Refusing to apply: the live targets do not match the audit artifact\n${list}\n` +
        "Point JIRA_BASE_URL / ZEPHYR_BASE_URL / ZEPHYR_PROJECT_KEY at the audited targets, or re-audit against the new ones.",
    );
  }
}

/**
 * Binds the artifact to the workflow run that produced it. Without this,
 * `audit_run_id` is only an operator-typed number: a wrong-but-valid run id would
 * download a different audit and, with `approve: recommended`, apply *its*
 * recommendations while the human believed they had reviewed something else.
 */
export function assertOriginRun(artifact: AuditArtifact, expectedRunId: string): void {
  const actual = artifact.origin?.runId;
  if (!actual) {
    throw new AuditValidationError(
      `Refusing to apply: --expect-origin-run ${expectedRunId} was given, but this artifact records no GitHub Actions origin (it was produced locally). Re-run the audit in the workflow, or drop the flag.`,
    );
  }
  if (actual !== expectedRunId) {
    throw new AuditValidationError(
      `Refusing to apply: this artifact was produced by run ${actual}, not ${expectedRunId}. The audit that was reviewed and the audit about to be applied are different runs — check audit_run_id.`,
    );
  }
}
