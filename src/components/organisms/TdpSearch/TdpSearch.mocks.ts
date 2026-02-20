import type { SearchEqlResponse } from "@tetrascience-npm/ts-connectors-sdk";

/**
 * Mock search response data for Storybook stories
 */
export const mockSearchResponse: SearchEqlResponse = {
  took: 15,
  timed_out: false,
  _shards: {
    total: 1,
    successful: 1,
    skipped: 0,
    failed: 0,
  },
  hits: {
    total: { value: 42, relation: "eq" },
    max_score: 1.5,
    hits: [
      {
        _index: "datalake",
        _id: "file-001",
        _score: 1.5,
        _source: {
          id: "file-001",
          filePath: "/data/experiments/sample-001.csv",
          sourceType: "instrument-data",
          status: "processed",
          fileSize: 2048576,
          createdAt: "2024-01-15T10:30:00Z",
        },
      },
      {
        _index: "datalake",
        _id: "file-002",
        _score: 1.4,
        _source: {
          id: "file-002",
          filePath: "/data/experiments/sample-002.csv",
          sourceType: "manual-upload",
          status: "processed",
          fileSize: 5242880,
          createdAt: "2024-01-15T11:45:00Z",
        },
      },
      {
        _index: "datalake",
        _id: "file-003",
        _score: 1.3,
        _source: {
          id: "file-003",
          filePath: "/data/experiments/experiment-a.json",
          sourceType: "instrument-data",
          status: "pending",
          fileSize: 1024000,
          createdAt: "2024-01-15T14:20:00Z",
        },
      },
      {
        _index: "datalake",
        _id: "file-004",
        _score: 1.2,
        _source: {
          id: "file-004",
          filePath: "/data/results/analysis-001.xlsx",
          sourceType: "pipeline-output",
          status: "processed",
          fileSize: 3145728,
          createdAt: "2024-01-16T09:15:00Z",
        },
      },
      {
        _index: "datalake",
        _id: "file-005",
        _score: 1.1,
        _source: {
          id: "file-005",
          filePath: "/data/experiments/sample-003.csv",
          sourceType: "instrument-data",
          status: "failed",
          fileSize: 1536000,
          createdAt: "2024-01-16T13:00:00Z",
        },
      },
      {
        _index: "datalake",
        _id: "file-006",
        _score: 1.0,
        _source: {
          id: "file-006",
          filePath: "/data/raw/instrument-log.txt",
          sourceType: "manual-upload",
          status: "processed",
          fileSize: 819200,
          createdAt: "2024-01-17T08:30:00Z",
        },
      },
      {
        _index: "datalake",
        _id: "file-007",
        _score: 0.9,
        _source: {
          id: "file-007",
          filePath: "/data/experiments/experiment-b.json",
          sourceType: "instrument-data",
          status: "processed",
          fileSize: 2621440,
          createdAt: "2024-01-17T15:45:00Z",
        },
      },
      {
        _index: "datalake",
        _id: "file-008",
        _score: 0.8,
        _source: {
          id: "file-008",
          filePath: "/data/results/summary-report.pdf",
          sourceType: "pipeline-output",
          status: "processed",
          fileSize: 4194304,
          createdAt: "2024-01-18T10:00:00Z",
        },
      },
      {
        _index: "datalake",
        _id: "file-009",
        _score: 0.7,
        _source: {
          id: "file-009",
          filePath: "/data/experiments/sample-004.csv",
          sourceType: "instrument-data",
          status: "processed",
          fileSize: 1843200,
          createdAt: "2024-01-18T16:20:00Z",
        },
      },
      {
        _index: "datalake",
        _id: "file-010",
        _score: 0.6,
        _source: {
          id: "file-010",
          filePath: "/data/calibration/standards.xlsx",
          sourceType: "manual-upload",
          status: "processed",
          fileSize: 2457600,
          createdAt: "2024-01-19T11:30:00Z",
        },
      },
    ],
  },
};
