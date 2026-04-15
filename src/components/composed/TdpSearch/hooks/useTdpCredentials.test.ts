import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useTdpCredentials } from "../hooks/useTdpCredentials";

describe("useTdpCredentials", () => {
  const originalGetItem = Storage.prototype.getItem;
  const originalCookieDescriptor = Object.getOwnPropertyDescriptor(
    Document.prototype,
    "cookie",
  );

  beforeEach(() => {
    // Clear localStorage and cookies between tests
    Storage.prototype.getItem = vi.fn().mockReturnValue(null);
    Object.defineProperty(document, "cookie", {
      value: "",
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Storage.prototype.getItem = originalGetItem;
    if (originalCookieDescriptor) {
      Object.defineProperty(document, "cookie", originalCookieDescriptor);
    }
  });

  it("returns explicit props when both are provided", () => {
    const creds = useTdpCredentials("my-token", "my-org");
    expect(creds).toEqual({ authToken: "my-token", orgSlug: "my-org" });
  });

  it("falls back to localStorage when explicit props are missing", () => {
    (Storage.prototype.getItem as ReturnType<typeof vi.fn>).mockImplementation(
      (key: string) => {
        if (key === "ts-auth-token") return "ls-token";
        if (key === "x-org-slug") return "ls-org";
        return null;
      },
    );
    const creds = useTdpCredentials();
    expect(creds).toEqual({ authToken: "ls-token", orgSlug: "ls-org" });
  });

  it("falls back to cookies when localStorage is empty", () => {
    Object.defineProperty(document, "cookie", {
      value: "ts-auth-token=cookie-token; x-org-slug=cookie-org",
      writable: true,
      configurable: true,
    });
    const creds = useTdpCredentials();
    expect(creds).toEqual({ authToken: "cookie-token", orgSlug: "cookie-org" });
  });

  it("returns undefined when no credentials are available", () => {
    const creds = useTdpCredentials();
    expect(creds).toEqual({ authToken: undefined, orgSlug: undefined });
  });

  it("prefers explicit props over localStorage", () => {
    (Storage.prototype.getItem as ReturnType<typeof vi.fn>).mockImplementation(
      (key: string) => {
        if (key === "ts-auth-token") return "ls-token";
        if (key === "x-org-slug") return "ls-org";
        return null;
      },
    );
    const creds = useTdpCredentials("explicit-token", "explicit-org");
    expect(creds).toEqual({ authToken: "explicit-token", orgSlug: "explicit-org" });
  });
});
