/**
 * CloudWatch assertions for the telemetry e2e suite.
 *
 * Everything here exists because the ingest path cannot be trusted to report
 * its own failure. Read the notes before changing a query — each one is a bug
 * that shipped or nearly shipped.
 */
import { CloudWatchClient, GetMetricStatisticsCommand } from "@aws-sdk/client-cloudwatch";
import { CloudWatchLogsClient, FilterLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";

import { env } from "./env";

const logs = new CloudWatchLogsClient({ region: env.awsRegion });
const cw = new CloudWatchClient({ region: env.awsRegion });

/** Telemetry is async end to end: batch queue -> gateway -> collector -> EMF. */
const DEFAULT_TIMEOUT_MS = 180_000;
const POLL_INTERVAL_MS = 5_000;

async function poll<T>(
  what: string,
  attempt: () => Promise<T | undefined>,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  let last: unknown;
  for (;;) {
    try {
      const result = await attempt();
      if (result !== undefined) return result;
    } catch (error) {
      // Transient throttling must not fail the run; the deadline governs.
      last = error;
    }
    if (Date.now() >= deadline) {
      throw new Error(
        `Timed out after ${timeoutMs}ms waiting for ${what}.` +
          (last ? ` Last error: ${String(last)}` : "") +
          `\nNOTE: the ingest endpoint returns HTTP 200 {"partialSuccess":{}} even when` +
          ` nothing is published, so a green POST is not evidence. Check the collector's` +
          ` awsemf config and the customer-lane filters.`,
      );
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

/**
 * Wait for a product-event log record containing `runId`.
 *
 * Uses FilterLogEvents with a literal pattern rather than Logs Insights: an
 * Insights query is itself asynchronous (start, then poll for results), which
 * would nest a second poll loop inside this one for no benefit.
 */
export async function waitForEventContaining(runId: string, startTime: number): Promise<string> {
  return poll(`a customer-events record containing ${runId}`, async () => {
    const out = await logs.send(
      new FilterLogEventsCommand({
        logGroupName: env.customerEventsLogGroup,
        startTime,
        filterPattern: `"${runId}"`,
        limit: 10,
      }),
    );
    const hit = out.events?.find((e) => e.message?.includes(runId));
    return hit?.message;
  });
}

/**
 * Wait for datapoints on a customer metric.
 *
 * Two things here are not optional:
 *
 * 1. GetMetricStatistics, NOT ListMetrics. ListMetrics lags minutes behind and
 *    reported "0 series" on predev5 while these very datapoints already
 *    existed — an assertion built on it fails for a reason unrelated to the
 *    code under test.
 * 2. The caller must have exported the series at least TWICE. awsemf converts
 *    cumulative sums to deltas and `retain_initial_value_of_delta_metric`
 *    defaults false, so the first datapoint of a series is never published. A
 *    single-shot emit produces nothing and looks exactly like a broken lane.
 */
export async function waitForMetricDatapoints(
  metricName: string,
  dimensions: Record<string, string>,
  startTime: Date,
): Promise<number> {
  return poll(`datapoints for ${env.metricNamespace}/${metricName}`, async () => {
    const out = await cw.send(
      new GetMetricStatisticsCommand({
        Namespace: env.metricNamespace,
        MetricName: metricName,
        Dimensions: Object.entries(dimensions).map(([Name, Value]) => ({ Name, Value })),
        StartTime: startTime,
        // Comfortably ahead of now: EMF timestamps come from the producer,
        // and a small clock skew must not put the point outside the window.
        EndTime: new Date(Date.now() + 5 * 60_000),
        Period: 60,
        Statistics: ["Sum"],
      }),
    );
    const points = out.Datapoints ?? [];
    if (points.length === 0) return undefined;
    return points.reduce((total, p) => total + (p.Sum ?? 0), 0);
  });
}

/**
 * Wait for a span to appear in `aws/spans`.
 *
 * Customer spans do NOT land in the customer-events group: the collector's
 * traces lane exports to X-Ray and CloudWatch Transaction Search mirrors them
 * into `aws/spans` — an AWS-MANAGED group name we do not choose and cannot
 * prefix, which is why the e2e role needs its own grant for it (SW-2478).
 */
export async function waitForSpanNamed(spanName: string, startTime: number): Promise<string> {
  return poll(`a span named ${spanName} in aws/spans`, async () => {
    const out = await logs.send(
      new FilterLogEventsCommand({
        logGroupName: "aws/spans",
        startTime,
        filterPattern: `"${spanName}"`,
        limit: 10,
      }),
    );
    return out.events?.find((e) => e.message?.includes(spanName))?.message;
  });
}
