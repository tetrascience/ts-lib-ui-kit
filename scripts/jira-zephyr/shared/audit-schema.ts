/**
 * Typed schema for the audit artifact and the apply-result artifact.
 *
 * The audit script writes an artifact that a human reviews and approves; the
 * apply script refuses to do anything with a file that does not parse against
 * this schema. Keep additions backwards compatible or bump SCHEMA_VERSION.
 */
import { z } from "zod";

import { CONFIDENCE_LEVELS, EVIDENCE_TYPES } from "./confidence";
import { JIRA_KEY_RE, ZEPHYR_TEST_CASE_KEY_RE } from "./keys";

export const AUDIT_SCHEMA_VERSION = 1;
export const AUDIT_TOOL_NAME = "jira-zephyr-audit";
export const APPLY_TOOL_NAME = "jira-zephyr-apply";

export const jiraKeySchema = z.string().regex(JIRA_KEY_RE, "expected a Jira issue key like SW-1234");
export const zephyrKeySchema = z
  .string()
  .regex(ZEPHYR_TEST_CASE_KEY_RE, "expected a Zephyr test case key like SW-T1234");
export const confidenceSchema = z.enum(CONFIDENCE_LEVELS);
export const recommendedActionSchema = z.enum(["none", "add", "review"]);
export const ticketStatusSchema = z.enum(["correct", "needs-changes", "manual-review", "no-mapping"]);
export const scopeTypeSchema = z.enum(["epic", "fix-version", "keys", "jql", "intersection"]);

/**
 * Advisory signal about the Jira **issue type**, raised when the type disagrees
 * with what the repository shows. Purely informational: it never feeds the apply
 * gate, and the tool never edits Jira.
 *
 *   retype-to-story-or-bug — a type not expected to carry coverage (Task, Spike)
 *                            that the repository does attribute test cases to.
 *   missing-coverage       — a Story/Bug/Defect the repository maps to nothing:
 *                            it needs test coverage, or it is really a Task.
 */
export const typeSignalSchema = z.enum(["retype-to-story-or-bug", "missing-coverage"]);

export const typeReviewSchema = z.object({
  signal: typeSignalSchema,
  /** Short, report-ready explanation of what the repository shows. */
  detail: z.string().min(1),
});

export const evidenceSchema = z.object({
  type: z.enum(EVIDENCE_TYPES),
  confidence: confidenceSchema,
  jira: jiraKeySchema,
  /** Repo-relative path of the story file this evidence comes from. */
  file: z.string().min(1),
  /** Export name of the story, when the evidence is story-scoped. */
  story: z.string().optional(),
  storyName: z.string().optional(),
  line: z.number().int().positive().optional(),
  /** Zephyr IDs this evidence attributes to the Jira issue (may be empty for informational items). */
  zephyrIds: z.array(zephyrKeySchema),
  commit: z.string().optional(),
  commitSubject: z.string().optional(),
  detail: z.string(),
});

export const auditEntrySchema = z.object({
  jira: jiraKeySchema,
  /** Jira's immutable numeric issue id — what Zephyr's issue links actually store. */
  jiraIssueId: z.string().regex(/^\d+$/),
  summary: z.string(),
  issueType: z.string(),
  issueStatus: z.string(),
  existingZephyrIdsAtAudit: z.array(zephyrKeySchema),
  expectedZephyrIds: z.array(zephyrKeySchema),
  missingZephyrIds: z.array(zephyrKeySchema),
  /** Linked in Zephyr, known to this repo, but not attributed to this issue — needs a human. */
  unexpectedZephyrIds: z.array(zephyrKeySchema),
  /** Linked in Zephyr but unknown to this repo (e.g. manual test cases) — informational only. */
  unmanagedZephyrIds: z.array(zephyrKeySchema),
  confidence: confidenceSchema,
  recommendedAction: recommendedActionSchema,
  status: ticketStatusSchema,
  approved: z.boolean(),
  /** Free-text a reviewer may add when approving; never read by the apply script. */
  reviewNote: z.string().optional(),
  /**
   * Advisory issue-type signal; absent when the type and the repository agree.
   * Optional, so artifacts written before this existed still parse unchanged.
   */
  typeReview: typeReviewSchema.optional(),
  evidence: z.array(evidenceSchema),
  notes: z.array(z.string()),
});

export const auditArtifactSchema = z.object({
  schemaVersion: z.literal(AUDIT_SCHEMA_VERSION),
  tool: z.literal(AUDIT_TOOL_NAME),
  generatedAt: z.string().datetime(),
  scope: z.object({
    type: scopeTypeSchema,
    values: z.array(z.string().min(1)),
    resolvedJql: z.string().optional(),
    /** Issue types that participated; everything else in scope is listed under `skipped`. */
    issueTypes: z.array(z.string().min(1)),
  }),
  scopeSnapshot: z.object({
    resolvedAt: z.string().datetime(),
    /** The exact, frozen set of issue keys the apply script may touch. */
    issueKeys: z.array(jiraKeySchema),
  }),
  skipped: z.array(
    z.object({
      jira: jiraKeySchema,
      issueType: z.string(),
      reason: z.string(),
    }),
  ),
  repo: z.object({
    head: z.string().min(1),
    branch: z.string().min(1),
    dirty: z.boolean(),
  }),
  jira: z.object({ baseUrl: z.string().url(), projectKey: z.string().min(1) }),
  zephyr: z.object({ baseUrl: z.string().url(), projectKey: z.string().min(1) }),
  tickets: z.array(auditEntrySchema),
  summary: z.object({
    ticketsScanned: z.number().int().nonnegative(),
    correct: z.number().int().nonnegative(),
    needsChanges: z.number().int().nonnegative(),
    manualReview: z.number().int().nonnegative(),
    noMapping: z.number().int().nonnegative(),
  }),
});

export const applyOutcomeSchema = z.enum([
  "applied",
  "would-apply",
  "already-correct",
  "stale",
  "manual-review",
  "skipped-not-approved",
  "skipped-below-threshold",
  "skipped-no-changes",
  "error",
]);

export const applyResultSchema = z.object({
  jira: jiraKeySchema,
  outcome: applyOutcomeSchema,
  /** IDs linked in this run (execute) or that would have been (dry run). */
  added: z.array(zephyrKeySchema),
  liveZephyrIds: z.array(zephyrKeySchema).optional(),
  detail: z.string(),
});

export const applyArtifactSchema = z.object({
  schemaVersion: z.literal(AUDIT_SCHEMA_VERSION),
  tool: z.literal(APPLY_TOOL_NAME),
  appliedAt: z.string().datetime(),
  auditFile: z.string().min(1),
  auditGeneratedAt: z.string().datetime(),
  mode: z.enum(["dry-run", "execute"]),
  minConfidence: confidenceSchema,
  results: z.array(applyResultSchema),
  summary: z.record(applyOutcomeSchema, z.number().int().nonnegative()),
});

export type Evidence = z.infer<typeof evidenceSchema>;
export type AuditEntry = z.infer<typeof auditEntrySchema>;
export type AuditArtifact = z.infer<typeof auditArtifactSchema>;
export type AuditScope = AuditArtifact["scope"];
export type ScopeType = z.infer<typeof scopeTypeSchema>;
export type RecommendedAction = z.infer<typeof recommendedActionSchema>;
export type TicketStatus = z.infer<typeof ticketStatusSchema>;
export type ApplyOutcome = z.infer<typeof applyOutcomeSchema>;
export type ApplyResult = z.infer<typeof applyResultSchema>;
export type ApplyArtifact = z.infer<typeof applyArtifactSchema>;
export type TypeSignal = z.infer<typeof typeSignalSchema>;
export type TypeReview = z.infer<typeof typeReviewSchema>;

export function formatZodIssues(error: z.ZodError): string {
  return error.issues.map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`).join("\n");
}

/** Parses an audit artifact, throwing a readable error listing every schema violation. */
export function parseAuditArtifact(json: unknown): AuditArtifact {
  const result = auditArtifactSchema.safeParse(json);
  if (!result.success) {
    throw new Error(`Audit artifact does not match schema v${AUDIT_SCHEMA_VERSION}:\n${formatZodIssues(result.error)}`);
  }
  return result.data;
}

/** Human labels for `scope.type`, shared by the terminal and Markdown reports. */
export const SCOPE_TYPE_LABELS: Record<ScopeType, string> = {
  epic: "Epic",
  "fix-version": "Fix Version",
  keys: "Issue keys",
  jql: "JQL",
  intersection: "Epic ∩ Fix Version",
};

/** Parses an apply-result artifact (written by the apply script), throwing a readable error. */
export function parseApplyArtifact(json: unknown): ApplyArtifact {
  const result = applyArtifactSchema.safeParse(json);
  if (!result.success) {
    throw new Error(`Apply result does not match schema v${AUDIT_SCHEMA_VERSION}:\n${formatZodIssues(result.error)}`);
  }
  return result.data;
}
