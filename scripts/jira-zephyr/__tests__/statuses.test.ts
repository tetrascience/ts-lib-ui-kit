import { describe, expect, it } from "vitest";

import { DEFAULT_AUDITED_STATUSES, isAuditedStatus, UnknownStatusError, validateStatusNames } from "../shared/statuses";

/** The SW workflow as it stands, including each status's Jira category. */
const SW_STATUSES = [
  { name: "Open", category: "To Do" },
  { name: "In Progress", category: "In Progress" },
  { name: "Code review", category: "In Progress" },
  { name: "Verification", category: "In Progress" },
  { name: "Closed", category: "Done" },
];

describe("isAuditedStatus", () => {
  it("admits code review onwards and rejects everything earlier", () => {
    expect(SW_STATUSES.filter((status) => isAuditedStatus(status.name)).map((status) => status.name)).toEqual([
      "Code review",
      "Verification",
      "Closed",
    ]);
  });

  it("ignores case and surrounding whitespace", () => {
    expect(isAuditedStatus("  code REVIEW ")).toBe(true);
    expect(isAuditedStatus("closed")).toBe(true);
  });

  it("honours an explicit audited set", () => {
    expect(isAuditedStatus("Done", ["Done"])).toBe(true);
    expect(isAuditedStatus("Closed", ["Done"])).toBe(false);
    expect(isAuditedStatus("Closed", [])).toBe(false);
  });

  /**
   * The reason this module filters by name at all. If the cutoff could be drawn
   * on Jira's status category, it would be rename-proof — but "Code review" and
   * "Verification" share the In Progress category with "In Progress" itself, so
   * no category predicate separates them.
   */
  it("draws a line that status categories cannot express", () => {
    const audited = new Set(DEFAULT_AUDITED_STATUSES as readonly string[]);
    const inProgress = SW_STATUSES.filter((status) => status.category === "In Progress");
    expect(inProgress.some((status) => audited.has(status.name))).toBe(true);
    expect(inProgress.some((status) => !audited.has(status.name))).toBe(true);
  });
});

describe("validateStatusNames", () => {
  it("accepts names the project defines, case-insensitively", () => {
    expect(() => validateStatusNames(DEFAULT_AUDITED_STATUSES, SW_STATUSES, "SW")).not.toThrow();
    expect(() => validateStatusNames(["code review"], SW_STATUSES, "SW")).not.toThrow();
  });

  it("rejects a renamed status and names both the gap and the alternatives", () => {
    const renamed = SW_STATUSES.map((status) =>
      status.name === "Code review" ? { ...status, name: "In Review" } : status,
    );
    let error: unknown;
    try {
      validateStatusNames(DEFAULT_AUDITED_STATUSES, renamed, "SW");
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(UnknownStatusError);
    const { message, unknown } = error as UnknownStatusError;
    expect(unknown).toEqual(["Code review"]);
    expect(message).toContain('"Code review" does not exist in project SW');
    expect(message).toContain("In Review (In Progress)");
    expect(message).toContain("--all-statuses");
  });

  /** A missing permission must not fail the audit closed — the check just no-ops. */
  it("no-ops when the project statuses could not be read", () => {
    expect(() => validateStatusNames(DEFAULT_AUDITED_STATUSES, [], "SW")).not.toThrow();
  });
});
