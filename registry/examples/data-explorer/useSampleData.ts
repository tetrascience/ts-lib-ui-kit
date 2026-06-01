import { useMemo } from "react";

/**
 * Sample data for the Data Explorer example.
 *
 * In a real data app you would replace this hook with a query against the
 * TetraScience Data Platform (e.g. via `@tetrascience-npm/tetrascience-react-ui/server`
 * providers) or your own API. The shape is intentionally simple so the example
 * runs with zero backend wiring.
 */

export interface InstrumentRun {
  id: string;
  instrument: string;
  assay: string;
  status: "completed" | "running" | "failed";
  yield: number;
  startedAt: string;
}

export interface DataExplorerData {
  stats: {
    totalRuns: number;
    completed: number;
    failed: number;
    avgYield: number;
  };
  runs: InstrumentRun[];
  yieldSeries: { x: number[]; y: number[]; name: string };
}

const SAMPLE_RUNS: InstrumentRun[] = [
  {
    id: "RUN-1042",
    instrument: "HPLC-02",
    assay: "Purity",
    status: "completed",
    yield: 94.2,
    startedAt: "2026-05-28 09:14",
  },
  {
    id: "RUN-1041",
    instrument: "LC-MS-01",
    assay: "Identity",
    status: "completed",
    yield: 88.7,
    startedAt: "2026-05-28 08:02",
  },
  {
    id: "RUN-1040",
    instrument: "HPLC-02",
    assay: "Purity",
    status: "running",
    yield: 0,
    startedAt: "2026-05-28 07:40",
  },
  {
    id: "RUN-1039",
    instrument: "GC-03",
    assay: "Residuals",
    status: "failed",
    yield: 0,
    startedAt: "2026-05-27 16:55",
  },
  {
    id: "RUN-1038",
    instrument: "LC-MS-01",
    assay: "Identity",
    status: "completed",
    yield: 91.5,
    startedAt: "2026-05-27 14:21",
  },
  {
    id: "RUN-1037",
    instrument: "HPLC-02",
    assay: "Purity",
    status: "completed",
    yield: 96.1,
    startedAt: "2026-05-27 11:08",
  },
];

export function useSampleData(): DataExplorerData {
  return useMemo(() => {
    const completed = SAMPLE_RUNS.filter((r) => r.status === "completed");
    const failed = SAMPLE_RUNS.filter((r) => r.status === "failed");
    const avgYield = completed.reduce((sum, r) => sum + r.yield, 0) / Math.max(completed.length, 1);

    return {
      stats: {
        totalRuns: SAMPLE_RUNS.length,
        completed: completed.length,
        failed: failed.length,
        avgYield: Number(avgYield.toFixed(1)),
      },
      runs: SAMPLE_RUNS,
      yieldSeries: {
        name: "Yield %",
        x: completed.map((_, i) => i + 1),
        y: completed.map((r) => r.yield),
      },
    };
  }, []);
}
