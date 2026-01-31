import { describe, it, expect } from "vitest";
import {
  parseJUnitXML,
  extractTestCases,
  determineTestStatus,
  type JUnitTestCase,
  type JUnitTestSuite,
} from "../report-zephyr-results";

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
  });
});

