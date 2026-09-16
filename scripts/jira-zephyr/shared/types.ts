/**
 * Domain types shared across the audit and apply scripts. Artifact shapes are
 * derived from the zod schemas in ./audit-schema; these are the live-system
 * shapes (Jira, Zephyr) and CLI-level selectors.
 */
import type { ScopeType } from "./audit-schema";

export type {
  ApplyArtifact,
  ApplyOutcome,
  ApplyResult,
  AuditArtifact,
  AuditEntry,
  AuditScope,
  Evidence,
  RecommendedAction,
  ScopeType,
  TicketStatus,
  TypeReview,
  TypeSignal,
} from "./audit-schema";
export type { Confidence, EvidenceType } from "./confidence";

/** The subset of a Jira issue the tool reads. `id` is the numeric id Zephyr links store. */
export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    issuetype: { name: string; subtask?: boolean; hierarchyLevel?: number };
    status: { name: string };
    fixVersions?: Array<{ id: string; name: string }>;
    parent?: { key: string };
  };
}

export interface JiraVersion {
  id: string;
  name: string;
  released?: boolean;
  archived?: boolean;
}

/** Fields requested from Jira for every issue in scope. */
export const JIRA_ISSUE_FIELDS = ["summary", "issuetype", "status", "fixVersions", "parent"] as const;

export interface ZephyrIssueLink {
  id: number;
  issueId: number;
  type?: string;
}

export interface ZephyrTestCase {
  key: string;
  name: string;
  links?: { issues?: ZephyrIssueLink[] };
}

/** What the user asked to audit, before it is resolved into concrete issue keys. */
export interface ScopeSelector {
  type: ScopeType;
  epics: string[];
  fixVersions: string[];
  keys: string[];
  jql?: string;
}
