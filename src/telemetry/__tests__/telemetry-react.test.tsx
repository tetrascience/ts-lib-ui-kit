import { NOOP_SPAN } from "@tetrascience-npm/request/telemetry";
import { StrictMode, act, useEffect, useRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  TSErrorBoundary,
  TelemetryEvent,
  TelemetryProvider,
  installGlobalErrorHandlers,
  useTelemetryClient,
  useTetraEvents,
} from "..";
import { createTelemetryFacade } from "../facade";
import { readHostFlag, resolveArtifact } from "../telemetry-provider";
import { __resetTelemetryWarningForTests } from "../use-tetra-events";

import { ARTIFACT, RecordingProcessor, renderTree } from "./helpers";

import type { Telemetry, TetraSpan } from "@tetrascience-npm/request/telemetry";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let processor: RecordingProcessor;

beforeEach(() => {
  processor = new RecordingProcessor();
  __resetTelemetryWarningForTests();
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

function Provider({ children, ...props }: Record<string, unknown> & { children?: React.ReactNode }) {
  return (
    <TelemetryProvider artifact={ARTIFACT} orgSlug="acme" processors={[processor]} {...props}>
      {children}
    </TelemetryProvider>
  );
}

/** Emits once on mount through the hook. */
function EmitOnMount({ name = "App:Page:View" }: { name?: string }) {
  const { trackEvent } = useTetraEvents();
  useEffect(() => {
    trackEvent(name, { rows: 42 });
  }, [trackEvent, name]);
  return <span>ready</span>;
}

describe("TelemetryProvider", () => {
  test("builds a per-instance client and emits the product-event contract", () => {
    const tree = renderTree(
      <Provider>
        <EmitOnMount />
      </Provider>,
    );

    expect(processor.records).toHaveLength(1);
    const [record] = processor.records;
    expect(record.eventName).toBe("App:Page:View");
    expect(record.attributes["tetra.signal_type"]).toBe("product_event");
    expect(record.attributes["ts.artifact.slug"]).toBe("sandbox");
    expect(record.attributes["ts.org"]).toBe("acme");
    expect(record.attributes["rows"]).toBe(42);
    tree.unmount();
  });

  test("records emitted by child effects before the provider effect are replayed, not lost", () => {
    // Child effects run before the parent's — the façade buffers that window.
    renderTree(
      <Provider>
        <EmitOnMount name="App:Early" />
      </Provider>,
    );

    expect(processor.names()).toEqual(["App:Early"]);
  });

  test("falls back to the manifest field-by-field for missing host identity", () => {
    const tree = renderTree(
      <Provider artifact={{ slug: "sandbox" }} manifest={{ namespace: "common", slug: "other", version: "9.9.9" }}>
        <EmitOnMount />
      </Provider>,
    );

    const [record] = processor.records;
    expect(record.attributes["service.namespace"]).toBe("common");
    expect(record.attributes["ts.artifact.slug"]).toBe("sandbox");
    expect(record.attributes["service.version"]).toBe("9.9.9");
    tree.unmount();
  });

  test("shuts the pipeline down (flushing) on unmount", async () => {
    const tree = renderTree(
      <Provider>
        <EmitOnMount />
      </Provider>,
    );
    expect(processor.shutdowns).toBe(0);

    tree.unmount();
    await vi.waitFor(() => expect(processor.shutdowns).toBe(1));
  });

  test("rebuilds the client when identity changes and disposes the old one", async () => {
    let client!: ReturnType<typeof useTelemetryClient>;
    function Capture() {
      client = useTelemetryClient();
      return null;
    }
    const tree = renderTree(
      <Provider orgSlug="acme">
        <Capture />
      </Provider>,
    );
    client.trackEvent("App:Before");

    tree.rerender(
      <Provider orgSlug="globex">
        <Capture />
      </Provider>,
    );
    client.trackEvent("App:After");

    await vi.waitFor(() => expect(processor.shutdowns).toBe(1));
    expect(processor.records[0].attributes["ts.org"]).toBe("acme");
    expect(processor.records[1].attributes["ts.org"]).toBe("globex");
    tree.unmount();
  });
});

describe("enable / disable", () => {
  test("enabled={false} builds no pipeline: no records, no provider to shut down", () => {
    const tree = renderTree(
      <Provider enabled={false}>
        <EmitOnMount />
      </Provider>,
    );

    expect(processor.records).toHaveLength(0);
    tree.unmount();
    expect(processor.shutdowns).toBe(0);
  });

  test("reads the host-provided config flag when the prop is omitted", () => {
    vi.stubGlobal("env");
    (window as { env?: Record<string, unknown> }).env = { TELEMETRY_ENABLED: "false" };

    renderTree(
      <Provider>
        <EmitOnMount />
      </Provider>,
    );

    expect(processor.records).toHaveLength(0);
    delete (window as { env?: Record<string, unknown> }).env;
  });

  test("an explicit prop beats the host config flag", () => {
    (window as { env?: Record<string, unknown> }).env = { TELEMETRY_ENABLED: false };

    renderTree(
      <Provider enabled>
        <EmitOnMount />
      </Provider>,
    );

    expect(processor.records).toHaveLength(1);
    delete (window as { env?: Record<string, unknown> }).env;
  });
});

// The façade is the stable context value: it buffers records emitted before the
// provider's effect attaches a client, then replays them exactly once.
describe("createTelemetryFacade", () => {
  function makeClient() {
    const client = {
      trackEvent: vi.fn(),
      trackError: vi.fn(),
      startSpan: vi.fn(() => NOOP_SPAN),
      // Runs the callback, like the real one: a facade that silently skipped
      // it would change application control flow, so the mock must not hide
      // that by being a bare stub.
      withSpan: vi.fn((_name: string, fn: (span: TetraSpan) => unknown) => fn(NOOP_SPAN)),
      flush: vi.fn(async () => {}),
      shutdown: vi.fn(async () => {}),
    };
    // `vi.fn` cannot express withSpan's generic <T>, so the object is not
    // structurally assignable to Telemetry even though every member is right.
    return client as typeof client & Telemetry;
  }

  test("buffers both record kinds before attach and replays them in order", () => {
    const facade = createTelemetryFacade();
    facade.trackEvent("A", { a: 1 }, { body: true });
    facade.trackError(new Error("C"));

    const client = makeClient();
    facade.attach(client);

    expect(client.trackEvent).toHaveBeenCalledWith("A", { a: 1 }, { body: true });
    expect(client.trackError).toHaveBeenCalledWith(expect.any(Error), undefined);
  });

  test("drains the buffer exactly once, so a re-attach cannot replay it", () => {
    const facade = createTelemetryFacade();
    facade.trackEvent("Once");

    const first = makeClient();
    facade.attach(first);
    const second = makeClient();
    facade.attach(second);

    expect(first.trackEvent).toHaveBeenCalledTimes(1);
    expect(second.trackEvent).not.toHaveBeenCalled();
  });

  test("forwards straight through once a client is attached", () => {
    const facade = createTelemetryFacade();
    const client = makeClient();
    facade.attach(client);

    facade.trackEvent("A");
    facade.trackError(new Error("C"));

    expect(client.trackEvent).toHaveBeenCalledTimes(1);
    expect(client.trackError).toHaveBeenCalledTimes(1);
  });

  // StrictMode / rapid identity changes can run an old cleanup after the new
  // client attached; detaching the stale client must not orphan the live one.
  test("an out-of-order detach of a stale client leaves the newer one attached", () => {
    const facade = createTelemetryFacade();
    const stale = makeClient();
    const live = makeClient();
    facade.attach(stale);
    facade.attach(live);

    facade.detach(stale);
    facade.trackEvent("Still:Routed");

    expect(live.trackEvent).toHaveBeenCalledWith("Still:Routed", undefined, undefined);
  });

  test("after detaching the live client, records buffer again rather than throw", async () => {
    const facade = createTelemetryFacade();
    const client = makeClient();
    facade.attach(client);
    facade.detach(client);

    expect(() => facade.trackEvent("Buffered:Again")).not.toThrow();
    await expect(facade.flush()).resolves.toBeUndefined();
    await expect(facade.shutdown()).resolves.toBeUndefined();
  });

  test("the pending buffer is bounded so a provider-less app cannot leak memory", () => {
    const facade = createTelemetryFacade();
    for (let index = 0; index < 500; index += 1) facade.trackEvent(`E`);

    const client = makeClient();
    facade.attach(client);

    // MAX_PENDING is 50; the excess is dropped rather than retained.
    expect(client.trackEvent).toHaveBeenCalledTimes(50);
  });

  test("flush and shutdown are safe before any client attaches", async () => {
    const facade = createTelemetryFacade();
    await expect(facade.flush()).resolves.toBeUndefined();
    await expect(facade.shutdown()).resolves.toBeUndefined();
  });

  test("flush and shutdown delegate to the attached client", async () => {
    const facade = createTelemetryFacade();
    const client = makeClient();
    facade.attach(client);

    await facade.flush();
    await facade.shutdown();

    expect(client.flush).toHaveBeenCalledTimes(1);
    expect(client.shutdown).toHaveBeenCalledTimes(1);
  });
});

describe("readHostFlag", () => {
  afterEach(() => {
    delete (window as { env?: Record<string, unknown> }).env;
  });

  test.each([
    ["true", true],
    ["TRUE", true],
    ["1", true],
    ["yes", true],
    ["false", false],
    ["0", false],
    ["no", false],
  ])("parses the templated string %s as %s", (raw, expected) => {
    (window as { env?: Record<string, unknown> }).env = { FLAG: raw };
    expect(readHostFlag("FLAG")).toBe(expected);
  });

  test("passes real booleans through", () => {
    (window as { env?: Record<string, unknown> }).env = { FLAG: true };
    expect(readHostFlag("FLAG")).toBe(true);
  });

  // Undefined (not false) so the caller's own default wins — an unparseable or
  // missing host value must not be read as an explicit opt-out.
  test.each([
    ["an unrecognised string", "maybe"],
    ["a number", 1],
    ["null", null],
  ])("returns undefined for %s", (_label, value) => {
    (window as { env?: Record<string, unknown> }).env = { FLAG: value };
    expect(readHostFlag("FLAG")).toBeUndefined();
  });

  test("returns undefined when window.env is absent entirely", () => {
    expect(readHostFlag("FLAG")).toBeUndefined();
  });

  // SSR / non-browser runtime: no window to read config from.
  test("returns undefined when there is no window at all", () => {
    const original = globalThis.window;
    // @ts-expect-error deliberately simulating a non-browser runtime
    delete globalThis.window;
    try {
      expect(readHostFlag("FLAG")).toBeUndefined();
    } finally {
      globalThis.window = original;
    }
  });
});

describe("resolveArtifact", () => {
  const manifest = { namespace: "common", slug: "sandbox", version: "9.9.9" };

  test("merges host props over the manifest field by field", () => {
    expect(resolveArtifact({ version: "1.2.3" }, manifest)).toEqual({
      namespace: "common",
      slug: "sandbox",
      version: "1.2.3",
    });
  });

  // Incomplete identity yields undefined so the core omits ts.artifact.*
  // entirely rather than emitting a partial or placeholder identity.
  test.each([
    ["namespace missing", { slug: "s", version: "1" }],
    ["slug missing", { namespace: "n", version: "1" }],
    ["version missing", { namespace: "n", slug: "s" }],
    ["nothing at all", {}],
  ])("returns undefined when %s", (_label, partial) => {
    expect(resolveArtifact(partial)).toBeUndefined();
  });

  test("returns undefined when both sides are undefined", () => {
    expect(resolveArtifact()).toBeUndefined();
  });

  test("falls back to the manifest entirely when no host props are given", () => {
    expect(resolveArtifact(undefined, manifest)).toEqual(manifest);
  });
});

describe("provider with only the minimum configuration", () => {
  // Exercises the identity-key's null fallbacks: no orgSlug, no logsUrl, no
  // artifact. The client must still build and emit the contract attributes.
  test("emits with no orgSlug, no logsUrl and no artifact", () => {
    function Bare() {
      const { trackEvent } = useTetraEvents();
      useEffect(() => trackEvent("App:Minimal"), [trackEvent]);
      return null;
    }
    renderTree(
      <TelemetryProvider processors={[processor]}>
        <Bare />
      </TelemetryProvider>,
    );

    expect(processor.names()).toEqual(["App:Minimal"]);
    const [record] = processor.records;
    expect(record.attributes["tetra.signal_type"]).toBe("product_event");
    expect(record.attributes).not.toHaveProperty("ts.org");
    expect(Object.keys(record.attributes).filter((key) => key.startsWith("ts.artifact."))).toEqual([]);
  });

  test("does not rebuild the client when an unrelated prop object changes identity", () => {
    const tree = renderTree(
      <TelemetryProvider artifact={ARTIFACT} orgSlug="acme" processors={[processor]} logger={{ ...console }}>
        <EmitOnMount />
      </TelemetryProvider>,
    );
    // A fresh logger object each render must not count as an identity change.
    tree.rerender(
      <TelemetryProvider artifact={ARTIFACT} orgSlug="acme" processors={[processor]} logger={{ ...console }}>
        <EmitOnMount />
      </TelemetryProvider>,
    );

    expect(processor.shutdowns).toBe(0);
  });
});

describe("debug exporter mode", () => {
  test("debug routes records to the stock console exporter as well as the pipeline", () => {
    const dir = vi.spyOn(console, "dir").mockImplementation(() => {});

    renderTree(
      <Provider debug>
        <EmitOnMount />
      </Provider>,
    );

    expect(processor.records).toHaveLength(1);
    expect(dir).toHaveBeenCalledTimes(1);
    const [printed] = dir.mock.calls[0] as [Record<string, unknown>];
    expect(printed.eventName).toBe("App:Page:View");
  });

  test("is off by default", () => {
    const dir = vi.spyOn(console, "dir").mockImplementation(() => {});

    renderTree(
      <Provider>
        <EmitOnMount />
      </Provider>,
    );

    expect(dir).not.toHaveBeenCalled();
  });

  test("reads the host-provided debug flag", () => {
    const dir = vi.spyOn(console, "dir").mockImplementation(() => {});
    (window as { env?: Record<string, unknown> }).env = { TELEMETRY_DEBUG: "true" };

    renderTree(
      <Provider>
        <EmitOnMount />
      </Provider>,
    );

    expect(dir).toHaveBeenCalledTimes(1);
    delete (window as { env?: Record<string, unknown> }).env;
  });
});

describe("useTetraEvents", () => {
  test("returns stable identities across re-renders", () => {
    const seen: unknown[] = [];
    function Probe() {
      const events = useTetraEvents();
      const first = useRef(events);
      seen.push(events === first.current);
      return null;
    }
    const tree = renderTree(
      <Provider>
        <Probe />
      </Provider>,
    );

    tree.rerender(
      <Provider>
        <Probe />
      </Provider>,
    );

    expect(seen).toEqual([true, true]);
  });

  test("counting is one record per call — no magnitude attribute", () => {
    function Counting() {
      const { trackEvent } = useTetraEvents();
      useEffect(() => {
        trackEvent("App:Calculation:Execute", { kind: "mean" });
        trackEvent("App:Calculation:Execute", { kind: "mean" });
      }, [trackEvent]);
      return null;
    }
    renderTree(
      <Provider>
        <Counting />
      </Provider>,
    );

    expect(processor.names()).toEqual(["App:Calculation:Execute", "App:Calculation:Execute"]);
    expect(processor.records[0].attributes["kind"]).toBe("mean");
    expect(processor.attributeKeys()).not.toContain("event.value");
  });

  test("outside a provider it no-ops with a single development warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() =>
      renderTree(
        <>
          <EmitOnMount />
          <EmitOnMount name="App:Second" />
        </>,
      ),
    ).not.toThrow();

    expect(processor.records).toHaveLength(0);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("outside <TelemetryProvider>");
  });
});

describe("TSErrorBoundary", () => {
  function Boom(): JSX.Element {
    throw new Error("render exploded");
  }

  beforeEach(() => {
    // React logs caught render errors; keep the suite output readable.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  test("emits a stable-named error event with the component stack and renders the fallback", () => {
    const tree = renderTree(
      <Provider>
        <TSErrorBoundary fallback={<span>fallback shown</span>}>
          <Boom />
        </TSErrorBoundary>
      </Provider>,
    );

    expect(tree.text()).toBe("fallback shown");
    expect(processor.records).toHaveLength(1);
    const [record] = processor.records;
    expect(record.eventName).toBe(TelemetryEvent.ReactError);
    expect(record.attributes["error.source"]).toBe("react");
    expect(record.attributes["exception.type"]).toBe("Error");
    expect(record.attributes["exception.message"]).toBe("render exploded");
    expect(String(record.attributes["react.component_stack"])).toContain("Boom");
  });

  test("truncates the component stack and the exception message", () => {
    function LongBoom(): JSX.Element {
      throw new Error("x".repeat(5000));
    }
    renderTree(
      <Provider>
        <TSErrorBoundary fallback={null}>
          <LongBoom />
        </TSErrorBoundary>
      </Provider>,
    );

    const [record] = processor.records;
    expect((record.attributes["exception.message"] as string).length).toBe(2000);
    expect((record.attributes["react.component_stack"] as string).length).toBeLessThanOrEqual(4000);
  });

  test("supports a render-prop fallback with reset", () => {
    function Flaky({ shouldThrow }: { shouldThrow: boolean }): JSX.Element {
      if (shouldThrow) throw new Error("boom");
      return <span>recovered</span>;
    }
    function Harness() {
      const [shouldThrow, setShouldThrow] = useState(true);
      return (
        <TSErrorBoundary
          fallback={(error, reset) => (
            <button
              onClick={() => {
                setShouldThrow(false);
                reset();
              }}
            >
              retry: {error.message}
            </button>
          )}
        >
          <Flaky shouldThrow={shouldThrow} />
        </TSErrorBoundary>
      );
    }
    const tree = renderTree(
      <Provider>
        <Harness />
      </Provider>,
    );
    expect(tree.text()).toContain("retry: boom");

    act(() => {
      tree.container.querySelector("button")?.click();
    });

    expect(tree.text()).toBe("recovered");
  });

  // A boundary mounted outside any provider must still contain the error and
  // render its fallback — telemetry is best-effort, never load-bearing.
  test("outside a provider it still catches, renders the fallback, and does not throw", () => {
    const tree = renderTree(
      <TSErrorBoundary fallback={<span>contained</span>}>
        <Boom />
      </TSErrorBoundary>,
    );

    expect(tree.text()).toBe("contained");
    expect(processor.records).toHaveLength(0);
  });

  test("renders nothing when no fallback is supplied", () => {
    const tree = renderTree(
      <Provider>
        <TSErrorBoundary>
          <Boom />
        </TSErrorBoundary>
      </Provider>,
    );

    expect(tree.text()).toBe("");
    expect(processor.records).toHaveLength(1);
  });

  // React's ErrorInfo types componentStack as possibly null. The boundary must
  // emit an empty string, never the literal "null". Driven through the real
  // componentDidCatch on a mounted instance.
  test("tolerates a null component stack", () => {
    const ref = { current: null as TSErrorBoundary | null };
    renderTree(
      <Provider>
        <TSErrorBoundary ref={ref}>
          <span>fine</span>
        </TSErrorBoundary>
      </Provider>,
    );

    act(() => {
      ref.current?.componentDidCatch(new Error("x"), { componentStack: null } as never);
    });

    const [record] = processor.records;
    expect(record.attributes["react.component_stack"]).toBe("");
  });

  // SW-2470 (H1). componentDidCatch runs during React's commit phase: a throw
  // here is not caught by this boundary or any other, so the containment
  // boundary would become the crash. React types `error` as Error, but the
  // value is whatever the child threw — `throw null`, `throw Object.create(null)`
  // and a hostile toString are all reachable.
  test("a hostile thrown value in componentDidCatch does not escape the boundary", () => {
    const ref = { current: null as TSErrorBoundary | null };
    renderTree(
      <Provider>
        <TSErrorBoundary ref={ref}>
          <span>fine</span>
        </TSErrorBoundary>
      </Provider>,
    );

    const hostile = {
      toString() {
        throw new Error("hostile toString");
      },
    } as unknown as Error;

    expect(() =>
      act(() => {
        ref.current?.componentDidCatch(hostile, { componentStack: "at Boom" } as never);
      }),
    ).not.toThrow();
    expect(processor.records).toHaveLength(1);
    expect(processor.records[0].attributes["exception.message"]).toBe("[unstringifiable]");
  });

  test("merges caller attributes and honours the event name override", () => {
    renderTree(
      <Provider>
        <TSErrorBoundary eventName="App:Custom:Crash" attributes={{ surface: "chat" }} fallback={<span>f</span>}>
          <Boom />
        </TSErrorBoundary>
      </Provider>,
    );

    const [record] = processor.records;
    expect(record.eventName).toBe("App:Custom:Crash");
    expect(record.attributes.surface).toBe("chat");
    expect(record.attributes["error.source"]).toBe("react");
  });

  test("invokes the onError escape hatch with the error and the info", () => {
    const onError = vi.fn();
    renderTree(
      <Provider>
        <TSErrorBoundary onError={onError} fallback={<span>f</span>}>
          <Boom />
        </TSErrorBoundary>
      </Provider>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][1]).toHaveProperty("componentStack");
  });
});

describe("installGlobalErrorHandlers", () => {
  function Handlers({ options }: { options?: Record<string, unknown> }) {
    const client = useTelemetryClient();
    useEffect(() => installGlobalErrorHandlers(client, options), [client, options]);
    return null;
  }

  test("captures window errors and unhandled rejections with stable names", () => {
    renderTree(
      <Provider>
        <Handlers />
      </Provider>,
    );

    window.dispatchEvent(new ErrorEvent("error", { error: new Error("uncaught"), message: "uncaught" }));
    window.dispatchEvent(new Event("unhandledrejection") as PromiseRejectionEvent);

    expect(processor.names()).toEqual([TelemetryEvent.WindowError, TelemetryEvent.UnhandledRejection]);
    expect(processor.records[0].attributes["exception.message"]).toBe("uncaught");
  });

  // SW-2470 (H1). `event.reason` is whatever was rejected with, so
  // `Promise.reject(Object.create(null))` reaches trackError directly. Before
  // the fix the stringification ran outside emit's guard and threw back into
  // the browser's rejection dispatch.
  test("a hostile rejection reason is recorded, not rethrown", () => {
    renderTree(
      <Provider>
        <Handlers />
      </Provider>,
    );

    const event = new Event("unhandledrejection") as PromiseRejectionEvent;
    Object.defineProperty(event, "reason", { value: Object.create(null) });

    expect(() => window.dispatchEvent(event)).not.toThrow();
    expect(processor.names()).toEqual([TelemetryEvent.UnhandledRejection]);
    expect(processor.records[0].attributes["exception.message"]).toBe("[unstringifiable]");
  });

  test("is idempotent per client and returns the original uninstall", () => {
    let client!: ReturnType<typeof useTelemetryClient>;
    function Capture() {
      client = useTelemetryClient();
      return null;
    }
    renderTree(
      <Provider>
        <Capture />
      </Provider>,
    );

    const first = installGlobalErrorHandlers(client);
    const second = installGlobalErrorHandlers(client);
    expect(second).toBe(first);

    window.dispatchEvent(new ErrorEvent("error", { error: new Error("once"), message: "once" }));
    expect(processor.records).toHaveLength(1);

    first();
    second();
    window.dispatchEvent(new ErrorEvent("error", { error: new Error("after"), message: "after" }));
    expect(processor.records).toHaveLength(1);
  });

  test("uninstalls when the component unmounts", () => {
    const tree = renderTree(
      <Provider>
        <Handlers />
      </Provider>,
    );
    tree.unmount();

    window.dispatchEvent(new ErrorEvent("error", { error: new Error("late"), message: "late" }));

    expect(processor.records).toHaveLength(0);
  });

  // Some browsers deliver an ErrorEvent with no `error` object (cross-origin
  // scripts most notably), leaving only the message string.
  test("falls back to the message when the ErrorEvent carries no error object", () => {
    let client!: ReturnType<typeof useTelemetryClient>;
    function Capture() {
      client = useTelemetryClient();
      return null;
    }
    renderTree(
      <Provider>
        <Capture />
      </Provider>,
    );
    const uninstall = installGlobalErrorHandlers(client);

    window.dispatchEvent(new ErrorEvent("error", { message: "script error" }));

    const [record] = processor.records;
    expect(record.eventName).toBe(TelemetryEvent.WindowError);
    expect(record.attributes["exception.message"]).toBe("script error");
    // A bare string has no stack to attach.
    expect(record.attributes).not.toHaveProperty("exception.stacktrace");
    uninstall();
  });

  test("honours event-name overrides and merged attributes on both handlers", () => {
    let client!: ReturnType<typeof useTelemetryClient>;
    function Capture() {
      client = useTelemetryClient();
      return null;
    }
    renderTree(
      <Provider>
        <Capture />
      </Provider>,
    );
    const uninstall = installGlobalErrorHandlers(client, {
      windowErrorEventName: "App:Win",
      unhandledRejectionEventName: "App:Rej",
      attributes: { surface: "root" },
    });

    window.dispatchEvent(new ErrorEvent("error", { error: new Error("a"), message: "a" }));
    window.dispatchEvent(new Event("unhandledrejection") as PromiseRejectionEvent);

    expect(processor.names()).toEqual(["App:Win", "App:Rej"]);
    expect(processor.records.every((record) => record.attributes.surface === "root")).toBe(true);
    expect(processor.records[0].attributes["error.source"]).toBe("window");
    expect(processor.records[1].attributes["error.source"]).toBe("unhandledrejection");
    uninstall();
  });

  // Two federated apps share `window`; each installs handlers for its OWN
  // client, and both must receive the event.
  test("two clients each install independently and both capture", () => {
    const other = new RecordingProcessor();
    let clientA!: ReturnType<typeof useTelemetryClient>;
    let clientB!: ReturnType<typeof useTelemetryClient>;
    function CaptureA() {
      clientA = useTelemetryClient();
      return null;
    }
    function CaptureB() {
      clientB = useTelemetryClient();
      return null;
    }
    renderTree(
      <>
        <Provider>
          <CaptureA />
        </Provider>
        <TelemetryProvider artifact={ARTIFACT} processors={[other]}>
          <CaptureB />
        </TelemetryProvider>
      </>,
    );

    const uninstallA = installGlobalErrorHandlers(clientA);
    const uninstallB = installGlobalErrorHandlers(clientB);
    expect(uninstallB).not.toBe(uninstallA);

    window.dispatchEvent(new ErrorEvent("error", { error: new Error("shared"), message: "shared" }));

    expect(processor.records).toHaveLength(1);
    expect(other.records).toHaveLength(1);

    // Uninstalling one must not deafen the other.
    uninstallA();
    window.dispatchEvent(new ErrorEvent("error", { error: new Error("second"), message: "second" }));
    expect(processor.records).toHaveLength(1);
    expect(other.records).toHaveLength(2);
    uninstallB();
  });

  test("outside a browser runtime it installs nothing and the uninstall is safe", () => {
    const client = {
      trackEvent: vi.fn(),
      trackError: vi.fn(),
      startSpan: vi.fn(() => NOOP_SPAN),
      withSpan: vi.fn((_name: string, fn: (span: TetraSpan) => unknown) => fn(NOOP_SPAN)),
      flush: async () => {},
      shutdown: async () => {},
    } as unknown as Telemetry & { trackError: ReturnType<typeof vi.fn> };
    const original = globalThis.window;
    // @ts-expect-error deliberately simulating a non-browser runtime
    delete globalThis.window;
    try {
      const uninstall = installGlobalErrorHandlers(client);
      expect(() => uninstall()).not.toThrow();
      expect(client.trackError).not.toHaveBeenCalled();
    } finally {
      globalThis.window = original;
    }
  });
});

describe("useTetraEvents outside a provider", () => {
  test("suppresses the development warning in production builds", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "production");
    __resetTelemetryWarningForTests();

    function Bare() {
      const { trackEvent } = useTetraEvents();
      useEffect(() => trackEvent("App:Dropped"), [trackEvent]);
      return null;
    }
    expect(() => renderTree(<Bare />)).not.toThrow();

    expect(warn).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  test("both emitters no-op without a provider", () => {
    function Bare() {
      const { trackEvent, trackError } = useTetraEvents();
      useEffect(() => {
        trackEvent("App:A");
        trackError(new Error("b"));
      }, [trackEvent, trackError]);
      return <span>ok</span>;
    }
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const tree = renderTree(<Bare />);

    expect(tree.text()).toBe("ok");
    expect(processor.records).toHaveLength(0);
  });
});

describe("no client-side user identity", () => {
  test("no emitted attribute carries user identity, from any capture path", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    function Boom(): JSX.Element {
      throw new Error("render exploded");
    }
    function Everything() {
      const client = useTelemetryClient();
      const { trackEvent, trackError } = useTetraEvents();
      useEffect(() => installGlobalErrorHandlers(client), [client]);
      useEffect(() => {
        // A caller trying to attach identity anyway: it must be stripped.
        trackEvent("App:Page:View", { userEmail: "dboersma@tetrascience.com", sessionToken: "abc", rows: 1 });
        trackError(new Error("api failed"), { attributes: { user_email: "dboersma@tetrascience.com" } });
      }, [trackEvent, trackError]);
      return (
        <TSErrorBoundary fallback={null}>
          <Boom />
        </TSErrorBoundary>
      );
    }

    renderTree(
      <Provider>
        <Everything />
      </Provider>,
    );
    window.dispatchEvent(new ErrorEvent("error", { error: new Error("uncaught"), message: "uncaught" }));

    expect(processor.records.length).toBeGreaterThanOrEqual(4);
    const keys = processor.attributeKeys();
    expect(keys.filter((key) => key.startsWith("ts.user."))).toHaveLength(0);
    expect(keys.filter((key) => /email|token|user/i.test(key))).toHaveLength(0);
    const values = processor.records.flatMap((record) => Object.values(record.attributes)).map(String);
    // No email-shaped value may survive, whatever the domain. Broader than the
    // `includes("tetrascience.com")` this replaces, and it does not read as URL
    // host validation: CodeQL flags a bare hostname `includes()` as
    // js/incomplete-url-substring-sanitization, but nothing here parses a URL.
    expect(values.some((value) => /@[a-z0-9.-]+\.[a-z]{2,}/i.test(value))).toBe(false);
  });
});

describe("StrictMode", () => {
  test("double-mount leaves exactly one live client and does not double-emit", async () => {
    renderTree(
      <StrictMode>
        <Provider>
          <EmitOnMount />
        </Provider>
      </StrictMode>,
    );

    // StrictMode runs child effects twice, so the child emits twice — but the
    // two records must come from ONE live client, and the first client must be
    // shut down exactly once (no leaked provider, no dead client swallowing).
    await vi.waitFor(() => expect(processor.shutdowns).toBe(1));
    expect(processor.names()).toEqual(["App:Page:View", "App:Page:View"]);
  });

  test("the client still works after the StrictMode remount cycle", () => {
    let client!: ReturnType<typeof useTelemetryClient>;
    function Capture() {
      client = useTelemetryClient();
      return null;
    }
    renderTree(
      <StrictMode>
        <Provider>
          <Capture />
        </Provider>
      </StrictMode>,
    );

    client.trackEvent("App:After:Remount");

    expect(processor.names()).toContain("App:After:Remount");
  });
});

// SW-2478: the provider has to FORWARD tracing config, and has to rebuild when
// it changes. Both were missing on the first pass and neither is visible from
// the outside — the app just silently has no spans.
describe("TelemetryProvider tracing wiring", () => {
  test("forwards tracing options to the client", () => {
    let client!: ReturnType<typeof useTelemetryClient>;
    function Capture() {
      client = useTelemetryClient();
      return null;
    }
    const tree = renderTree(
      <Provider tracing={{ enabled: true, spanProcessors: [] }}>
        <Capture />
      </Provider>,
    );

    // With tracing on but no processors/endpoint resolvable in jsdom, the
    // span is inert — but startSpan must EXIST and not throw, which is what
    // tells us the option reached createTelemetry at all.
    expect(() => client.startSpan("App:Load").end()).not.toThrow();
    tree.unmount();
  });

  test("tracing is part of the client identity, so toggling it rebuilds", async () => {
    // Without this the flag would appear to do nothing until some unrelated
    // identity field happened to change.
    const tree = renderTree(
      <Provider>
        <EmitOnMount />
      </Provider>,
    );
    expect(processor.shutdowns).toBe(0);

    tree.rerender(
      <Provider tracing={{ enabled: true }}>
        <EmitOnMount />
      </Provider>,
    );

    await vi.waitFor(() => expect(processor.shutdowns).toBe(1));
    tree.unmount();
  });

  test("a span started from a CHILD effect is dropped — React runs those before attach", async () => {
    // The mirror of the metrics case in metrics-provider.test.tsx, and the
    // trap that cost a 180s e2e timeout against a perfectly healthy
    // pipeline. React runs child effects BEFORE parent effects, so a span
    // started in a child's own useEffect begins while the provider has not
    // yet attached a client. The facade does not buffer spans on purpose —
    // replaying one after attach would invent a duration that never
    // happened — so `withSpan` runs the callback against NOOP_SPAN and
    // nothing is ever recorded.
    //
    // For app authors: tracing "the mount itself" from a child records
    // NOTHING. Trace the work instead (a click, a fetch), which is when a
    // span has a real duration anyway.
    const started: string[] = [];
    const spanProcessor = {
      onStart: (span: { name: string }) => void started.push(span.name),
      onEnd: () => undefined,
      forceFlush: async () => undefined,
      shutdown: async () => undefined,
    };

    let emitLater: (() => void) | undefined;
    function TraceOnMount() {
      const { withSpan } = useTetraEvents();
      useEffect(() => {
        withSpan("App:Mount", () => undefined);
        emitLater = () => withSpan("App:Click", () => undefined);
      }, [withSpan]);
      return null;
    }

    const tree = renderTree(
      <Provider tracing={{ enabled: true, spanProcessors: [spanProcessor] }}>
        <TraceOnMount />
      </Provider>,
    );

    expect(started).not.toContain("App:Mount");

    // POSITIVE CONTROL, and the reason the assertion above means anything.
    // Without it this test would also pass if tracing were simply inert
    // here — an empty array proves nothing on its own. This shows the same
    // processor DOES receive a span once the provider has attached, so the
    // absence above is about timing, not a dead pipeline.
    act(() => emitLater!());
    expect(started).toContain("App:Click");

    tree.unmount();
  });
});
