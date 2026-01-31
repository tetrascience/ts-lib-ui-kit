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

interface StoryCase {
  filePath: string;
  lineNumber: number;
  storyName: string;
  exportName: string;
  componentName: string;
  componentType: string;
  hasZephyrId: boolean;
  existingId?: string;
}

interface ZephyrFolder { id: string; name: string; }
interface FolderCache { [key: string]: string | null; }
interface ZephyrTestCase { key: string; name: string; }

const ZEPHYR_BASE_URL = "https://api.zephyrscale.smartbear.com/v2";
const ZEPHYR_TOKEN = process.env.ZEPHYR_TOKEN;
const PROJECT_KEY = process.env.ZEPHYR_PROJECT_KEY || "SW";
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

if (!ZEPHYR_TOKEN) {
  console.error("[ERROR] ZEPHYR_TOKEN environment variable is required");
  process.exit(1);
}

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

function parseStoryFile(filePath: string, content: string): StoryCase[] {
  const stories: StoryCase[] = [];
  const lines = content.split("\n");

  // Extract component type from path using detected folder mapping
  const componentTypes = Object.keys(FOLDER_MAPPING);
  const componentTypePattern = componentTypes.length > 0
    ? new RegExp(`components/(${componentTypes.join("|")})/`)
    : null;
  const pathMatch = componentTypePattern ? filePath.match(componentTypePattern) : null;
  const componentType = pathMatch ? pathMatch[1] : "other";

  const titleMatch = content.match(/title:\s*["'](.+?)["']/);
  const componentName = titleMatch ? titleMatch[1].split("/").pop() || "Unknown" : path.basename(filePath, ".stories.tsx");

  const storyExportPattern = /^export\s+const\s+(\w+):\s*Story\s*=/;
  const zephyrIdPattern = /\[([A-Z]+-T\d+(?:,[A-Z]+-T\d+)*)\]\s*(.+)/;

  lines.forEach((line, index) => {
    const exportMatch = line.match(storyExportPattern);
    if (exportMatch) {
      const exportName = exportMatch[1];
      if (exportName === "default" || exportName === "meta") return;

      let storyName = exportName;
      let hasZephyrId = false;
      let existingId: string | undefined;

      for (let i = index; i < Math.min(index + 5, lines.length); i++) {
        const nameMatch = lines[i].match(/name:\s*["'](.+?)["']/);
        if (nameMatch) {
          storyName = nameMatch[1];
          const zephyrMatch = storyName.match(zephyrIdPattern);
          if (zephyrMatch) {
            hasZephyrId = true;
            existingId = zephyrMatch[1];
            storyName = zephyrMatch[2];
          }
          break;
        }
      }

      stories.push({ filePath, lineNumber: index + 1, storyName, exportName, componentName, componentType, hasZephyrId, existingId });
    }
  });
  return stories;
}

async function getFolders(): Promise<FolderCache> {
  if (Object.keys(folderIdCache).length > 0) return folderIdCache;
  const url = `${ZEPHYR_BASE_URL}/folders?projectKey=${PROJECT_KEY}&folderType=TEST_CASE&maxResults=100`;
  const response = await fetch(url, { method: "GET", headers: { Authorization: `Bearer ${ZEPHYR_TOKEN}`, "Content-Type": "application/json" } });
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
  const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${ZEPHYR_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ projectKey: PROJECT_KEY, name: folderName, folderType: "TEST_CASE" }) });
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
  const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${ZEPHYR_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) { const errorText = await response.text(); throw new Error(`Failed to create test case: ${response.status} ${errorText}`); }
  return await response.json();
}

function updateStoryFile(filePath: string, lineNumber: number, exportName: string, zephyrKey: string): boolean {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const lineIdx = lineNumber - 1;

  // Check if story already has a name property
  let hasNameProp = false;
  let nameLineIdx = -1;
  for (let i = lineIdx; i < Math.min(lineIdx + 5, lines.length); i++) {
    if (lines[i].match(/name:\s*["']/)) {
      hasNameProp = true;
      nameLineIdx = i;
      break;
    }
    if (lines[i].match(/^\s*\};?\s*$/)) break; // End of object
  }

  if (hasNameProp && nameLineIdx >= 0) {
    // Update existing name property
    const oldLine = lines[nameLineIdx];
    const nameMatch = oldLine.match(/(name:\s*["'])(.+?)(["'])/);
    if (nameMatch) {
      const newName = `[${zephyrKey}] ${nameMatch[2]}`;
      lines[nameLineIdx] = oldLine.replace(nameMatch[0], `${nameMatch[1]}${newName}${nameMatch[3]}`);
    }
  } else {
    // Add name property after the export line
    const exportLine = lines[lineIdx];
    if (exportLine.includes("{")) {
      // Inline object: export const Primary: Story = { args: ... }
      const humanName = exportName.replace(/([A-Z])/g, " $1").trim();
      lines[lineIdx] = exportLine.replace("{", `{ name: "[${zephyrKey}] ${humanName}",`);
    }
  }

  fs.writeFileSync(filePath, lines.join("\n"), "utf-8");
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
      updateStoryFile(story.filePath, story.lineNumber, story.exportName, result.key);

      successCount++;
    } catch (error: unknown) {
      console.error(`  [ERROR] ${error instanceof Error ? error.message : String(error)}`);
      failCount++;
    }
  }

  console.log("\n=====================================");
  console.log(`[INFO] Sync complete! Created: ${successCount}, Failed: ${failCount}`);
  if (failCount > 0) process.exit(1);
}

main().catch((error) => {
  console.error("[ERROR] Fatal error:", error);
  process.exit(1);
});

