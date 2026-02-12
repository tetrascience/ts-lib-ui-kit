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

import fs from 'fs';
import path from 'path';

import { Project, Node } from 'ts-morph';

import type { VariableDeclaration} from 'ts-morph';

// ============================================================================
// TypeScript Types
// ============================================================================

/** Represents the type of story export pattern detected */
export type StoryPattern = 'csf3-object' | 'csf2-template-bind' | 'arrow-function' | 'react-fc' | 'unknown';

export interface StoryCase {
  filePath: string;
  lineNumber: number;
  storyName: string;
  exportName: string;
  componentName: string;
  componentType: string;
  hasZephyrId: boolean;
  existingId?: string;
  /** Whether the story has a zephyr property with empty testCaseId (needs update, not creation) */
  hasEmptyZephyrProperty: boolean;
  /** The detected story pattern for proper update handling */
  pattern: StoryPattern;
}

interface ZephyrFolder {
  id: string;
  name: string;
}
interface FolderCache {
  [key: string]: string | null;
}
interface ZephyrTestCase {
  key: string;
  name: string;
}

const ZEPHYR_BASE_URL = 'https://api.zephyrscale.smartbear.com/v2';
const PROJECT_KEY = process.env.ZEPHYR_PROJECT_KEY || 'SW';

function getZephyrToken(): string {
  const token = process.env.ZEPHYR_TOKEN;
  if (!token) {
    console.error('[ERROR] ZEPHYR_TOKEN environment variable is required');
    process.exit(1);
  }
  return token;
}
const ZEPHYR_LABELS = process.env.ZEPHYR_LABELS?.split(',')
  .map((l) => l.trim())
  .filter(Boolean) || ['storybook', 'vitest', 'automated'];

// Folder prefix for Zephyr - can be customized via env var
const FOLDER_PREFIX = process.env.ZEPHYR_FOLDER_PREFIX || 'UI Kit';

// Dynamically generate folder mapping from src/components directory structure
function generateFolderMapping(): { [key: string]: string } {
  const componentsDir = path.join(process.cwd(), 'src', 'components');
  const mapping: { [key: string]: string } = {};

  if (!fs.existsSync(componentsDir)) {
    console.warn('[WARN] src/components directory not found, using empty folder mapping');
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
    } else if (entry.name.endsWith('.stories.tsx')) {
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
    if (typeText === 'Story' || typeText.includes('StoryObj')) {
      return 'csf3-object';
    }
    if (typeText.includes('React.FC') || typeText.includes('FC<')) {
      return 'react-fc';
    }
  }

  if (!initializer) return 'unknown';

  // Check initializer pattern
  if (Node.isCallExpression(initializer)) {
    const expression = initializer.getExpression();
    // Template.bind({}) pattern
    if (Node.isPropertyAccessExpression(expression)) {
      const propName = expression.getName();
      if (propName === 'bind') {
        return 'csf2-template-bind';
      }
    }
  }

  if (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer)) {
    return 'arrow-function';
  }

  if (Node.isObjectLiteralExpression(initializer)) {
    return 'csf3-object';
  }

  return 'unknown';
}

/** Extracts the name property value from a story object if present */
export function extractNameFromStory(declaration: VariableDeclaration): string | undefined {
  const initializer = declaration.getInitializer();
  if (!initializer || !Node.isObjectLiteralExpression(initializer)) return undefined;

  const nameProp = initializer.getProperty('name');
  if (!nameProp || !Node.isPropertyAssignment(nameProp)) return undefined;

  const nameInit = nameProp.getInitializer();
  if (!nameInit || !Node.isStringLiteral(nameInit)) return undefined;

  return nameInit.getLiteralText();
}

/** Result of extracting Zephyr IDs from parameters */
export interface ZephyrIdExtraction {
  /** Array of non-empty Zephyr IDs found */
  ids: string[];
  /** Whether a zephyr.testCaseId property exists (even if empty) */
  hasZephyrProperty: boolean;
}

/** Extracts Zephyr ID from parameters.zephyr.testCaseId if present */
export function extractZephyrIdsFromParameters(declaration: VariableDeclaration): ZephyrIdExtraction {
  const result: ZephyrIdExtraction = { ids: [], hasZephyrProperty: false };

  const initializer = declaration.getInitializer();
  if (!initializer || !Node.isObjectLiteralExpression(initializer)) return result;

  const parametersProp = initializer.getProperty('parameters');
  if (!parametersProp || !Node.isPropertyAssignment(parametersProp)) return result;

  const parametersInit = parametersProp.getInitializer();
  if (!parametersInit || !Node.isObjectLiteralExpression(parametersInit)) return result;

  const zephyrProp = parametersInit.getProperty('zephyr');
  if (!zephyrProp || !Node.isPropertyAssignment(zephyrProp)) return result;

  const zephyrInit = zephyrProp.getInitializer();
  if (!zephyrInit || !Node.isObjectLiteralExpression(zephyrInit)) return result;

  const testCaseIdProp = zephyrInit.getProperty('testCaseId');
  if (!testCaseIdProp || !Node.isPropertyAssignment(testCaseIdProp)) return result;

  const testCaseIdInit = testCaseIdProp.getInitializer();
  if (!testCaseIdInit || !Node.isStringLiteral(testCaseIdInit)) return result;

  // Property exists - mark it as such
  result.hasZephyrProperty = true;

  // Only add non-empty IDs
  const value = testCaseIdInit.getLiteralText();
  if (value.trim()) {
    result.ids = [value];
  }

  return result;
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

    if (left.getName() !== 'storyName') continue;

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
  const componentTypePattern =
    componentTypes.length > 0 ? new RegExp(`components/(${componentTypes.join('|')})/`) : null;
  const pathMatch = componentTypePattern ? filePath.match(componentTypePattern) : null;
  const componentType = pathMatch ? pathMatch[1] : 'other';

  // Create a ts-morph project and parse the file
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('temp.tsx', content);

  // Extract component name from meta/default export title
  let componentName = path.basename(filePath, '.stories.tsx');
  const defaultExport = sourceFile.getDefaultExportSymbol();
  if (defaultExport) {
    const declarations = defaultExport.getDeclarations();
    for (const decl of declarations) {
      if (Node.isExportAssignment(decl)) {
        const expr = decl.getExpression();
        if (Node.isObjectLiteralExpression(expr)) {
          const titleProp = expr.getProperty('title');
          if (titleProp && Node.isPropertyAssignment(titleProp)) {
            const titleInit = titleProp.getInitializer();
            if (titleInit && Node.isStringLiteral(titleInit)) {
              const titleParts = titleInit.getLiteralText().split('/');
              componentName = titleParts[titleParts.length - 1] || componentName;
            }
          }
        }
      }
    }
  }

  // Also check for `const meta = { title: ... }` pattern
  const metaVar = sourceFile.getVariableDeclaration('meta');
  if (metaVar) {
    const init = metaVar.getInitializer();
    if (init && Node.isObjectLiteralExpression(init)) {
      const titleProp = init.getProperty('title');
      if (titleProp && Node.isPropertyAssignment(titleProp)) {
        const titleInit = titleProp.getInitializer();
        if (titleInit && Node.isStringLiteral(titleInit)) {
          const titleParts = titleInit.getLiteralText().split('/');
          componentName = titleParts[titleParts.length - 1] || componentName;
        }
      }
    }
  }

  // Find all exported variable declarations
  const exportedDeclarations = sourceFile.getExportedDeclarations();

  for (const [exportName, declarations] of exportedDeclarations) {
    // Skip default export, meta, and Template
    if (exportName === 'default' || exportName === 'meta' || exportName === 'Template') continue;

    for (const decl of declarations) {
      if (!Node.isVariableDeclaration(decl)) continue;

      const pattern = detectStoryPattern(decl);
      if (pattern === 'unknown') continue;

      const lineNumber = decl.getStartLineNumber();

      // Try to get story name from various sources
      let storyName = exportName;
      let hasZephyrId = false;
      let hasEmptyZephyrProperty = false;
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

      // Priority 1: Check for Zephyr IDs in parameters.zephyr.testCaseIds (new format)
      const zephyrExtraction = extractZephyrIdsFromParameters(decl);
      if (zephyrExtraction.ids.length > 0) {
        hasZephyrId = true;
        existingId = zephyrExtraction.ids.join(',');
      } else if (zephyrExtraction.hasZephyrProperty) {
        // Has zephyr property with empty testCaseId - needs ID to be filled in
        hasEmptyZephyrProperty = true;
      }

      // Priority 2: Check if name contains Zephyr ID (legacy format - for backward compatibility)
      if (!hasZephyrId && !hasEmptyZephyrProperty) {
        const zephyrMatch = storyName.match(zephyrIdPattern);
        if (zephyrMatch) {
          hasZephyrId = true;
          existingId = zephyrMatch[1];
          storyName = zephyrMatch[2];
        }
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
        hasEmptyZephyrProperty,
        pattern,
      });
    }
  }

  return stories;
}

async function getFolders(): Promise<FolderCache> {
  if (Object.keys(folderIdCache).length > 0) return folderIdCache;
  const url = `${ZEPHYR_BASE_URL}/folders?projectKey=${PROJECT_KEY}&folderType=TEST_CASE&maxResults=100`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${getZephyrToken()}`, 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    console.warn('Could not fetch folders');
    return {};
  }
  const data = await response.json();
  const folders = data.values || [];
  for (const [compType, folderName] of Object.entries(FOLDER_MAPPING)) {
    const existing = folders.find((f: ZephyrFolder) => f.name === folderName);
    if (existing) {
      folderIdCache[compType] = existing.id;
    } else {
      try {
        const newF = await createFolder(folderName);
        folderIdCache[compType] = newF.id;
        console.log(`[INFO] Created folder: ${folderName}`);
      } catch (e: unknown) {
        console.warn(`[WARN] Could not create folder ${folderName}:`, e instanceof Error ? e.message : String(e));
        folderIdCache[compType] = null;
      }
    }
  }
  return folderIdCache;
}

async function createFolder(folderName: string): Promise<ZephyrFolder> {
  const url = `${ZEPHYR_BASE_URL}/folders`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getZephyrToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectKey: PROJECT_KEY, name: folderName, folderType: 'TEST_CASE' }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create folder: ${response.status} ${errorText}`);
  }
  return await response.json();
}

async function getFolderId(componentType: string): Promise<string | null> {
  await getFolders();
  return folderIdCache[componentType] || null;
}

async function createTestCase(testName: string, objective: string, folderId: string | null): Promise<ZephyrTestCase> {
  const url = `${ZEPHYR_BASE_URL}/testcases`;
  const body: { projectKey: string; name: string; objective: string; labels: string[]; folderId?: string } = {
    projectKey: PROJECT_KEY,
    name: testName,
    objective,
    labels: ZEPHYR_LABELS,
  };
  if (folderId) body.folderId = folderId;
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getZephyrToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create test case: ${response.status} ${errorText}`);
  }
  return await response.json();
}

// ============================================================================
// AST-based Story File Updates
// ============================================================================

/**
 * Updates a story file to add or update a Zephyr ID in parameters.zephyr.testCaseId
 * Uses line-by-line text processing for better formatting control
 */
function updateStoryFile(
  filePath: string,
  _lineNumber: number,
  exportName: string,
  zephyrKey: string,
  pattern: StoryPattern,
  hasEmptyZephyrProperty: boolean = false,
): boolean {
  // Only CSF3 object pattern is supported for the new format
  if (pattern !== 'csf3-object') {
    console.warn(`  [WARN] Pattern "${pattern}" not supported for new Zephyr ID format.`);
    console.warn(`         Please convert to CSF3 object format first.`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // If the story has an empty zephyr property, use simple string replacement
  if (hasEmptyZephyrProperty) {
    return updateEmptyZephyrId(filePath, content, exportName, zephyrKey);
  }

  const lines = content.split('\n');
  const newLines: string[] = [];

  // Find the story export and add parameters.zephyr.testCaseIds
  const storyStartPattern = new RegExp(`^export const ${exportName}:\\s*Story\\s*=\\s*\\{`);
  let inTargetStory = false;
  let braceDepth = 0;
  let foundParameters = false;
  let foundZephyr = false;
  let storyIndent = '';
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!inTargetStory && storyStartPattern.test(line)) {
      inTargetStory = true;
      braceDepth = 1;
      storyIndent = line.match(/^(\s*)/)?.[1] || '';
      newLines.push(line);
      continue;
    }

    if (inTargetStory) {
      // Count braces to track when we exit the story object
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      braceDepth += openBraces - closeBraces;

      // Check if this line has parameters
      if (line.includes('parameters:') && !foundParameters) {
        foundParameters = true;
        newLines.push(line);

        // Check if zephyr is on the same line or next lines
        if (line.includes('zephyr:')) {
          foundZephyr = true;
        }
        continue;
      }

      // Check if we found zephyr inside parameters
      if (foundParameters && !foundZephyr && line.includes('zephyr:')) {
        foundZephyr = true;
        newLines.push(line);
        continue;
      }

      // If we're at the end of the story and haven't added parameters yet
      if (braceDepth === 0) {
        if (!foundParameters) {
          // Insert parameters before the closing brace
          newLines.push(`${storyIndent}  parameters: {`);
          newLines.push(`${storyIndent}    zephyr: { testCaseId: "${zephyrKey}" },`);
          newLines.push(`${storyIndent}  },`);
          modified = true;
        }
        inTargetStory = false;
        foundParameters = false;
        foundZephyr = false;
      }

      // If we found parameters but not zephyr, and we're about to close parameters
      if (foundParameters && !foundZephyr && braceDepth === 1 && line.trim().startsWith('},')) {
        // Check if this closes the parameters block
        const prevLine = newLines[newLines.length - 1] || '';
        if (!prevLine.includes('zephyr:')) {
          // Insert zephyr before closing parameters
          newLines.push(`${storyIndent}    zephyr: { testCaseId: "${zephyrKey}" },`);
          foundZephyr = true;
          modified = true;
        }
      }

      newLines.push(line);
    } else {
      newLines.push(line);
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf-8');
    return true;
  }

  // Fallback: If line-by-line didn't work, try AST approach
  return updateStoryFileAST(filePath, exportName, zephyrKey);
}

/**
 * Updates an existing empty testCaseId with the new Zephyr key
 * Uses AST-based approach for precise replacement
 */
function updateEmptyZephyrId(
  filePath: string,
  content: string,
  exportName: string,
  zephyrKey: string,
): boolean {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(filePath, content);

  const declaration = sourceFile.getVariableDeclaration(exportName);
  if (!declaration) {
    console.warn(`  [WARN] Could not find declaration for "${exportName}" in ${filePath}`);
    return false;
  }

  const initializer = declaration.getInitializer();
  if (!initializer || !Node.isObjectLiteralExpression(initializer)) {
    console.warn(`  [WARN] Story "${exportName}" is not an object literal`);
    return false;
  }

  const parametersProp = initializer.getProperty('parameters');
  if (!parametersProp || !Node.isPropertyAssignment(parametersProp)) {
    console.warn(`  [WARN] Could not find parameters in "${exportName}"`);
    return false;
  }

  const parametersInit = parametersProp.getInitializer();
  if (!parametersInit || !Node.isObjectLiteralExpression(parametersInit)) {
    console.warn(`  [WARN] Parameters is not an object in "${exportName}"`);
    return false;
  }

  const zephyrProp = parametersInit.getProperty('zephyr');
  if (!zephyrProp || !Node.isPropertyAssignment(zephyrProp)) {
    console.warn(`  [WARN] Could not find zephyr property in "${exportName}"`);
    return false;
  }

  const zephyrInit = zephyrProp.getInitializer();
  if (!zephyrInit || !Node.isObjectLiteralExpression(zephyrInit)) {
    console.warn(`  [WARN] Zephyr is not an object in "${exportName}"`);
    return false;
  }

  const testCaseIdProp = zephyrInit.getProperty('testCaseId');
  if (!testCaseIdProp || !Node.isPropertyAssignment(testCaseIdProp)) {
    console.warn(`  [WARN] Could not find testCaseId in "${exportName}"`);
    return false;
  }

  // Replace the empty string with the new key
  const testCaseIdInit = testCaseIdProp.getInitializer();
  if (testCaseIdInit && Node.isStringLiteral(testCaseIdInit)) {
    testCaseIdInit.replaceWithText(`"${zephyrKey}"`);
    fs.writeFileSync(filePath, sourceFile.getFullText(), 'utf-8');
    return true;
  }

  console.warn(`  [WARN] testCaseId is not a string literal in "${exportName}"`);
  return false;
}

/** Fallback AST-based update for complex cases */
function updateStoryFileAST(filePath: string, exportName: string, zephyrKey: string): boolean {
  const content = fs.readFileSync(filePath, 'utf-8');
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(filePath, content);

  const declaration = sourceFile.getVariableDeclaration(exportName);
  if (!declaration) {
    console.warn(`  [WARN] Could not find declaration for "${exportName}" in ${filePath}`);
    return false;
  }

  const initializer = declaration.getInitializer();
  if (!initializer || !Node.isObjectLiteralExpression(initializer)) {
    console.warn(`  [WARN] Story "${exportName}" is not an object literal`);
    return false;
  }

  // Check if parameters already exists
  const parametersProp = initializer.getProperty('parameters');
  if (parametersProp && Node.isPropertyAssignment(parametersProp)) {
    const parametersInit = parametersProp.getInitializer();
    if (parametersInit && Node.isObjectLiteralExpression(parametersInit)) {
      // Check if zephyr already exists
      const zephyrProp = parametersInit.getProperty('zephyr');
      if (!zephyrProp) {
        // Add zephyr to existing parameters with comment
        // Note: ts-morph doesn't easily support adding leading comments to property assignments,
        // so we use the line-by-line approach as the primary method. This fallback won't include the comment.
        parametersInit.insertPropertyAssignment(0, {
          name: 'zephyr',
          initializer: `{ testCaseId: "${zephyrKey}" }`,
        });
      }
    }
  } else {
    // Add parameters with zephyr
    initializer.addPropertyAssignment({
      name: 'parameters',
      initializer: `{\n    // Auto-generated by sync-storybook-zephyr - do not add manually\n    zephyr: { testCaseId: "${zephyrKey}" },\n  }`,
    });
  }

  fs.writeFileSync(filePath, sourceFile.getFullText(), 'utf-8');
  return true;
}

function generateObjective(story: StoryCase): string {
  const humanName = story.storyName.replace(/([A-Z])/g, ' $1').trim();
  const relativePath = path.relative(process.cwd(), story.filePath);
  return `Component: ${story.componentName}<br/>Story: ${humanName}<br/>File: \`${relativePath}\``;
}

async function main(): Promise<void> {
  console.log('[INFO] Scanning for story files...\n');
  console.log(`[INFO] Configuration:`);
  console.log(`  Project Key: ${PROJECT_KEY}`);
  console.log(`  Labels: ${ZEPHYR_LABELS.join(', ')}`);
  console.log(`  Folder Prefix: ${FOLDER_PREFIX}`);
  console.log(`  Detected Component Types: ${Object.keys(FOLDER_MAPPING).join(', ') || '(none)'}\n`);

  const srcDir = path.join(process.cwd(), 'src');
  const storyFiles = findStoryFiles(srcDir);
  console.log(`[INFO] Found ${storyFiles.length} story file(s)\n`);

  const allStories: StoryCase[] = [];
  for (const file of storyFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const stories = parseStoryFile(file, content);
    allStories.push(...stories);
  }

  // Stories needing IDs: either no Zephyr ID OR has empty Zephyr property
  const storiesNeedingIds = allStories.filter((s) => !s.hasZephyrId || s.hasEmptyZephyrProperty);
  const storiesWithEmptyProperty = storiesNeedingIds.filter((s) => s.hasEmptyZephyrProperty);
  const storiesWithIds = allStories.filter((s) => s.hasZephyrId);

  console.log(`[INFO] Stories with Zephyr IDs: ${storiesWithIds.length}`);
  console.log(`[INFO] Stories needing Zephyr IDs: ${storiesNeedingIds.length}`);
  if (storiesWithEmptyProperty.length > 0) {
    console.log(`  - ${storiesWithEmptyProperty.length} with empty testCaseId (will be updated)`);
  }
  console.log('');

  if (storiesNeedingIds.length === 0) {
    console.log('[INFO] All stories already have Zephyr IDs!\n');
    return;
  }

  let successCount = 0;
  let failCount = 0;
  let updateFailCount = 0;

  for (const story of storiesNeedingIds) {
    const relativePath = path.relative(process.cwd(), story.filePath);
    const updateType = story.hasEmptyZephyrProperty ? 'UPDATE' : 'CREATE';
    console.log(`\n[PROCESS] ${relativePath} - ${story.exportName} (${updateType})`);

    try {
      const folderId = await getFolderId(story.componentType);
      const objective = generateObjective(story);
      const humanName = story.storyName.replace(/([A-Z])/g, ' $1').trim();
      const testName = `${story.componentName} - ${humanName}`;

      console.log(`  [API] Creating test case in Zephyr...`);
      const result = await createTestCase(testName, objective, folderId);
      console.log(`  [SUCCESS] Created ${result.key}`);

      console.log(`  [UPDATE] Updating story file with ${result.key}`);
      const updateSuccess = updateStoryFile(
        story.filePath,
        story.lineNumber,
        story.exportName,
        result.key,
        story.pattern,
        story.hasEmptyZephyrProperty,
      );

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

  console.log('\n=====================================');
  console.log(`[INFO] Sync complete!`);
  console.log(`  Fully synced: ${successCount}`);
  console.log(`  Created but needs manual update: ${updateFailCount}`);
  console.log(`  Failed: ${failCount}`);
  if (failCount > 0) process.exit(1);
  if (updateFailCount > 0) {
    console.log('\n[WARN] Some stories require manual Zephyr ID tagging. See warnings above.');
  }
}

// Only run main when script is executed directly (not imported for testing)
if (process.env.NODE_ENV !== 'test' && process.argv[1]?.includes('sync-storybook-zephyr')) {
  main().catch((error) => {
    console.error('[ERROR] Fatal error:', error);
    process.exit(1);
  });
}
