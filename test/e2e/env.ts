/**
 * Environment for the telemetry e2e suite.
 *
 * Modelled on ts-sdk-connectors-python's `__tests__/integration/conftest.py`:
 * every required variable is validated up front and a missing one FAILS LOUDLY
 * rather than silently skipping. A "passing" e2e run that quietly tested
 * nothing is worse than a red one.
 */

/** A missing variable throws here, not deep inside a test. */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required e2e environment variable ${name}. ` +
        `Copy test/e2e/.env.e2e.example and fill it in — see test/e2e/README.md.`,
    );
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

/**
 * How the auth token is obtained. Default is the SSM admin-password login that
 * ts-service-data-apps' e2e suite already uses — no GitHub secret, and the
 * `tdp-e2e` CodeBuild role already grants ssm:GetParameter on that path.
 *
 * `TDP_AUTH_TOKEN` overrides it, for a local run against a token you already
 * hold. Setting both is rejected rather than silently preferring one: "which
 * credential did that run use" should not be answerable only from memory.
 */
function authSource(): { adminPasswordPath: string } | { literal: string } {
  const literal = process.env.TDP_AUTH_TOKEN;
  const explicitPath = process.env.ADMIN_PASSWORD_SSM_PARAM;
  if (literal && explicitPath) {
    throw new Error(
      "Set TDP_AUTH_TOKEN or ADMIN_PASSWORD_SSM_PARAM, not both — " +
        "otherwise which credential the run used is ambiguous.",
    );
  }
  if (literal) return { literal };
  // CF_ENVIRONMENT is the CloudFormation env name (development, predev5…),
  // which is what the SSM path is keyed on — not the API hostname.
  const cfEnvironment = optional("CF_ENVIRONMENT", "development");
  return { adminPasswordPath: explicitPath || `/tetrascience/${cfEnvironment}/platform/ADMIN_PASSWORD` };
}

export const env = {
  /** e.g. https://api.tetrascience-dev.com — must be reachable from the runner. */
  tdpEndpoint: required("TDP_ENDPOINT"),
  /** Where the `ts-auth-token` value comes from. Never a GitHub secret in CI. */
  auth: authSource(),
  /** Org the gateway will stamp. Use a test org, not a customer's. */
  orgSlug: required("TDP_ORG_SLUG"),
  /** Where the collector writes customer product events, e.g. /tdp/ts-platform/customer-events. */
  customerEventsLogGroup: required("CUSTOMER_EVENTS_LOG_GROUP"),
  awsRegion: optional("AWS_REGION", "us-east-2"),
  metricNamespace: optional("CUSTOMER_METRIC_NAMESPACE", "TDP/CustomerMetrics"),
  /** Artifact identity this suite reports as. */
  artifact: {
    namespace: optional("E2E_ARTIFACT_NAMESPACE", "common"),
    slug: optional("E2E_ARTIFACT_SLUG", "ts-lib-ui-kit-e2e"),
    version: optional("E2E_ARTIFACT_VERSION", "0.0.0"),
  },
} as const;

/**
 * Unique per run, stamped on every record this suite emits.
 *
 * Two runs can overlap (a nightly and someone's manual run), and CloudWatch
 * retains records long after a run ends — without this, a query would happily
 * match a PREVIOUS run's data and the assertion would pass while this run
 * emitted nothing at all.
 */
/** Base-36 keeps the id short while staying filter-pattern safe. */
const BASE36 = 36;
export const RUN_ID = `e2e-${Date.now().toString(BASE36)}-${Math.random().toString(BASE36).slice(2, 8)}`;
