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

    // ONE mount, incremented over time — NOT three mounts.
    //
    // Each mount builds a fresh client with a fresh cumulative series, so
    // emitting once per mount makes every export the FIRST datapoint of a new
    // series — and awsemf drops exactly that when converting cumulative sums to
    // deltas. Three mounts therefore publish nothing at all, which is how the
    // first version of this test failed: a 180s timeout with no datapoints,
    // indistinguishable from a broken lane.
    let emit: ((n: number) => void) | undefined;
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    function Counter() {
      const { counter } = useTetraEvents();
      useEffect(() => {
        emit = (n) => counter("app.errors", n, { "exception.type": "UiKitProbe" });
      }, [counter]);
      return null;
    }

    await act(async () => {
      root.render(
        <TelemetryProvider
          artifact={{ ...env.artifact, slug }}
          orgSlug={env.orgSlug}
          logsUrl={`${env.tdpEndpoint}/v1/otlp/logs`}
          getAuthToken={() => token}
          enabled
          metrics={{
            enabled: true,
            metricsUrl: `${env.tdpEndpoint}/v1/otlp/metrics`,
            // The hook exposes no flush, so the periodic reader is what drives
            // export here. Shortened so several exports land inside the run.
            exportIntervalMillis: 10_000,
          }}
        >
          <Counter />
        </TelemetryProvider>,
      );
    });

    // Increment across several reader intervals so the collector sees a series
    // that ADVANCES: the first export establishes it, later ones yield deltas.
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        emit!(1);
        await new Promise((resolve) => setTimeout(resolve, 15_000));
      });
    }
    await act(async () => {
      root.unmount();
      await new Promise((resolve) => setTimeout(resolve, 3_000));
    });
    container.remove();

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

  test("a span started through the bindings reaches aws/spans", async () => {
    // The bindings expose startSpan/withSpan, and the traces lane is a third
    // destination that neither of the assertions above touches. Worth its own
    // check here rather than trusting delegation: `counter` WAS delegated by
    // the facade and still missing from the hook's returned object, so "the
    // core implements it" has already proven insufficient once in this file's
    // own subject matter.
    const spanName = `E2eUiKitSpan-${RUN_ID}`;
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    function Spanner() {
      const { withSpan } = useTetraEvents();
      useEffect(() => {
        withSpan(spanName, () => undefined);
      }, [withSpan]);
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
          tracing={{
            enabled: true,
            tracesUrl: `${env.tdpEndpoint}/v1/otlp/traces`,
            // Every span, so the assertion never races the sampler.
            sampleRatio: 1,
          }}
        >
          <Spanner />
        </TelemetryProvider>,
      );
    });
    // Unmount flushes the span processor on the way out.
    await act(async () => {
      root.unmount();
      await new Promise((resolve) => setTimeout(resolve, 3_000));
    });
    container.remove();

    const record = await waitForSpanNamed(spanName, windowStart.getTime());
    expect(record).toContain(spanName);
    expect(record).toContain(env.orgSlug);
  });

  // The other three instruments. `counter` was missing from the hook entirely
  // while these three were present, so the inverse omission is just as
  // possible — and awsemf treats the kinds differently (a gauge is a LastValue
  // that publishes immediately; a histogram carries buckets; an upDownCounter
  // is a non-monotonic Sum subject to the same delta conversion as counter).
  for (const [instrument, metricName] of [
    ["gauge", "app.queue_depth"],
    ["histogram", "app.request_duration"],
    ["upDownCounter", "app.active_sessions"],
  ] as const) {
    test(`${instrument} from the bindings publishes datapoints`, async () => {
      const slug = `${env.artifact.slug}-${instrument.toLowerCase()}`;
      let emit: ((n: number) => void) | undefined;
      const container = document.createElement("div");
      document.body.appendChild(container);
      const root = createRoot(container);

      function Emitter() {
        const events = useTetraEvents();
        useEffect(() => {
          emit = (n) => events[instrument](metricName, n, { phase: "e2e" });
        }, [events]);
        return null;
      }

      await act(async () => {
        root.render(
          <TelemetryProvider
            artifact={{ ...env.artifact, slug }}
            orgSlug={env.orgSlug}
            logsUrl={`${env.tdpEndpoint}/v1/otlp/logs`}
            getAuthToken={() => token}
            enabled
            metrics={{
              enabled: true,
              metricsUrl: `${env.tdpEndpoint}/v1/otlp/metrics`,
              exportIntervalMillis: 10_000,
            }}
          >
            <Emitter />
          </TelemetryProvider>,
        );
      });

      // One mount, a value that changes across reader intervals — same reason
      // as the counter test: a series that does not advance publishes nothing.
      for (let i = 1; i <= 3; i++) {
        await act(async () => {
          emit!(i);
          await new Promise((resolve) => setTimeout(resolve, 15_000));
        });
      }
      await act(async () => {
        root.unmount();
        await new Promise((resolve) => setTimeout(resolve, 3_000));
      });
      container.remove();

      const total = await waitForMetricDatapoints(
        metricName,
        {
          "ts.org": env.orgSlug,
          "service.namespace": env.artifact.namespace,
          "ts.artifact.slug": slug,
        },
        windowStart,
      );
      expect(total).not.toBeUndefined();
    });
  }
});
