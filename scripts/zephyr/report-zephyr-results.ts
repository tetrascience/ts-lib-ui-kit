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

interface TestResult {
  testCaseKey: string;
  status: "Pass" | "Fail";
  executionTime: number;
  comment?: string;
}

const ZEPHYR_BASE_URL = "https://api.zephyrscale.smartbear.com/v2";
const ZEPHYR_TOKEN = process.env.ZEPHYR_TOKEN;
const PROJECT_KEY = process.env.ZEPHYR_PROJECT_KEY || "SW";
const JUNIT_PATH = process.env.JUNIT_PATH || "test-results/storybook-junit.xml";
const CYCLE_NAME_PREFIX = process.env.ZEPHYR_CYCLE_NAME_PREFIX || "Storybook";

if (!ZEPHYR_TOKEN) {
  console.error("[ERROR] ZEPHYR_TOKEN environment variable is required");
  process.exit(1);
}

function parseJUnitXML(xmlContent: string): TestResult[] {
  const results: TestResult[] = [];
  const zephyrIdPattern = /\[([A-Z]+-T\d+(?:,[A-Z]+-T\d+)*)\]/;

  // Simple XML parsing - extract testcase elements
  const testcaseRegex = /<testcase\s+[^>]*name="([^"]+)"[^>]*time="([^"]+)"[^>]*>([\s\S]*?)<\/testcase>|<testcase\s+[^>]*name="([^"]+)"[^>]*time="([^"]+)"[^>]*\/>/g;
  const failureRegex = /<failure[^>]*>([\s\S]*?)<\/failure>/;

  let match;
  while ((match = testcaseRegex.exec(xmlContent)) !== null) {
    const testName = match[1] || match[4];
    const time = match[2] || match[5];
    const innerContent = match[3] || "";

    const zephyrMatch = testName.match(zephyrIdPattern);
    if (!zephyrMatch) continue;

    const ids = zephyrMatch[1].split(",");
    const hasFailure = failureRegex.test(innerContent);

    for (const id of ids) {
      results.push({
        testCaseKey: id.trim(),
        status: hasFailure ? "Fail" : "Pass",
        executionTime: Math.round(parseFloat(time) * 1000),
        comment: hasFailure ? "Test failed - see CI logs for details" : undefined,
      });
    }
  }

  return results;
}

async function createTestCycle(name: string): Promise<string> {
  const url = `${ZEPHYR_BASE_URL}/testcycles`;
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${ZEPHYR_TOKEN}`, "Content-Type": "application/json" },
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
    headers: { Authorization: `Bearer ${ZEPHYR_TOKEN}`, "Content-Type": "application/json" },
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

main().catch((error) => {
  console.error("[ERROR] Fatal error:", error);
  process.exit(1);
});

