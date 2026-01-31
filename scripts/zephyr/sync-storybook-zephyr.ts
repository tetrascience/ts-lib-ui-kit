#!/usr/bin/env tsx
/**
 * Sync Storybook stories to Zephyr Scale as test cases
 *
 * This script scans src/components for story files and creates corresponding
 * test cases in Zephyr Scale. Folder mapping is auto-generated from the
 * directory structure (e.g., atoms/ -> "UI Kit - Atoms").
 *
 * Environment Variables:
 *   ZEPHYR_TOKEN - Zephyr Scale API token (required)
 *   ZEPHYR_PROJECT_KEY - Jira project key (default: 'SW')
 *   ZEPHYR_LABELS - Comma-separated labels (default: 'storybook,vitest,automated')
 *   ZEPHYR_FOLDER_PREFIX - Prefix for Zephyr folder names (default: 'UI Kit')
 */

import fs from "fs";
import path from "path";
import { Project, VariableDeclaration, Node } from "ts-morph";

// ============================================================================
// TypeScript Types
// ============================================================================

/** Represents the type of story export pattern detected */
export type StoryPattern = "csf3-object" | "csf2-template-bind" | "arrow-function" | "react-fc" | "unknown";

export interface StoryCase {
  filePath: string;
  lineNumber: number;
  storyName: string;
  exportName: string;
  componentName: string;
  componentType: string;
  hasZephyrId: boolean;
  existingId?: string;
  /** The detected story pattern for proper update handling */
  pattern: StoryPattern;
}

interface ZephyrFolder { id: string; name: string; }
interface FolderCache { [key: string]: string | null; }
interface ZephyrTestCase { key: string; name: string; }

const ZEPHYR_BASE_URL = "https://api.zephyrscale.smartbear.com/v2";
const PROJECT_KEY = process.env.ZEPHYR_PROJECT_KEY || "SW";

function getZephyrToken(): string {
  const token = process.env.ZEPHYR_TOKEN;
  if (!token) {
    console.error("[ERROR] ZEPHYR_TOKEN environment variable is required");
    process.exit(1);
  }
  return token;
}
const ZEPHYR_LABELS = process.env.ZEPHYR_LABELS?.split(",").map((l) => l.trim()).filter(Boolean) || ["storybook", "vitest", "automated"];

// Folder prefix for Zephyr - can be customized via env var
const FOLDER_PREFIX = process.env.ZEPHYR_FOLDER_PREFIX || "UI Kit";

// Dynamically generate folder mapping from src/components directory structure
function generateFolderMapping(): { [key: string]: string } {
  const componentsDir = path.join(process.cwd(), "src", "components");
  const mapping: { [key: string]: string } = {};

  if (!fs.existsSync(componentsDir)) {
    console.warn("[WARN] src/components directory not found, using empty folder mapping");
    return mapping;
  }

  const entries = fs.readdirSync(componentsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Convert directory name to title case for Zephyr folder name
      // e.g., "atoms" -> "Atoms", "molecules" -> "Molecules"
      const titleCase = entry.name.charAt(0).toUpperCase() + entry.name.slice(1);
      mapping[entry.name] = `${FOLDER_PREFIX} - ${titleCase}`;
    }
  }

  return mapping;
}

const FOLDER_MAPPING = generateFolderMapping();
const folderIdCache: FolderCache = {};

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

// ============================================================================
// AST-based Story Parsing
// ============================================================================

/** Determines the story pattern from a variable declaration's initializer */
export function detectStoryPattern(declaration: VariableDeclaration): StoryPattern {
  const typeNode = declaration.getTypeNode();
  const initializer = declaration.getInitializer();

  // Check type annotation first
  if (typeNode) {
    const typeText = typeNode.getText();
    if (typeText === "Story" || typeText.includes("StoryObj")) {
      return "csf3-object";
    }
    if (typeText.includes("React.FC") || typeText.includes("FC<")) {
      return "react-fc";
    }
  }

  if (!initializer) return "unknown";

  // Check initializer pattern
  if (Node.isCallExpression(initializer)) {
    const expression = initializer.getExpression();
    // Template.bind({}) pattern
    if (Node.isPropertyAccessExpression(expression)) {
      const propName = expression.getName();
      if (propName === "bind") {
        return "csf2-template-bind";
      }
    }
  }

  if (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer)) {
    return "arrow-function";
  }

  if (Node.isObjectLiteralExpression(initializer)) {
    return "csf3-object";
  }

  return "unknown";
}

/** Extracts the name property value from a story object if present */
export function extractNameFromStory(declaration: VariableDeclaration): string | undefined {
  const initializer = declaration.getInitializer();
  if (!initializer || !Node.isObjectLiteralExpression(initializer)) return undefined;

  const nameProp = initializer.getProperty("name");
  if (!nameProp || !Node.isPropertyAssignment(nameProp)) return undefined;

  const nameInit = nameProp.getInitializer();
  if (!nameInit || !Node.isStringLiteral(nameInit)) return undefined;

  return nameInit.getLiteralText();
}

/** Checks for .storyName assignment after the declaration */
export function findStoryNameAssignment(declaration: VariableDeclaration): string | undefined {
  const exportName = declaration.getName();
  const sourceFile = declaration.getSourceFile();

  // Look for: ExportName.storyName = "..."
  const statements = sourceFile.getStatements();
  for (const stmt of statements) {
    if (!Node.isExpressionStatement(stmt)) continue;

    const expr = stmt.getExpression();
    if (!Node.isBinaryExpression(expr)) continue;

    const left = expr.getLeft();
    if (!Node.isPropertyAccessExpression(left)) continue;

    const objExpr = left.getExpression();
    if (!Node.isIdentifier(objExpr) || objExpr.getText() !== exportName) continue;

    if (left.getName() !== "storyName") continue;

    const right = expr.getRight();
    if (Node.isStringLiteral(right)) {
      return right.getLiteralText();
    }
  }

  return undefined;
}

/** Parses a story file using TypeScript AST to extract story exports */
export function parseStoryFile(filePath: string, content: string): StoryCase[] {
  const stories: StoryCase[] = [];
  const zephyrIdPattern = /\[([A-Z]+-T\d+(?:,[A-Z]+-T\d+)*)\]\s*(.+)/;

  // Extract component type from path using detected folder mapping
  const componentTypes = Object.keys(FOLDER_MAPPING);
  const componentTypePattern = componentTypes.length > 0
    ? new RegExp(`components/(${componentTypes.join("|")})/`)
    : null;
  const pathMatch = componentTypePattern ? filePath.match(componentTypePattern) : null;
  const componentType = pathMatch ? pathMatch[1] : "other";

  // Create a ts-morph project and parse the file
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile("temp.tsx", content);

  // Extract component name from meta/default export title
  let componentName = path.basename(filePath, ".stories.tsx");
  const defaultExport = sourceFile.getDefaultExportSymbol();
  if (defaultExport) {
    const declarations = defaultExport.getDeclarations();
    for (const decl of declarations) {
      if (Node.isExportAssignment(decl)) {
        const expr = decl.getExpression();
        if (Node.isObjectLiteralExpression(expr)) {
          const titleProp = expr.getProperty("title");
          if (titleProp && Node.isPropertyAssignment(titleProp)) {
            const titleInit = titleProp.getInitializer();
            if (titleInit && Node.isStringLiteral(titleInit)) {
              const titleParts = titleInit.getLiteralText().split("/");
              componentName = titleParts[titleParts.length - 1] || componentName;
            }
          }
        }
      }
    }
  }

  // Also check for `const meta = { title: ... }` pattern
  const metaVar = sourceFile.getVariableDeclaration("meta");
  if (metaVar) {
    const init = metaVar.getInitializer();
    if (init && Node.isObjectLiteralExpression(init)) {
      const titleProp = init.getProperty("title");
      if (titleProp && Node.isPropertyAssignment(titleProp)) {
        const titleInit = titleProp.getInitializer();
        if (titleInit && Node.isStringLiteral(titleInit)) {
          const titleParts = titleInit.getLiteralText().split("/");
          componentName = titleParts[titleParts.length - 1] || componentName;
        }
      }
    }
  }

  // Find all exported variable declarations
  const exportedDeclarations = sourceFile.getExportedDeclarations();

  for (const [exportName, declarations] of exportedDeclarations) {
    // Skip default export, meta, and Template
    if (exportName === "default" || exportName === "meta" || exportName === "Template") continue;

    for (const decl of declarations) {
      if (!Node.isVariableDeclaration(decl)) continue;

      const pattern = detectStoryPattern(decl);
      if (pattern === "unknown") continue;

      const lineNumber = decl.getStartLineNumber();

      // Try to get story name from various sources
      let storyName = exportName;
      let hasZephyrId = false;
      let existingId: string | undefined;

      // Check for name property in object literal
      const nameFromObject = extractNameFromStory(decl);
      if (nameFromObject) {
        storyName = nameFromObject;
      }

      // Check for .storyName assignment
      const storyNameAssignment = findStoryNameAssignment(decl);
      if (storyNameAssignment) {
        storyName = storyNameAssignment;
      }

      // Check if name contains Zephyr ID
      const zephyrMatch = storyName.match(zephyrIdPattern);
      if (zephyrMatch) {
        hasZephyrId = true;
        existingId = zephyrMatch[1];
        storyName = zephyrMatch[2];
      }

      stories.push({
        filePath,
        lineNumber,
        storyName,
        exportName,
        componentName,
        componentType,
        hasZephyrId,
        existingId,
        pattern,
      });
    }
  }

  return stories;
}

async function getFolders(): Promise<FolderCache> {
  if (Object.keys(folderIdCache).length > 0) return folderIdCache;
  const url = `${ZEPHYR_BASE_URL}/folders?projectKey=${PROJECT_KEY}&folderType=TEST_CASE&maxResults=100`;
  const response = await fetch(url, { method: "GET", headers: { Authorization: `Bearer ${getZephyrToken()}`, "Content-Type": "application/json" } });
  if (!response.ok) { console.warn("Could not fetch folders"); return {}; }
  const data = await response.json();
  const folders = data.values || [];
  for (const [compType, folderName] of Object.entries(FOLDER_MAPPING)) {
    const existing = folders.find((f: ZephyrFolder) => f.name === folderName);
    if (existing) { folderIdCache[compType] = existing.id; }
    else {
      try {
        const newF = await createFolder(folderName);
        folderIdCache[compType] = newF.id;
        console.log(`[INFO] Created folder: ${folderName}`);
      } catch (e: unknown) { console.warn(`[WARN] Could not create folder ${folderName}:`, e instanceof Error ? e.message : String(e)); folderIdCache[compType] = null; }
    }
  }
  return folderIdCache;
}

async function createFolder(folderName: string): Promise<ZephyrFolder> {
  const url = `${ZEPHYR_BASE_URL}/folders`;
  const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${getZephyrToken()}`, "Content-Type": "application/json" }, body: JSON.stringify({ projectKey: PROJECT_KEY, name: folderName, folderType: "TEST_CASE" }) });
  if (!response.ok) { const errorText = await response.text(); throw new Error(`Failed to create folder: ${response.status} ${errorText}`); }
  return await response.json();
}

async function getFolderId(componentType: string): Promise<string | null> {
  await getFolders();
  return folderIdCache[componentType] || null;
}

async function createTestCase(testName: string, objective: string, folderId: string | null): Promise<ZephyrTestCase> {
  const url = `${ZEPHYR_BASE_URL}/testcases`;
  const body: { projectKey: string; name: string; objective: string; labels: string[]; folderId?: string } = {
    projectKey: PROJECT_KEY, name: testName, objective, labels: ZEPHYR_LABELS,
  };
  if (folderId) body.folderId = folderId;
  const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${getZephyrToken()}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) { const errorText = await response.text(); throw new Error(`Failed to create test case: ${response.status} ${errorText}`); }
  return await response.json();
}

// ============================================================================
// AST-based Story File Updates
// ============================================================================

/** Converts PascalCase/camelCase to human-readable format */
function toHumanName(name: string): string {
  return name.replace(/([A-Z])/g, " $1").trim();
}

/** Updates a story file to add a Zephyr ID using AST manipulation */
function updateStoryFile(
  filePath: string,
  _lineNumber: number,
  exportName: string,
  zephyrKey: string,
  pattern: StoryPattern
): boolean {
  const content = fs.readFileSync(filePath, "utf-8");
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(filePath, content);

  const humanName = toHumanName(exportName);
  const newName = `[${zephyrKey}] ${humanName}`;

  // Find the variable declaration for this export
  const declaration = sourceFile.getVariableDeclaration(exportName);
  if (!declaration) {
    console.warn(`  [WARN] Could not find declaration for "${exportName}" in ${filePath}`);
    return false;
  }

  let updated = false;

  switch (pattern) {
    case "csf3-object": {
      const initializer = declaration.getInitializer();
      if (initializer && Node.isObjectLiteralExpression(initializer)) {
        const nameProp = initializer.getProperty("name");
        if (nameProp && Node.isPropertyAssignment(nameProp)) {
          // Update existing name property
          const nameInit = nameProp.getInitializer();
          if (nameInit && Node.isStringLiteral(nameInit)) {
            const existingName = nameInit.getLiteralText();
            nameProp.setInitializer(`"[${zephyrKey}] ${existingName}"`);
            updated = true;
          }
        } else {
          // Add name property at the beginning
          initializer.insertPropertyAssignment(0, { name: "name", initializer: `"${newName}"` });
          updated = true;
        }
      }
      break;
    }

    case "csf2-template-bind":
    case "arrow-function":
    case "react-fc": {
      // For these patterns, add a .storyName assignment after the declaration
      // First check if one already exists
      const existingAssignment = findStoryNameAssignment(declaration);
      if (existingAssignment) {
        // Update existing .storyName assignment
        const statements = sourceFile.getStatements();
        for (const stmt of statements) {
          if (!Node.isExpressionStatement(stmt)) continue;
          const expr = stmt.getExpression();
          if (!Node.isBinaryExpression(expr)) continue;
          const left = expr.getLeft();
          if (!Node.isPropertyAccessExpression(left)) continue;
          const objExpr = left.getExpression();
          if (!Node.isIdentifier(objExpr) || objExpr.getText() !== exportName) continue;
          if (left.getName() !== "storyName") continue;

          const right = expr.getRight();
          if (Node.isStringLiteral(right)) {
            const existingName = right.getLiteralText();
            expr.replaceWithText(`${exportName}.storyName = "[${zephyrKey}] ${existingName}"`);
            updated = true;
            break;
          }
        }
      } else {
        // Add new .storyName assignment after the variable statement
        const varStatement = declaration.getVariableStatement();
        if (varStatement) {
          const stmtIndex = sourceFile.getStatements().indexOf(varStatement);
          sourceFile.insertStatements(stmtIndex + 1, `${exportName}.storyName = "${newName}";`);
          updated = true;
        }
      }
      break;
    }

    default:
      console.warn(`  [WARN] Unknown pattern "${pattern}" for story "${exportName}"`);
      return false;
  }

  if (!updated) {
    console.warn(`  [WARN] Could not update story "${exportName}" at ${filePath}`);
    console.warn(`         Pattern: ${pattern}. Please add Zephyr ID manually.`);
    return false;
  }

  // Write the updated file
  fs.writeFileSync(filePath, sourceFile.getFullText(), "utf-8");
  return true;
}

function generateObjective(story: StoryCase): string {
  const humanName = story.storyName.replace(/([A-Z])/g, " $1").trim();
  const relativePath = path.relative(process.cwd(), story.filePath);
  return `Component: ${story.componentName}<br/>Story: ${humanName}<br/>File: \`${relativePath}\``;
}

async function main(): Promise<void> {
  console.log("[INFO] Scanning for story files...\n");
  console.log(`[INFO] Configuration:`);
  console.log(`  Project Key: ${PROJECT_KEY}`);
  console.log(`  Labels: ${ZEPHYR_LABELS.join(", ")}`);
  console.log(`  Folder Prefix: ${FOLDER_PREFIX}`);
  console.log(`  Detected Component Types: ${Object.keys(FOLDER_MAPPING).join(", ") || "(none)"}\n`);

  const srcDir = path.join(process.cwd(), "src");
  const storyFiles = findStoryFiles(srcDir);
  console.log(`[INFO] Found ${storyFiles.length} story file(s)\n`);

  const allStories: StoryCase[] = [];
  for (const file of storyFiles) {
    const content = fs.readFileSync(file, "utf-8");
    const stories = parseStoryFile(file, content);
    allStories.push(...stories);
  }

  const storiesNeedingIds = allStories.filter((s) => !s.hasZephyrId);
  const storiesWithIds = allStories.filter((s) => s.hasZephyrId);

  console.log(`[INFO] Stories with Zephyr IDs: ${storiesWithIds.length}`);
  console.log(`[INFO] Stories needing Zephyr IDs: ${storiesNeedingIds.length}\n`);

  if (storiesNeedingIds.length === 0) {
    console.log("[INFO] All stories already have Zephyr IDs!\n");
    return;
  }

  let successCount = 0;
  let failCount = 0;
  let updateFailCount = 0;

  for (const story of storiesNeedingIds) {
    const relativePath = path.relative(process.cwd(), story.filePath);
    console.log(`\n[PROCESS] ${relativePath} - ${story.exportName}`);

    try {
      const folderId = await getFolderId(story.componentType);
      const objective = generateObjective(story);
      const humanName = story.storyName.replace(/([A-Z])/g, " $1").trim();
      const testName = `${story.componentName} - ${humanName}`;

      console.log(`  [API] Creating test case in Zephyr...`);
      const result = await createTestCase(testName, objective, folderId);
      console.log(`  [SUCCESS] Created ${result.key}`);

      console.log(`  [UPDATE] Updating story file with ${result.key}`);
      const updateSuccess = updateStoryFile(story.filePath, story.lineNumber, story.exportName, result.key, story.pattern);

      if (updateSuccess) {
        successCount++;
      } else {
        updateFailCount++;
        console.log(`  [PARTIAL] Test case created but story file not updated - manual update required`);
      }
    } catch (error: unknown) {
      console.error(`  [ERROR] ${error instanceof Error ? error.message : String(error)}`);
      failCount++;
    }
  }

  console.log("\n=====================================");
  console.log(`[INFO] Sync complete!`);
  console.log(`  Fully synced: ${successCount}`);
  console.log(`  Created but needs manual update: ${updateFailCount}`);
  console.log(`  Failed: ${failCount}`);
  if (failCount > 0) process.exit(1);
  if (updateFailCount > 0) {
    console.log("\n[WARN] Some stories require manual Zephyr ID tagging. See warnings above.");
  }
}

// Only run main when script is executed directly (not imported for testing)
if (process.env.NODE_ENV !== "test" && process.argv[1]?.includes("sync-storybook-zephyr")) {
  main().catch((error) => {
    console.error("[ERROR] Fatal error:", error);
    process.exit(1);
  });
}
