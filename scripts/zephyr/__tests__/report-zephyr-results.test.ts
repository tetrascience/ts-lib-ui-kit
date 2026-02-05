import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import {
  parseJUnitXML,
  extractTestCases,
  determineTestStatus,
  validateCacheFilePath,
  getCachedCycleKey,
  cacheCycleKey,
  sanitizeBranchName,
  type JUnitTestCase,
  type JUnitTestSuite,
} from "../report-zephyr-results";

vi.mock("fs");

describe("report-zephyr-results", () => {
  describe("extractTestCases", () => {
    it("should extract test cases from a simple suite", () => {
      const suite: JUnitTestSuite = {
        "@_name": "TestSuite",
        testcase: [
          { "@_name": "test1", "@_time": "0.1" },
          { "@_name": "test2", "@_time": "0.2" },
        ],
      };

      const result = extractTestCases(suite);
      expect(result).toHaveLength(2);
      expect(result[0]["@_name"]).toBe("test1");
      expect(result[1]["@_name"]).toBe("test2");
    });

    it("should extract test cases from nested suites", () => {
      const suite: JUnitTestSuite = {
        "@_name": "ParentSuite",
        testsuite: [
          {
            "@_name": "ChildSuite",
            testcase: [{ "@_name": "nested-test", "@_time": "0.1" }],
          },
        ],
      };

      const result = extractTestCases(suite);
      expect(result).toHaveLength(1);
      expect(result[0]["@_name"]).toBe("nested-test");
    });

    it("should extract test cases from deeply nested suites", () => {
      const suite: JUnitTestSuite = {
        "@_name": "Root",
        testcase: [{ "@_name": "root-test", "@_time": "0.1" }],
        testsuite: [
          {
            "@_name": "Level1",
            testcase: [{ "@_name": "level1-test", "@_time": "0.2" }],
            testsuite: [
              {
                "@_name": "Level2",
                testcase: [{ "@_name": "level2-test", "@_time": "0.3" }],
              },
            ],
          },
        ],
      };

      const result = extractTestCases(suite);
      expect(result).toHaveLength(3);
      expect(result.map((t) => t["@_name"])).toEqual([
        "root-test",
        "level1-test",
        "level2-test",
      ]);
    });
  });

  describe("determineTestStatus", () => {
    it("should return Pass for a passing test", () => {
      const testCase: JUnitTestCase = { "@_name": "passing-test", "@_time": "0.1" };
      const result = determineTestStatus(testCase);
      expect(result.status).toBe("Pass");
      expect(result.comment).toBeUndefined();
    });

    it("should return Fail for a test with failure", () => {
      const testCase: JUnitTestCase = {
        "@_name": "failing-test",
        "@_time": "0.1",
        failure: [{ "@_message": "Assertion failed" }],
      };
      const result = determineTestStatus(testCase);
      expect(result.status).toBe("Fail");
      expect(result.comment).toBe("Assertion failed");
    });

    it("should return Fail for a test with error", () => {
      const testCase: JUnitTestCase = {
        "@_name": "error-test",
        "@_time": "0.1",
        error: [{ "@_message": "Runtime error" }],
      };
      const result = determineTestStatus(testCase);
      expect(result.status).toBe("Fail");
      expect(result.comment).toBe("Runtime error");
    });

    it("should return Not Executed for a skipped test", () => {
      const testCase: JUnitTestCase = {
        "@_name": "skipped-test",
        "@_time": "0",
        skipped: { "@_message": "Skipped by user" },
      };
      const result = determineTestStatus(testCase);
      expect(result.status).toBe("Not Executed");
      expect(result.comment).toBe("Skipped by user");
    });

    it("should return Not Executed with default message for empty skipped", () => {
      const testCase: JUnitTestCase = {
        "@_name": "skipped-test",
        "@_time": "0",
        skipped: "",
      };
      const result = determineTestStatus(testCase);
      expect(result.status).toBe("Not Executed");
      expect(result.comment).toBe("Test was skipped");
    });
  });

  describe("parseJUnitXML", () => {
    it("should parse XML and extract test results with Zephyr IDs", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="Button Tests" tests="2">
    <testcase name="[SW-T123] Button renders correctly" time="0.5"/>
    <testcase name="[SW-T124] Button click handler" time="0.3">
      <failure message="Expected button to be clicked"/>
    </testcase>
  </testsuite>
</testsuites>`;

      const results = parseJUnitXML(xml);
      expect(results).toHaveLength(2);
      expect(results[0].testCaseKey).toBe("SW-T123");
      expect(results[0].status).toBe("Pass");
      expect(results[1].testCaseKey).toBe("SW-T124");
      expect(results[1].status).toBe("Fail");
    });

    it("should handle multiple Zephyr IDs in a single test name", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="Suite">
  <testcase name="[SW-T100,SW-T101] Shared test" time="0.1"/>
</testsuite>`;

      const results = parseJUnitXML(xml);
      expect(results).toHaveLength(2);
      expect(results[0].testCaseKey).toBe("SW-T100");
      expect(results[1].testCaseKey).toBe("SW-T101");
    });

    it("should skip test cases without Zephyr IDs", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="Suite">
    <testcase name="Test without Zephyr ID" time="0.1"/>
    <testcase name="[SW-T200] Test with ID" time="0.2"/>
  </testsuite>
</testsuites>`;

      const results = parseJUnitXML(xml);
      expect(results).toHaveLength(1);
      expect(results[0].testCaseKey).toBe("SW-T200");
    });

    it("should handle testsuite at root level (without testsuites wrapper)", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="RootSuite">
  <testcase name="[SW-T300] Root level test" time="0.5"/>
</testsuite>`;

      const results = parseJUnitXML(xml);
      expect(results).toHaveLength(1);
      expect(results[0].testCaseKey).toBe("SW-T300");
      expect(results[0].status).toBe("Pass");
    });

    it("should return empty array for XML with no test cases", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="EmptySuite"/>
</testsuites>`;

      const results = parseJUnitXML(xml);
      expect(results).toHaveLength(0);
    });

    it("should calculate execution time in milliseconds", () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="Suite">
  <testcase name="[SW-T400] Timed test" time="1.234"/>
</testsuite>`;

      const results = parseJUnitXML(xml);
      expect(results[0].executionTime).toBe(1234);
    });
  });

  describe("validateCacheFilePath", () => {
    it("should accept valid simple filenames", () => {
      expect(() => validateCacheFilePath(".zephyr-cycle-key")).not.toThrow();
      expect(() => validateCacheFilePath("cache-file.txt")).not.toThrow();
      expect(() => validateCacheFilePath("cycle_key")).not.toThrow();
    });

    it("should reject paths with forward slashes", () => {
      expect(() => validateCacheFilePath("../parent/file")).toThrow(
        "Invalid cache file path: must be a simple filename without path separators"
      );
      expect(() => validateCacheFilePath("subdir/file")).toThrow(
        "Invalid cache file path: must be a simple filename without path separators"
      );
    });

    it("should reject paths with backslashes", () => {
      expect(() => validateCacheFilePath("..\\parent\\file")).toThrow(
        "Invalid cache file path: must be a simple filename without path separators"
      );
    });

    it("should reject paths starting with ..", () => {
      expect(() => validateCacheFilePath("..file")).toThrow(
        "Invalid cache file path: must be a simple filename without path separators"
      );
    });
  });

  describe("getCachedCycleKey", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("should return cached key when file exists and has content", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue("SW-R100\n");

      const result = getCachedCycleKey(".zephyr-cycle-key");
      expect(result).toBe("SW-R100");
      expect(fs.existsSync).toHaveBeenCalledWith(".zephyr-cycle-key");
    });

    it("should return null when file does not exist", () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = getCachedCycleKey(".zephyr-cycle-key");
      expect(result).toBeNull();
    });

    it("should return null when file exists but is empty", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue("   \n");

      const result = getCachedCycleKey(".zephyr-cycle-key");
      expect(result).toBeNull();
    });

    it("should throw for invalid cache file paths", () => {
      expect(() => getCachedCycleKey("../traversal")).toThrow();
    });
  });

  describe("cacheCycleKey", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("should write cycle key to file", () => {
      cacheCycleKey(".zephyr-cycle-key", "SW-R200");

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        ".zephyr-cycle-key",
        "SW-R200",
        "utf-8"
      );
    });

    it("should throw for invalid cache file paths", () => {
      expect(() => cacheCycleKey("../traversal", "SW-R200")).toThrow();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe("sanitizeBranchName", () => {
    it("should keep alphanumeric characters", () => {
      expect(sanitizeBranchName("feature123")).toBe("feature123");
    });

    it("should keep hyphens and underscores", () => {
      expect(sanitizeBranchName("feature-branch_name")).toBe("feature-branch_name");
    });

    it("should keep forward slashes", () => {
      expect(sanitizeBranchName("feature/my-branch")).toBe("feature/my-branch");
    });

    it("should replace special characters with hyphens", () => {
      expect(sanitizeBranchName("feature@branch#1")).toBe("feature-branch-1");
      expect(sanitizeBranchName("branch:name")).toBe("branch-name");
      expect(sanitizeBranchName("branch name")).toBe("branch-name");
    });

    it("should handle multiple consecutive special characters", () => {
      expect(sanitizeBranchName("feature@@branch")).toBe("feature--branch");
    });
  });

  describe("determineTestStatus - edge cases", () => {
    it("should use default message when failure has no message", () => {
      const testCase: JUnitTestCase = {
        "@_name": "failing-test",
        "@_time": "0.1",
        failure: [{}],
      };
      const result = determineTestStatus(testCase);
      expect(result.status).toBe("Fail");
      expect(result.comment).toBe("Test failed - see CI logs for details");
    });

    it("should use default message when error has no message", () => {
      const testCase: JUnitTestCase = {
        "@_name": "error-test",
        "@_time": "0.1",
        error: [{}],
      };
      const result = determineTestStatus(testCase);
      expect(result.status).toBe("Fail");
      expect(result.comment).toBe("Test error - see CI logs for details");
    });

    it("should prioritize error over failure when both present", () => {
      const testCase: JUnitTestCase = {
        "@_name": "test",
        "@_time": "0.1",
        failure: [{ "@_message": "Failure message" }],
        error: [{ "@_message": "Error message" }],
      };
      const result = determineTestStatus(testCase);
      expect(result.status).toBe("Fail");
      expect(result.comment).toBe("Error message");
    });
  });

  describe("extractTestCases - edge cases", () => {
    it("should handle empty suite", () => {
      const suite: JUnitTestSuite = {
        "@_name": "EmptySuite",
      };
      const result = extractTestCases(suite);
      expect(result).toHaveLength(0);
    });

    it("should handle single testcase (not array)", () => {
      const suite: JUnitTestSuite = {
        "@_name": "Suite",
        testcase: { "@_name": "single-test", "@_time": "0.1" } as unknown as JUnitTestCase[],
      };
      const result = extractTestCases(suite);
      expect(result).toHaveLength(1);
      expect(result[0]["@_name"]).toBe("single-test");
    });

    it("should handle single nested testsuite (not array)", () => {
      const suite: JUnitTestSuite = {
        "@_name": "Parent",
        testsuite: {
          "@_name": "Child",
          testcase: [{ "@_name": "nested-test", "@_time": "0.1" }],
        } as unknown as JUnitTestSuite[],
      };
      const result = extractTestCases(suite);
      expect(result).toHaveLength(1);
      expect(result[0]["@_name"]).toBe("nested-test");
    });
  });
});
