/**
 * A copy of an audit artifact that is safe to upload from this PUBLIC repository.
 *
 * Jira ticket titles (`tickets[].summary`) are blanked — they are the only
 * field that is not already public via commit subjects and story files.
 * Everything the apply script needs — keys, numeric issue ids, Zephyr ids,
 * confidence, approvals, evidence — is kept, so the redacted copy is still a
 * valid, applicable audit (the apply step of the GitHub workflow consumes it).
 */
import type { AuditArtifact } from "./types";

export function redactArtifact(artifact: AuditArtifact): AuditArtifact {
  return {
    ...artifact,
    tickets: artifact.tickets.map((ticket) => ({ ...ticket, summary: "" })),
  };
}
