#!/usr/bin/env tsx
/**
 * Report Storybook test execution results to Zephyr Scale
 *
 * This script:
 * 1. Parses JUnit XML reports from Vitest runs
 * 2. Extracts Zephyr test case IDs from story file parameters OR test names
 * 3. Reports test execution results (pass/fail) to a test cycle
 *
 * Zephyr ID Resolution:
 *   Story mapping: Looks up IDs from parameters.zephyr.testCaseId in story files
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
import {
  ZephyrClient,
  buildStepsPayload,
  stripAnsi,
  type ZephyrScreenshot,
  type ZephyrStep,
} from "ts-lib-zephyr-nodejs";
import { Node, Project, type VariableDeclaration } from "ts-morph";

// ============================================================================
// Story to Zephyr ID Mapping
// ============================================================================

/** Maps story key (classname::testName) to Zephyr test case IDs */
export type ZephyrMapping = { [storyKey: string]: string[] };

/**
 * Converts a PascalCase or camelCase export name to Title Case with spaces
 * E.g., "Plate96Well" -> "Plate 96 Well", "HiddenUIElements" -> "Hidden UI Elements"
 *
 * This matches Storybook's algorithm which treats consecutive capitals as acronyms.
 */
function exportNameToTestName(exportName: string): string {
  // Handle acronyms (consecutive capitals) and add spaces appropriately
  // Pattern: before a capital that's followed by lowercase (new word start),
  // or before a number, or after a number followed by letter
  return exportName
    .replace(/([a-z])([A-Z])/g, "$1 $2") // lowercase followed by uppercase: "custom" + "D" -> "custom D"
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // acronym followed by word: "UI" + "Elements" -> "UI Elements"
    .replace(/([a-zA-Z])(\d+)/g, "$1 $2") // letter followed by number: "Plate" + "96" -> "Plate 96"
    .replace(/(\d+)([a-zA-Z])/g, "$1 $2"); // number followed by letter: "96" + "Well" -> "96 Well"
}

/** Extracts Zephyr ID from parameters.zephyr.testCaseId if present */
function extractZephyrIdFromDeclaration(declaration: VariableDeclaration): string | undefined {
  const initializer = declaration.getInitializer();
  if (!initializer || !Node.isObjectLiteralExpression(initializer)) return undefined;

  const parametersProp = initializer.getProperty("parameters");
  if (!parametersProp || !Node.isPropertyAssignment(parametersProp)) return undefined;

  const parametersInit = parametersProp.getInitializer();
  if (!parametersInit || !Node.isObjectLiteralExpression(parametersInit)) return undefined;

  const zephyrProp = parametersInit.getProperty("zephyr");
  if (!zephyrProp || !Node.isPropertyAssignment(zephyrProp)) return undefined;

  const zephyrInit = zephyrProp.getInitializer();
  if (!zephyrInit || !Node.isObjectLiteralExpression(zephyrInit)) return undefined;

  const testCaseIdProp = zephyrInit.getProperty("testCaseId");
  if (!testCaseIdProp || !Node.isPropertyAssignment(testCaseIdProp)) return undefined;

  const testCaseIdInit = testCaseIdProp.getInitializer();
  if (!testCaseIdInit || !Node.isStringLiteral(testCaseIdInit)) return undefined;

  const value = testCaseIdInit.getLiteralText();
  return value.trim() || undefined;
}

/** Extracts the name property value from a story object if present */
function extractNameFromStory(declaration: VariableDeclaration): string | undefined {
  const initializer = declaration.getInitializer();
  if (!initializer || !Node.isObjectLiteralExpression(initializer)) return undefined;

  const nameProp = initializer.getProperty("name");
  if (!nameProp || !Node.isPropertyAssignment(nameProp)) return undefined;

  const nameInit = nameProp.getInitializer();
  if (!nameInit || !Node.isStringLiteral(nameInit)) return undefined;

  return nameInit.getLiteralText();
}

/** Recursively finds all story files in a directory */
function findStoryFiles(dir: string): string[] {
  const storyFiles: string[] = [];
  if (!fs.existsSync(dir)) return storyFiles;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      storyFiles.push(...findStoryFiles(fullPath));
    } else if (entry.name.endsWith(".stories.tsx")) {
      storyFiles.push(fullPath);
    }
  }
  return storyFiles;
}

/** CSF2 export info containing optional storyName and zephyrId */
type CSF2ExportInfo = { storyName?: string; zephyrId?: string };

/** Extracts Zephyr ID from CSF2 parameters object: { zephyr: { testCaseId: "..." } } */
function extractZephyrIdFromParametersObject(parametersExpr: Node): string | undefined {
  if (!Node.isObjectLiteralExpression(parametersExpr)) return undefined;

  const zephyrProp = parametersExpr.getProperty("zephyr");
  if (!zephyrProp || !Node.isPropertyAssignment(zephyrProp)) return undefined;

  const zephyrInit = zephyrProp.getInitializer();
  if (!zephyrInit || !Node.isObjectLiteralExpression(zephyrInit)) return undefined;

  const testCaseIdProp = zephyrInit.getProperty("testCaseId");
  if (!testCaseIdProp || !Node.isPropertyAssignment(testCaseIdProp)) return undefined;

  const testCaseIdInit = testCaseIdProp.getInitializer();
  if (!testCaseIdInit || !Node.isStringLiteral(testCaseIdInit)) return undefined;

  return testCaseIdInit.getLiteralText();
}

/** Parses CSF2 style property assignments: ExportName.storyName and ExportName.parameters */
function parseCSF2Exports(
  sourceFile: ReturnType<Project["createSourceFile"]>,
  exportedNames: Set<string>,
): Map<string, CSF2ExportInfo> {
  const csf2Exports = new Map<string, CSF2ExportInfo>();

  for (const statement of sourceFile.getStatements()) {
    if (!Node.isExpressionStatement(statement)) continue;
    const expr = statement.getExpression();
    if (!Node.isBinaryExpression(expr)) continue;

    const left = expr.getLeft();
    if (!Node.isPropertyAccessExpression(left)) continue;

    const objectName = left.getExpression().getText();
    const propertyName = left.getName();

    // Skip if not an exported name
    if (!exportedNames.has(objectName)) continue;

    const right = expr.getRight();
    const entry = csf2Exports.get(objectName) || {};

    if (propertyName === "storyName" && Node.isStringLiteral(right)) {
      entry.storyName = right.getLiteralText();
      csf2Exports.set(objectName, entry);
    } else if (propertyName === "parameters") {
      const zephyrId = extractZephyrIdFromParametersObject(right);
      if (zephyrId) {
        entry.zephyrId = zephyrId;
        csf2Exports.set(objectName, entry);
      }
    }
  }

  return csf2Exports;
}

/**
 * Generates a mapping from story keys to Zephyr test case IDs
 * Story key format: "path/to/file.stories.tsx::Test Name"
 */
export function generateZephyrMapping(): ZephyrMapping {
  const mapping: ZephyrMapping = {};
  const srcDir = path.join(process.cwd(), "src");
  const storyFiles = findStoryFiles(srcDir);

  console.log(`[INFO] Generating Zephyr mapping from ${storyFiles.length} story files...`);

  for (const filePath of storyFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    const relativePath = path.relative(process.cwd(), filePath);

    // Parse with ts-morph
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("temp.tsx", content);

    // Find all exported variable declarations
    const exportedDeclarations = sourceFile.getExportedDeclarations();
    const exportedNames = new Set(exportedDeclarations.keys());

    // CSF3: Process typed Story declarations with inline parameters
    for (const [exportName, declarations] of exportedDeclarations) {
      // Skip default export, meta, and Template
      if (exportName === "default" || exportName === "meta" || exportName === "Template") continue;

      for (const decl of declarations) {
        if (!Node.isVariableDeclaration(decl)) continue;

        // Check if it's a Story type
        const typeNode = decl.getTypeNode();
        if (!typeNode) continue;
        const typeText = typeNode.getText();
        if (!typeText.includes("Story") && !typeText.includes("StoryObj")) continue;

        // Extract Zephyr ID from parameters.zephyr.testCaseId
        const zephyrId = extractZephyrIdFromDeclaration(decl);
        if (!zephyrId) continue;

        // Get test name (from name property or convert export name)
        const nameFromStory = extractNameFromStory(decl);
        const testName = nameFromStory || exportNameToTestName(exportName);

        // Create story key in format: "path/to/file.stories.tsx::Test Name"
        const storyKey = `${relativePath}::${testName}`;
        mapping[storyKey] = [zephyrId];
      }
    }

    // CSF2: Process ExportName.parameters = { zephyr: { testCaseId: "..." } } pattern
    const csf2Exports = parseCSF2Exports(sourceFile, exportedNames);

    // Add CSF2 entries to mapping
    for (const [exportName, { storyName, zephyrId }] of csf2Exports) {
      if (!zephyrId) continue;
      const testName = storyName || exportNameToTestName(exportName);
      const storyKey = `${relativePath}::${testName}`;
      // Only add if not already in mapping (CSF3 takes precedence)
      if (!mapping[storyKey]) {
        mapping[storyKey] = [zephyrId];
      }
    }
  }

  console.log(`[INFO] Generated mapping with ${Object.keys(mapping).length} entries\n`);
  return mapping;
}

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

/** Directory where the Storybook vitest setup writes per-story screenshots (`<zephyrId>.png`). */
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || "test-results/screenshots";

function getZephyrToken(): string {
  const token = process.env.ZEPHYR_TOKEN;
  if (!token) {
    console.error("[ERROR] ZEPHYR_TOKEN environment variable is required");
    process.exit(1);
  }
  return token;
}

/**
 * Builds the shared Zephyr API client. All HTTP (auth headers, timeouts, error
 * surfacing, execution/step endpoints) is delegated to `ts-lib-zephyr-nodejs`.
 * `cycleKey` is resolved per-run and passed on each `postExecution` call, so a
 * placeholder is fine here.
 */
function createZephyrClient(): ZephyrClient {
  return new ZephyrClient({ baseUrl: ZEPHYR_BASE_URL, apiToken: getZephyrToken(), projectKey: PROJECT_KEY, cycleKey: "" });
}

/** Gets the GitHub Actions run URL from environment variable */
function getGitHubActionsUrl(): string | null {
  // GITHUB_ACTIONS_URL is set by the workflow to point to the correct run
  // (the Storybook Tests run, not the report workflow)
  return process.env.GITHUB_ACTIONS_URL || null;
}

/**
 * Resolves the on-disk path to a test case's screenshot, or null when absent.
 * The Storybook vitest setup (`.storybook/vitest.setup.ts`) captures one PNG per
 * story named `<zephyrId>.png`; CI ships this directory alongside the JUnit report.
 */
function findScreenshotPath(testCaseKey: string): string | null {
  const p = path.resolve(process.cwd(), SCREENSHOT_DIR, `${testCaseKey}.png`);
  return fs.existsSync(p) ? p : null;
}

/** Validates that a cache file path is safe (no path traversal) */
export function validateCacheFilePath(cacheFile: string): void {
  if (cacheFile.includes("/") || cacheFile.includes("\\") || cacheFile.startsWith("..")) {
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
  return branch.replace(/[^a-zA-Z0-9\-_/]/g, "-");
}

/**
 * Creates a new test cycle and returns its key.
 * The library's `ZephyrClient` has no cycle-creation method, so we use its generic
 * `request()` — this still routes through the shared auth/timeout/error handling.
 */
async function createTestCycle(client: ZephyrClient, name: string): Promise<string> {
  const data = await client.request<{ key: string }>("POST", "/testcycles", { projectKey: PROJECT_KEY, name });
  return data.key;
}

/**
 * Determines which test cycle to use based on environment variables.
 * Returns the cycle key (existing or newly created) and the source.
 */
async function resolveCycleKey(client: ZephyrClient): Promise<{ cycleKey: string; source: string }> {
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
    const newKey = await createTestCycle(client, cycleName);
    console.log(`[SUCCESS] Created test cycle: ${newKey}`);

    // Cache the key for subsequent runs
    cacheCycleKey(cacheFile, newKey);
    console.log(`[INFO] Cached cycle key to: ${cacheFile}\n`);

    return { cycleKey: newKey, source: "newly created" };
  }

  throw new Error("Unable to determine test cycle. Set ZEPHYR_CYCLE_KEY or ZEPHYR_BRANCH");
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
      ? Array.isArray(testCase.error)
        ? testCase.error[0]?.["@_message"]
        : testCase.error?.["@_message"]
      : Array.isArray(testCase.failure)
        ? testCase.failure[0]?.["@_message"]
        : testCase.failure?.["@_message"];

    return {
      status: "Fail",
      comment:
        failureMessage || (hasError ? "Test error - see CI logs for details" : "Test failed - see CI logs for details"),
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
export function parseJUnitXML(
  xmlContent: string,
  mappingOverride?: ZephyrMapping,
): TestResult[] {
  const results: TestResult[] = [];

  // Use provided mapping or generate from story files (parameters.zephyr.testCaseId)
  const mapping = mappingOverride ?? generateZephyrMapping();

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
    const suites = Array.isArray(parsed.testsuite) ? parsed.testsuite : [parsed.testsuite];
    allSuites.push(...suites);
  }

  // Extract all test cases from all suites
  const allTestCases = allSuites.flatMap(extractTestCases);

  // Process each test case
  for (const testCase of allTestCases) {
    const testName = testCase["@_name"];
    const classname = testCase["@_classname"] || "";
    const time = testCase["@_time"];

    // Look up Zephyr ID from story mapping (parameters.zephyr.testCaseId)
    const storyKey = `${classname}::${testName}`;
    const ids: string[] = mapping[storyKey] || [];

    // Skip if no Zephyr IDs found
    if (ids.length === 0) continue;

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

/** Builds the execution comment: result message + CI run link. */
function buildExecutionComment(result: TestResult): string {
  const commentParts: string[] = [];
  if (result.comment) commentParts.push(stripAnsi(result.comment));

  const githubUrl = getGitHubActionsUrl();
  if (githubUrl) commentParts.push(`View CI run: ${githubUrl}`);

  return commentParts.join("\n\n");
}

/**
 * Reports one test execution to Zephyr and embeds the captured story screenshot
 * into every step of that execution.
 *
 * Flow (mirrors the library's own StorybookZephyrReporter):
 *   1. POST the execution (creates it + baseline testScriptResults).
 *   2. Look up the test case's step count and attach the same PNG to each step via
 *      `buildStepsPayload` (base64 `<img>` embedded in each step's actualResult).
 *   3. PUT the step payload onto the execution.
 * Skipped ("Not Executed") tests get no step-image PUT.
 */
async function reportTestExecution(client: ZephyrClient, cycleKey: string, result: TestResult): Promise<void> {
  const comment = buildExecutionComment(result);
  const stepCount = Math.max(1, await client.getStepCount(result.testCaseKey));

  const { key: executionKey } = await client.postExecution(
    PROJECT_KEY,
    result.testCaseKey,
    cycleKey,
    result.status,
    comment,
    // actualResult: the last step's baseline result before screenshots are merged in
    result.status === "Pass" ? "Story rendered successfully" : (result.comment ?? result.status),
    result.executionTime,
    stepCount,
  );

  // Embed the captured screenshot into every step (per-step evidence).
  if (result.status === "Not Executed" || !executionKey) return;

  const screenshotPath = findScreenshotPath(result.testCaseKey);
  if (!screenshotPath) return;

  const failed = result.status === "Fail";
  const localSteps: ZephyrStep[] = Array.from({ length: stepCount }, () => ({
    title: result.testCaseKey,
    failed,
    ...(failed && result.comment ? { errorMessage: stripAnsi(result.comment) } : {}),
  }));
  const screenshots: ZephyrScreenshot[] = Array.from({ length: stepCount }, (_, i) => ({
    stepIndex: i,
    filePath: screenshotPath,
  }));

  const steps = buildStepsPayload(stepCount, localSteps, screenshots);
  await client.putExecutionSteps(executionKey, steps);
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

  const client = createZephyrClient();

  // Determine the test cycle to use
  const { cycleKey, source } = await resolveCycleKey(client);
  console.log(`[INFO] Using test cycle: ${cycleKey} (${source})\n`);

  let passCount = 0,
    failCount = 0,
    errorCount = 0;

  for (const result of results) {
    try {
      await reportTestExecution(client, cycleKey, result);
      if (result.status === "Pass") passCount++;
      else failCount++;
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
  main().catch((error) => {
    console.error("[ERROR] Fatal error occurred:", error);
    process.exit(1);
  });
}
