/**
 * End-to-end for the REACT BINDINGS: a real provider mount in a real React
 * tree -> the real gateway -> the real collector -> CloudWatch.
 *
 * WHY THIS EXISTS SEPARATELY FROM ts-lib-request's e2e. "The bindings just
 * delegate to the core" is an assumption, and it is exactly the shape of
 * assumption that hid two production bugs in this epic: Python metrics never
 * published because the distro dropped its Content-Type, and Python spans were
 * refused with 415 — both while the neighbouring signal worked and every unit
 * test passed. The bindings own real behaviour the core does not: building the
 * client from `artifact`/`manifest` props, resolving the token per export,
 * mounting under StrictMode's double-invoke, and flushing on visibilitychange.
 * None of that is exercised by the core's suite.
 *
 * Runs under jsdom because the bindings assume a browser, and inside the
 * VPC-attached tdp-e2e CodeBuild project because predev5 is unreachable from a
 * GitHub-hosted runner.
 */
import { act } from "react";
import { createRoot } from "react-dom/client";
import { useEffect } from "react";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { TelemetryProvider, useTetraEvents } from "../../src/telemetry";

import { resolveAuthToken } from "./auth";
import { waitForEventContaining, waitForMetricDatapoints } from "./cloudwatch";
import { env, RUN_ID } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let windowStart: Date;
let token: string;

beforeAll(async () => {
  windowStart = new Date(Date.now() - 60_000);
  // Resolved once up front so a bad credential fails loudly here rather than
  // surfacing later as an unexplained export failure inside the exporter.
  token = await resolveAuthToken();
});

afterAll(() => {
  document.body.innerHTML = "";
});

/** Mount the provider exactly as a data app does, run `emit`, then unmount. */
async function mountAndEmit(
  emit: (events: ReturnType<typeof useTetraEvents>) => void,
  extra: Record<string, unknown> = {},
) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  function Emitter() {
    const events = useTetraEvents();
    useEffect(() => {
      emit(events);
    }, [events]);
    return null;
  }

  await act(async () => {
    root.render(
      <TelemetryProvider
        artifact={env.artifact}
        orgSlug={env.orgSlug}
        logsUrl={`${env.tdpEndpoint}/v1/otlp/logs`}
        getAuthToken={() => token}
        enabled
        {...extra}
      >
        <Emitter />
      </TelemetryProvider>,
    );
  });

  // Unmount shuts the provider down, which flushes on the way out — the same
  // path a real app takes when the user navigates away.
  await act(async () => {
    root.unmount();
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  });
  container.remove();
}

describe("the React bindings deliver through the real pipeline", () => {
  test("a tracked event from a mounted provider reaches CloudWatch", async () => {
    const marker = `${RUN_ID}-uikit`;
    await mountAndEmit((events) => events.trackEvent("App:Page:View", { run_id: marker, rows: 7 }));

    const record = await waitForEventContaining(marker, windowStart.getTime());

    // Content, not mere arrival: the gateway stamps the authenticated org
    // over anything the producer asserts, and the bindings must carry the
    // artifact identity through from props for the read layer to scope on.
    expect(record).toContain(marker);
    expect(record).toContain(env.orgSlug);
    expect(record).toContain(env.artifact.slug);
  });

  test("identity attached at the binding layer never survives the boundary", async () => {
    const marker = `${RUN_ID}-uikit-pii`;
    await mountAndEmit((events) =>
      events.trackEvent("App:Page:View", {
        run_id: marker,
        userEmail: "uikit-probe@example.com",
      }),
    );

    const record = await waitForEventContaining(marker, windowStart.getTime());
    expect(record).not.toContain("uikit-probe@example.com");
  });

  test("a counter from the bindings publishes datapoints", async () => {
    const slug = `${env.artifact.slug}-uikit`;
    // Three emits with the provider remounted between them: awsemf drops the
    // first datapoint of a cumulative series, so a single mount could never
    // publish anything.
    for (let i = 0; i < 3; i++) {
      await mountAndEmit((events) => events.counter("app.errors", 1, { "exception.type": "UiKitProbe" }), {
        artifact: { ...env.artifact, slug },
        metrics: { enabled: true, metricsUrl: `${env.tdpEndpoint}/v1/otlp/metrics`, exportIntervalMillis: 10_000 },
      });
      await new Promise((resolve) => setTimeout(resolve, 15_000));
    }

    const total = await waitForMetricDatapoints(
      "app.errors",
      {
        "ts.org": env.orgSlug,
        "service.namespace": env.artifact.namespace,
        "ts.artifact.slug": slug,
      },
      windowStart,
    );
    expect(total).toBeGreaterThan(0);
  });
});
