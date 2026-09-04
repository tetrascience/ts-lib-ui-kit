import { defineConfig } from "vitest/config";

/**
 * Separate config, deliberately NOT another project in vitest.config.ts.
 *
 * `yarn test` runs every project there, so an e2e project would fail the unit
 * run on any machine without credentials — including every PR build. This suite
 * is only ever run on purpose, via `yarn test:e2e`, inside the VPC-attached
 * tdp-e2e CodeBuild project (predev5 is unreachable from a GitHub runner).
 *
 * jsdom, because the bindings assume a browser: `window`, a React tree, and the
 * visibilitychange flush hook.
 */
export default defineConfig({
  test: {
    name: "e2e",
    environment: "jsdom",
    include: ["test/e2e/**/*.e2e.test.tsx"],
    // One run walks batch -> gateway -> collector -> EMF, three times over
    // for the counter case.
    testTimeout: 300_000,
    hookTimeout: 60_000,
    fileParallelism: false,
    retry: 0,
  },
});
