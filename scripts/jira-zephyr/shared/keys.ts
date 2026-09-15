/**
 * Key-format helpers shared by the audit and apply scripts.
 *
 * Jira issue keys look like `SW-2540`; Zephyr Scale test case keys look like
 * `SW-T5655` (the `T` segment is what tells them apart — the Jira pattern
 * requires digits straight after the dash, so it can never match a Zephyr key).
 */

const JIRA_KEY_SOURCE = "([A-Z][A-Z0-9]{1,9})-(\\d{1,7})";

export const JIRA_KEY_RE = new RegExp(`^${JIRA_KEY_SOURCE}$`);
export const ZEPHYR_TEST_CASE_KEY_RE = /^[A-Z][A-Z0-9]{1,9}-T\d{1,7}$/;

export function isJiraKey(value: string): boolean {
  return JIRA_KEY_RE.test(value);
}

export function isZephyrTestCaseKey(value: string): boolean {
  return ZEPHYR_TEST_CASE_KEY_RE.test(value);
}

export function projectKeyOf(issueKey: string): string {
  return issueKey.slice(0, issueKey.indexOf("-"));
}

function issueNumberOf(issueKey: string): number {
  return Number(/(\d+)$/.exec(issueKey)?.[1] ?? Number.NaN);
}

/** Sorts `SW-9` before `SW-10` (numeric), grouping by project key; works for Zephyr keys (`SW-T9`) too. */
export function compareIssueKeys(a: string, b: string): number {
  const byProject = projectKeyOf(a).localeCompare(projectKeyOf(b));
  return byProject === 0 ? issueNumberOf(a) - issueNumberOf(b) : byProject;
}

/**
 * Extracts unique Jira issue keys from free text, in order of first appearance.
 *
 * `projectKeys` restricts matches to known projects so that tokens such as
 * `UTF-8` or `ES-2020` in prose are not mistaken for issue keys.
 */
export function extractJiraKeys(text: string, projectKeys?: ReadonlySet<string>): string[] {
  const pattern = new RegExp(`\\b${JIRA_KEY_SOURCE}\\b`, "g");
  const found: string[] = [];
  for (const match of text.matchAll(pattern)) {
    const key = match[0];
    if (projectKeys && !projectKeys.has(match[1])) continue;
    if (!found.includes(key)) found.push(key);
  }
  return found;
}

/** Splits a `parameters.zephyr.testCaseId` literal ("SW-T1" or "SW-T1, SW-T2") into keys. */
export function parseZephyrIds(value: string): string[] {
  return value
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}

export function uniqueSorted(values: Iterable<string>): string[] {
  return [...new Set(values)].sort(compareIssueKeys);
}
