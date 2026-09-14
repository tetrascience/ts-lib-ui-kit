/**
 * Credential and endpoint resolution. Reads environment variables only; never
 * logs a secret. Both scripts use the same names, and the Zephyr names match
 * the existing scripts/zephyr/* automation (`ZEPHYR_TOKEN`, `ZEPHYR_PROJECT_KEY`).
 */

export const DEFAULT_JIRA_BASE_URL = "https://tetrascience.atlassian.net";
export const DEFAULT_ZEPHYR_BASE_URL = "https://api.zephyrscale.smartbear.com/v2";
export const DEFAULT_PROJECT_KEY = "SW";

export interface JiraEnv {
  baseUrl: string;
  email: string;
  apiToken: string;
}

export interface ZephyrEnv {
  baseUrl: string;
  apiToken: string;
  projectKey: string;
}

function required(env: NodeJS.ProcessEnv, names: string[], purpose: string): string {
  for (const name of names) {
    const value = env[name]?.trim();
    if (value) return value;
  }
  throw new Error(`${purpose}: set ${names.join(" or ")} in the environment`);
}

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export function jiraEnv(env: NodeJS.ProcessEnv = process.env): JiraEnv {
  return {
    baseUrl: trimTrailingSlash(env.JIRA_BASE_URL?.trim() || DEFAULT_JIRA_BASE_URL),
    email: required(env, ["JIRA_EMAIL", "ATLASSIAN_EMAIL"], "Jira API access requires the account email"),
    apiToken: required(env, ["JIRA_API_TOKEN", "ATLASSIAN_API_TOKEN"], "Jira API access requires an API token"),
  };
}

export function zephyrEnv(env: NodeJS.ProcessEnv = process.env): ZephyrEnv {
  return {
    baseUrl: trimTrailingSlash(env.ZEPHYR_BASE_URL?.trim() || DEFAULT_ZEPHYR_BASE_URL),
    apiToken: required(env, ["ZEPHYR_TOKEN", "ZEPHYR_API_TOKEN"], "Zephyr Scale API access requires a token"),
    projectKey: env.ZEPHYR_PROJECT_KEY?.trim() || env.JIRA_PROJECT_KEY?.trim() || DEFAULT_PROJECT_KEY,
  };
}

export function defaultProjectKey(env: NodeJS.ProcessEnv = process.env): string {
  return env.JIRA_PROJECT_KEY?.trim() || env.ZEPHYR_PROJECT_KEY?.trim() || DEFAULT_PROJECT_KEY;
}
