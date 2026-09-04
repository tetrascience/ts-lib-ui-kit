/**
 * Resolves the `ts-auth-token` the gateway authenticates ingest with.
 *
 * Same mechanism ts-service-data-apps' e2e suite already uses
 * (`test/e2e/lib/env.ts` there): read the platform ADMIN_PASSWORD from SSM,
 * then POST /login. No credential is stored in GitHub — the `tdp-e2e`
 * CodeBuild role already holds `ssm:GetParameter` on exactly this path, so
 * there is nothing new to provision and nothing to rotate in a second place.
 *
 * Caveat, inherited and worth stating: this yields a tsAdmin-scoped token with
 * multi-org access. Fine for asserting that OUR OWN records land, which is all
 * this suite does. It would be the wrong credential for a cross-org isolation
 * test — those need the org-scoped service user tracked in SW-1552.
 */
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

import { env } from "./env";

let cached: string | undefined;

async function readSsm(name: string): Promise<string | undefined> {
  const ssm = new SSMClient({ region: env.awsRegion });
  const out = await ssm.send(new GetParameterCommand({ Name: name, WithDecryption: true }));
  return out.Parameter?.Value;
}

/**
 * `createTelemetry` calls `getAuthToken` on EVERY export, so this is cached —
 * a login per batch would be absurd. Cached for the process, not persisted: a
 * run is minutes, well inside the token's life.
 */
export async function resolveAuthToken(): Promise<string> {
  if (cached) return cached;

  if ("literal" in env.auth) {
    cached = env.auth.literal;
    return cached;
  }

  const password = await readSsm(env.auth.adminPasswordPath);
  if (!password) {
    throw new Error(
      `SSM parameter ${env.auth.adminPasswordPath} is missing or empty. ` +
        `Locally this usually means no AWS session for the target env ` +
        `(try: aws sso login --sso-session tetrascience).`,
    );
  }

  const response = await fetch(`${env.tdpEndpoint}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@tetrascience.com", password, subdomain: "" }),
  });
  if (!response.ok) {
    // Deliberately does not echo the body: a failed login response can carry
    // back detail we would rather not put in a CI log.
    throw new Error(`Login failed against ${env.tdpEndpoint}: HTTP ${response.status}`);
  }
  const body = (await response.json()) as { token?: string };
  if (!body.token) {
    throw new Error(`Login against ${env.tdpEndpoint} returned no token.`);
  }

  cached = body.token;
  return body.token;
}
