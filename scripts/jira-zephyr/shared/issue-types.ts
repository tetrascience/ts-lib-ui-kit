/**
 * Which Jira issue types are *expected* to carry Zephyr coverage.
 *
 * Every audited type still gets a row — nothing is hidden — but only these
 * types make "no repository mapping" a real coverage gap worth chasing. In this
 * project a Task or a Spike routinely ships no test case of its own (tooling,
 * docs, refactors, investigations), so counting those as gaps buries the ones
 * that matter. `Defect` is included because it is a bug under another name.
 *
 * Which types are audited at all is a separate, CLI-level decision
 * (`--issue-types`, default `DEFAULT_ISSUE_TYPES` in audit/scope.ts).
 */
export const COVERAGE_EXPECTED_ISSUE_TYPES = ["Story", "Bug", "Defect"] as const;

/** Short label for report headings, e.g. "Story/Bug/Defect". */
export const COVERAGE_EXPECTED_LABEL = COVERAGE_EXPECTED_ISSUE_TYPES.join("/");

export function expectsCoverage(issueType: string): boolean {
  const normalized = issueType.trim().toLowerCase();
  return COVERAGE_EXPECTED_ISSUE_TYPES.some((type) => type.toLowerCase() === normalized);
}

/** Tickets whose type expects coverage but which the repository maps to nothing. */
export function coverageGaps<T extends { issueType: string; status: string }>(tickets: readonly T[]): T[] {
  return tickets.filter((ticket) => ticket.status === "no-mapping" && expectsCoverage(ticket.issueType));
}
