#!/usr/bin/env tsx
/**
 * Report Storybook test execution results to Zephyr Scale
 *
 * This script:
 * 1. Parses JUnit XML reports from Vitest runs
 * 2. Extracts Zephyr test case IDs from test names
 * 3. Creates a test cycle in Zephyr Scale
 * 4. Reports test execution results (pass/fail) for each test
 *
 * Environment Variables:
 *   ZEPHYR_TOKEN - Zephyr Scale API token (required)
 *   ZEPHYR_PROJECT_KEY - Jira project key (default: 'SW')
 *   JUNIT_PATH - Path to JUnit XML file (default: 'test-results/storybook-junit.xml')
 *   ZEPHYR_CYCLE_NAME_PREFIX - Prefix for cycle names (default: 'Storybook')
 */

import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";

// ============================================================================
// TypeScript Types for JUnit XML Schema
// ============================================================================

/** Represents a failure element in a test case */
export interface JUnitFailure {
  "@_message"?: string;
  "@_type"?: string;
  "#text"?: string;
}

/** Represents an error element in a test case */
export interface JUnitError {
  "@_message"?: string;
  "@_type"?: string;
  "#text"?: string;
}

/** Represents a skipped element in a test case */
export interface JUnitSkipped {
  "@_message"?: string;
}

/** Represents a single test case in JUnit XML */
export interface JUnitTestCase {
  "@_name": string;
  "@_classname"?: string;
  "@_time": string;
  failure?: JUnitFailure | JUnitFailure[];
  error?: JUnitError | JUnitError[];
  skipped?: JUnitSkipped | "";
}

/** Represents a test suite in JUnit XML */
export interface JUnitTestSuite {
  "@_name"?: string;
  "@_tests"?: string;
  "@_failures"?: string;
  "@_errors"?: string;
  "@_skipped"?: string;
  "@_time"?: string;
  testcase?: JUnitTestCase | JUnitTestCase[];
  testsuite?: JUnitTestSuite | JUnitTestSuite[];
}

/** Root structure of JUnit XML */
interface JUnitXML {
  testsuites?: {
    testsuite?: JUnitTestSuite | JUnitTestSuite[];
  };
  testsuite?: JUnitTestSuite;
}

// ============================================================================
// Application Types
// ============================================================================

interface TestResult {
  testCaseKey: string;
  status: "Pass" | "Fail" | "Not Executed";
  executionTime: number;
  comment?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const ZEPHYR_BASE_URL = "https://api.zephyrscale.smartbear.com/v2";
const PROJECT_KEY = process.env.ZEPHYR_PROJECT_KEY || "SW";
const JUNIT_PATH = process.env.JUNIT_PATH || "test-results/storybook-junit.xml";
const CYCLE_NAME_PREFIX = process.env.ZEPHYR_CYCLE_NAME_PREFIX || "Storybook";

function getZephyrToken(): string {
  const token = process.env.ZEPHYR_TOKEN;
  if (!token) {
    console.error("[ERROR] ZEPHYR_TOKEN environment variable is required");
    process.exit(1);
  }
  return token;
}

// ============================================================================
// JUnit XML Parsing
// ============================================================================

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  isArray: (name) => ["testcase", "testsuite", "failure", "error"].includes(name),
});

/** Extracts all test cases from a test suite, including nested suites */
export function extractTestCases(suite: JUnitTestSuite): JUnitTestCase[] {
  const testCases: JUnitTestCase[] = [];

  // Add direct test cases
  if (suite.testcase) {
    const cases = Array.isArray(suite.testcase) ? suite.testcase : [suite.testcase];
    testCases.push(...cases);
  }

  // Recursively extract from nested test suites
  if (suite.testsuite) {
    const nestedSuites = Array.isArray(suite.testsuite) ? suite.testsuite : [suite.testsuite];
    for (const nestedSuite of nestedSuites) {
      testCases.push(...extractTestCases(nestedSuite));
    }
  }

  return testCases;
}

/** Determines the test status based on failure/error/skipped elements */
export function determineTestStatus(testCase: JUnitTestCase): { status: TestResult["status"]; comment?: string } {
  const hasFailure = testCase.failure !== undefined;
  const hasError = testCase.error !== undefined;
  const hasSkipped = testCase.skipped !== undefined;

  if (hasFailure || hasError) {
    const failureMessage = hasError
      ? (Array.isArray(testCase.error) ? testCase.error[0]?.["@_message"] : testCase.error?.["@_message"])
      : (Array.isArray(testCase.failure) ? testCase.failure[0]?.["@_message"] : testCase.failure?.["@_message"]);

    return {
      status: "Fail",
      comment: failureMessage || (hasError ? "Test error - see CI logs for details" : "Test failed - see CI logs for details"),
    };
  }

  if (hasSkipped) {
    const skipMessage = typeof testCase.skipped === "object" ? testCase.skipped["@_message"] : undefined;
    return {
      status: "Not Executed",
      comment: skipMessage || "Test was skipped",
    };
  }

  return { status: "Pass" };
}

/** Parses JUnit XML content and extracts test results with Zephyr IDs */
export function parseJUnitXML(xmlContent: string): TestResult[] {
  const results: TestResult[] = [];
  const zephyrIdPattern = /\[([A-Z]+-T\d+(?:,[A-Z]+-T\d+)*)\]/;

  const parsed = xmlParser.parse(xmlContent) as JUnitXML;

  // Collect all test suites from various possible structures
  const allSuites: JUnitTestSuite[] = [];

  if (parsed.testsuites?.testsuite) {
    const suites = Array.isArray(parsed.testsuites.testsuite)
      ? parsed.testsuites.testsuite
      : [parsed.testsuites.testsuite];
    allSuites.push(...suites);
  }

  if (parsed.testsuite) {
    const suites = Array.isArray(parsed.testsuite)
      ? parsed.testsuite
      : [parsed.testsuite];
    allSuites.push(...suites);
  }

  // Extract all test cases from all suites
  const allTestCases = allSuites.flatMap(extractTestCases);

  // Process each test case
  for (const testCase of allTestCases) {
    const testName = testCase["@_name"];
    const time = testCase["@_time"];

    // Check for Zephyr ID in test name
    const zephyrMatch = testName.match(zephyrIdPattern);
    if (!zephyrMatch) continue;

    const ids = zephyrMatch[1].split(",");
    const { status, comment } = determineTestStatus(testCase);

    for (const id of ids) {
      results.push({
        testCaseKey: id.trim(),
        status,
        executionTime: Math.round(parseFloat(time) * 1000),
        comment,
      });
    }
  }

  return results;
}

async function createTestCycle(name: string): Promise<string> {
  const url = `${ZEPHYR_BASE_URL}/testcycles`;
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${getZephyrToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ projectKey: PROJECT_KEY, name }),
  });
  if (!response.ok) { const errorText = await response.text(); throw new Error(`Failed to create test cycle: ${response.status} ${errorText}`); }
  const data = await response.json();
  return data.key;
}

async function reportTestExecution(cycleKey: string, result: TestResult): Promise<void> {
  const url = `${ZEPHYR_BASE_URL}/testexecutions`;
  const body: { projectKey: string; testCycleKey: string; testCaseKey: string; statusName: string; executionTime?: number; comment?: string } = {
    projectKey: PROJECT_KEY,
    testCycleKey: cycleKey,
    testCaseKey: result.testCaseKey,
    statusName: result.status,
  };
  if (result.executionTime) body.executionTime = result.executionTime;
  if (result.comment) body.comment = result.comment;

  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${getZephyrToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) { const errorText = await response.text(); throw new Error(`Failed to report execution for ${result.testCaseKey}: ${response.status} ${errorText}`); }
}

async function main(): Promise<void> {
  const junitPath = path.resolve(process.cwd(), JUNIT_PATH);
  console.log(`[INFO] Reading JUnit XML from: ${junitPath}\n`);

  if (!fs.existsSync(junitPath)) {
    console.error(`[ERROR] JUnit XML file not found: ${junitPath}`);
    process.exit(1);
  }

  const xmlContent = fs.readFileSync(junitPath, "utf-8");
  const results = parseJUnitXML(xmlContent);

  console.log(`[INFO] Found ${results.length} test results with Zephyr IDs\n`);

  if (results.length === 0) {
    console.log("[INFO] No test results with Zephyr IDs found. Skipping report.");
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const cycleName = `${CYCLE_NAME_PREFIX} - ${timestamp}`;
  console.log(`[INFO] Creating test cycle: ${cycleName}`);

  const cycleKey = await createTestCycle(cycleName);
  console.log(`[SUCCESS] Created test cycle: ${cycleKey}\n`);

  let passCount = 0, failCount = 0, errorCount = 0;

  for (const result of results) {
    try {
      await reportTestExecution(cycleKey, result);
      if (result.status === "Pass") passCount++; else failCount++;
      console.log(`  [${result.status.toUpperCase()}] ${result.testCaseKey}`);
    } catch (error: unknown) {
      console.error(`  [ERROR] ${result.testCaseKey}: ${error instanceof Error ? error.message : String(error)}`);
      errorCount++;
    }
  }

  console.log("\n=====================================");
  console.log(`[INFO] Report complete!`);
  console.log(`  Test Cycle: ${cycleKey}`);
  console.log(`  Passed: ${passCount}, Failed: ${failCount}, Errors: ${errorCount}`);
  if (errorCount > 0) process.exit(1);
}

// Only run main when script is executed directly (not imported for testing)
if (process.env.NODE_ENV !== "test" && process.argv[1]?.includes("report-zephyr-results")) {
  main().catch((error) => {
    console.error("[ERROR] Fatal error:", error);
    process.exit(1);
  });
}
