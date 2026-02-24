import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";

import {
  TdpNavigationProvider,
  useTdpNavigationContext,
} from "../TdpNavigationContext";
import * as tdpUrlModule from "../tdpUrl";

// Spy on utility functions so we can control their return values
vi.mock("../tdpUrl", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../tdpUrl")>();
  return {
    ...actual,
    getTdpBaseUrlFromReferrer: vi.fn(() => null),
    navigateToTdpUrl: vi.fn(),
  };
});

const mockedGetTdpBaseUrlFromReferrer = vi.mocked(
  tdpUrlModule.getTdpBaseUrlFromReferrer,
);
const mockedNavigateToTdpUrl = vi.mocked(tdpUrlModule.navigateToTdpUrl);

/** Test component that captures context value */
function ContextConsumer({
  onValue,
}: {
  onValue: (val: ReturnType<typeof useTdpNavigationContext>) => void;
}) {
  const value = useTdpNavigationContext();
  onValue(value);
  return null;
}

function renderWithProvider(
  providerProps: Partial<React.ComponentProps<typeof TdpNavigationProvider>>,
  onValue: (val: ReturnType<typeof useTdpNavigationContext>) => void,
) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      <TdpNavigationProvider {...providerProps}>
        <ContextConsumer onValue={onValue} />
      </TdpNavigationProvider>,
    );
  });

  return { root, container };
}

describe("TdpNavigationProvider", () => {
  beforeEach(() => {
    mockedGetTdpBaseUrlFromReferrer.mockReturnValue(null);
    mockedNavigateToTdpUrl.mockClear();
  });

  it("resolves base URL from explicit tdpBaseUrl prop", () => {
    let captured: ReturnType<typeof useTdpNavigationContext> | null = null;

    renderWithProvider(
      { tdpBaseUrl: "https://tetrascience.com/my-org" },
      (val) => {
        captured = val;
      },
    );

    expect(captured!.tdpBaseUrl).toBe("https://tetrascience.com/my-org");
  });

  it("strips trailing slash from explicit tdpBaseUrl", () => {
    let captured: ReturnType<typeof useTdpNavigationContext> | null = null;

    renderWithProvider(
      { tdpBaseUrl: "https://tetrascience.com/my-org/" },
      (val) => {
        captured = val;
      },
    );

    expect(captured!.tdpBaseUrl).toBe("https://tetrascience.com/my-org");
  });

  it("resolves base URL from document.referrer", () => {
    mockedGetTdpBaseUrlFromReferrer.mockReturnValue(
      "https://tetrascience.com/org-from-referrer",
    );

    let captured: ReturnType<typeof useTdpNavigationContext> | null = null;
    renderWithProvider({}, (val) => {
      captured = val;
    });

    expect(captured!.tdpBaseUrl).toBe(
      "https://tetrascience.com/org-from-referrer",
    );
  });

  it("falls back to tdpApiUrl when referrer is not available", () => {
    mockedGetTdpBaseUrlFromReferrer.mockReturnValue(null);

    let captured: ReturnType<typeof useTdpNavigationContext> | null = null;
    renderWithProvider(
      { tdpApiUrl: "https://api.tetrascience.com/v1" },
      (val) => {
        captured = val;
      },
    );

    expect(captured!.tdpBaseUrl).toBe("https://tetrascience.com");
  });

  it("returns null when no config is available", () => {
    let captured: ReturnType<typeof useTdpNavigationContext> | null = null;
    renderWithProvider({}, (val) => {
      captured = val;
    });

    expect(captured!.tdpBaseUrl).toBeNull();
  });

  it("getTdpUrl constructs full URL", () => {
    let captured: ReturnType<typeof useTdpNavigationContext> | null = null;
    renderWithProvider(
      { tdpBaseUrl: "https://tetrascience.com/my-org" },
      (val) => {
        captured = val;
      },
    );

    expect(captured!.getTdpUrl("/file/abc-123")).toBe(
      "https://tetrascience.com/my-org/file/abc-123",
    );
  });

  it("getTdpUrl returns null when base URL is not resolved", () => {
    let captured: ReturnType<typeof useTdpNavigationContext> | null = null;
    renderWithProvider({}, (val) => {
      captured = val;
    });

    expect(captured!.getTdpUrl("/file/abc")).toBeNull();
  });

  it("navigateToTdp calls navigateToTdpUrl with constructed URL", () => {
    let captured: ReturnType<typeof useTdpNavigationContext> | null = null;
    renderWithProvider(
      { tdpBaseUrl: "https://tetrascience.com" },
      (val) => {
        captured = val;
      },
    );

    act(() => {
      captured!.navigateToTdp("/file/abc", { newTab: true });
    });

    expect(mockedNavigateToTdpUrl).toHaveBeenCalledWith(
      "https://tetrascience.com/file/abc",
      { newTab: true },
    );
  });

  it("navigateToTdp warns when base URL is not resolved", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    let captured: ReturnType<typeof useTdpNavigationContext> | null = null;
    renderWithProvider({}, (val) => {
      captured = val;
    });

    act(() => {
      captured!.navigateToTdp("/file/abc");
    });

    expect(mockedNavigateToTdpUrl).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      "[TdpNavigation] Cannot navigate: TDP base URL not resolved",
    );

    warnSpy.mockRestore();
  });
});

describe("useTdpNavigationContext", () => {
  it("throws when used outside TdpNavigationProvider", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    // Suppress React error boundary console output
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      act(() => {
        root.render(
          <ContextConsumer
            onValue={() => {
              /* no-op */
            }}
          />,
        );
      });
    }).toThrow(
      "useTdpNavigationContext must be used within a TdpNavigationProvider",
    );

    errorSpy.mockRestore();
  });
});
