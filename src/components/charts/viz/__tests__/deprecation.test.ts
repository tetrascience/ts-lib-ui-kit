import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { warnDeprecatedChart } from "../deprecation";

describe("warnDeprecatedChart", () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
    vi.unstubAllEnvs();
  });

  it("names the component and the replacement once per page load", () => {
    warnDeprecatedChart("UniqueAreaPlotForTest");
    warnDeprecatedChart("UniqueAreaPlotForTest");

    expect(warn).toHaveBeenCalledTimes(1);
    const message = String(warn.mock.calls[0][0]);
    expect(message).toContain("UniqueAreaPlotForTest is deprecated");
    expect(message).toContain("@tetrascience-npm/ts-lib-viz");
  });

  it("warns separately for each component", () => {
    warnDeprecatedChart("UniqueBarForTest");
    warnDeprecatedChart("UniqueBoxForTest");

    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("stays silent when NODE_ENV is production", () => {
    vi.stubEnv("NODE_ENV", "production");
    warnDeprecatedChart("UniqueHistogramForTest");

    expect(warn).not.toHaveBeenCalled();
  });
});
