#!/usr/bin/env tsx
/**
 * Report Storybook test execution results to Zephyr Scale
 *
 * This script:
 * 1. Parses JUnit XML reports from Vitest runs
 * 2. Extracts Zephyr test case IDs from test names
 * 3. Reports test execution results (pass/fail) to a test cycle
 *
 * Environment Variables:
 *   ZEPHYR_TOKEN - Zephyr Scale API token (required)
 *   ZEPHYR_PROJECT_KEY - Jira project key (default: 'SW')
 *   JUNIT_PATH - Path to JUnit XML file (default: 'test-results/storybook-junit.xml')
 *
 * Cycle Selection (in priority order):
 *   ZEPHYR_CYCLE_KEY - Use this existing cycle key (for main branch or workflow_dispatch)
 *   ZEPHYR_BRANCH + ZEPHYR_CYCLE_CACHE_FILE - Find-or-create cycle for feature branches
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

function getZephyrToken(): string {
  const token = process.env.ZEPHYR_TOKEN;
  if (!token) {
    console.error("[ERROR] ZEPHYR_TOKEN environment variable is required");
    process.exit(1);
  }
  return token;
}

/** Validates that a cache file path is safe (no path traversal) */
export function validateCacheFilePath(cacheFile: string): void {
  if (cacheFile.includes('/') || cacheFile.includes('\\') || cacheFile.startsWith('..')) {
    throw new Error("Invalid cache file path: must be a simple filename without path separators");
  }
}

/** Reads a cached cycle key from the cache file, if it exists */
export function getCachedCycleKey(cacheFile: string): string | null {
  validateCacheFilePath(cacheFile);
  if (fs.existsSync(cacheFile)) {
    const key = fs.readFileSync(cacheFile, "utf-8").trim();
    if (key) return key;
  }
  return null;
}

/** Writes a cycle key to the cache file for future runs */
export function cacheCycleKey(cacheFile: string, cycleKey: string): void {
  validateCacheFilePath(cacheFile);
  fs.writeFileSync(cacheFile, cycleKey, "utf-8");
}

/** Sanitizes a branch name for use in cycle names */
export function sanitizeBranchName(branch: string): string {
  return branch.replace(/[^a-zA-Z0-9\-_/]/g, '-');
}



/** Creates a new test cycle and returns its key */
async function createTestCycle(name: string): Promise<string> {
  const url = `${ZEPHYR_BASE_URL}/testcycles`;
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${getZephyrToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ projectKey: PROJECT_KEY, name }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create test cycle: HTTP ${response.status}`);
  }
  const data = await response.json();
  return data.key;
}

/**
 * Determines which test cycle to use based on environment variables.
 * Returns the cycle key (existing or newly created) and the source.
 */
async function resolveCycleKey(): Promise<{ cycleKey: string; source: string }> {
  const cycleKey = process.env.ZEPHYR_CYCLE_KEY?.trim();
  const branch = process.env.ZEPHYR_BRANCH?.trim();
  const cacheFile = process.env.ZEPHYR_CYCLE_CACHE_FILE || ".zephyr-cycle-key";

  // Priority 1: Explicit cycle key (main branch or workflow_dispatch)
  if (cycleKey) {
    return { cycleKey, source: "explicit (ZEPHYR_CYCLE_KEY)" };
  }

  // Priority 2: Feature branch - check cache first, then create new cycle
  if (branch) {
    const cachedKey = getCachedCycleKey(cacheFile);
    if (cachedKey) {
      return { cycleKey: cachedKey, source: `cache (${cacheFile})` };
    }

    // Create new cycle for this branch (sanitize branch name for safety)
    const safeBranch = sanitizeBranchName(branch);
    const cycleName = `React UI Lib Storybook Tests - ${safeBranch}`;
    console.log(`[INFO] Creating test cycle: ${cycleName}`);
    const newKey = await createTestCycle(cycleName);
    console.log(`[SUCCESS] Created test cycle: ${newKey}`);

    // Cache the key for subsequent runs
    cacheCycleKey(cacheFile, newKey);
    console.log(`[INFO] Cached cycle key to: ${cacheFile}\n`);

    return { cycleKey: newKey, source: "newly created" };
  }

  throw new Error(
    "Unable to determine test cycle. Set ZEPHYR_CYCLE_KEY or ZEPHYR_BRANCH"
  );
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
  if (!response.ok) {
    throw new Error(`Failed to report execution for ${result.testCaseKey}: HTTP ${response.status}`);
  }
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

  // Determine the test cycle to use
  const { cycleKey, source } = await resolveCycleKey();
  console.log(`[INFO] Using test cycle: ${cycleKey} (${source})\n`);

  let passCount = 0, failCount = 0, errorCount = 0;

  for (const result of results) {
    try {
      await reportTestExecution(cycleKey, result);
      if (result.status === "Pass") passCount++; else failCount++;
      console.log(`  [${result.status.toUpperCase()}] ${result.testCaseKey}`);
    } catch {
      console.error(`  [ERROR] ${result.testCaseKey}: Failed to report`);
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
  main().catch(() => {
    console.error("[ERROR] Fatal error occurred");
    process.exit(1);
  });
}
