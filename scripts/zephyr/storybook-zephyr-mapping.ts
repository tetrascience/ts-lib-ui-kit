import fs from "fs";
import path from "path";

import { Node, Project, type VariableDeclaration } from "ts-morph";

export type ZephyrMapping = Record<string, string[]>;

type CSF2ExportInfo = { storyName?: string; zephyrIds?: string[] };

function exportNameToTestName(exportName: string): string {
  return exportName
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-zA-Z])(\d+)/g, "$1 $2")
    .replace(/(\d+)([a-zA-Z])/g, "$1 $2");
}

function parseZephyrIds(value: string): string[] {
  return value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function extractNameFromStory(declaration: VariableDeclaration): string | undefined {
  const initializer = declaration.getInitializer();
  if (!initializer || !Node.isObjectLiteralExpression(initializer)) return undefined;

  const nameProp = initializer.getProperty("name");
  if (!nameProp || !Node.isPropertyAssignment(nameProp)) return undefined;

  const nameInit = nameProp.getInitializer();
  if (!nameInit || !Node.isStringLiteral(nameInit)) return undefined;

  return nameInit.getLiteralText();
}

function extractZephyrIdsFromDeclaration(declaration: VariableDeclaration): string[] {
  const initializer = declaration.getInitializer();
  if (!initializer || !Node.isObjectLiteralExpression(initializer)) return [];

  const parametersProp = initializer.getProperty("parameters");
  if (!parametersProp || !Node.isPropertyAssignment(parametersProp)) return [];

  const parametersInit = parametersProp.getInitializer();
  if (!parametersInit || !Node.isObjectLiteralExpression(parametersInit)) return [];

  const zephyrProp = parametersInit.getProperty("zephyr");
  if (!zephyrProp || !Node.isPropertyAssignment(zephyrProp)) return [];

  const zephyrInit = zephyrProp.getInitializer();
  if (!zephyrInit || !Node.isObjectLiteralExpression(zephyrInit)) return [];

  const testCaseIdProp = zephyrInit.getProperty("testCaseId");
  if (!testCaseIdProp || !Node.isPropertyAssignment(testCaseIdProp)) return [];

  const testCaseIdInit = testCaseIdProp.getInitializer();
  if (!testCaseIdInit || !Node.isStringLiteral(testCaseIdInit)) return [];

  return parseZephyrIds(testCaseIdInit.getLiteralText());
}

function findStoryFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const storyFiles: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) storyFiles.push(...findStoryFiles(fullPath));
    else if (entry.name.endsWith(".stories.tsx")) storyFiles.push(fullPath);
  }

  return storyFiles;
}

function extractZephyrIdsFromParametersObject(parametersExpr: Node): string[] {
  if (!Node.isObjectLiteralExpression(parametersExpr)) return [];

  const zephyrProp = parametersExpr.getProperty("zephyr");
  if (!zephyrProp || !Node.isPropertyAssignment(zephyrProp)) return [];

  const zephyrInit = zephyrProp.getInitializer();
  if (!zephyrInit || !Node.isObjectLiteralExpression(zephyrInit)) return [];

  const testCaseIdProp = zephyrInit.getProperty("testCaseId");
  if (!testCaseIdProp || !Node.isPropertyAssignment(testCaseIdProp)) return [];

  const testCaseIdInit = testCaseIdProp.getInitializer();
  if (!testCaseIdInit || !Node.isStringLiteral(testCaseIdInit)) return [];

  return parseZephyrIds(testCaseIdInit.getLiteralText());
}

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
    if (!exportedNames.has(objectName)) continue;

    const entry = csf2Exports.get(objectName) || {};
    const propertyName = left.getName();
    const right = expr.getRight();

    if (propertyName === "storyName" && Node.isStringLiteral(right)) entry.storyName = right.getLiteralText();
    if (propertyName === "parameters") entry.zephyrIds = extractZephyrIdsFromParametersObject(right);

    csf2Exports.set(objectName, entry);
  }

  return csf2Exports;
}

export function toStoryKey(filePath: string, testName: string, cwd = process.cwd()): string {
  const relativePath = path.isAbsolute(filePath) ? path.relative(cwd, filePath) : filePath;
  return `${relativePath.split(path.sep).join("/")}::${testName}`;
}

export function generateZephyrMapping(options: { cwd?: string; srcDir?: string } = {}): ZephyrMapping {
  const cwd = options.cwd ?? process.cwd();
  const srcDir = options.srcDir ?? path.join(cwd, "src");
  const mapping: ZephyrMapping = {};
  const project = new Project({ useInMemoryFileSystem: true });

  for (const filePath of findStoryFiles(srcDir)) {
    const relativePath = path.relative(cwd, filePath);
    const sourceFile = project.createSourceFile(relativePath, fs.readFileSync(filePath, "utf-8"));
    const exportedDeclarations = sourceFile.getExportedDeclarations();
    const exportedNames = new Set(exportedDeclarations.keys());

    for (const [exportName, declarations] of exportedDeclarations) {
      if (exportName === "default" || exportName === "meta" || exportName === "Template") continue;

      for (const decl of declarations) {
        if (!Node.isVariableDeclaration(decl)) continue;
        const typeText = decl.getTypeNode()?.getText();
        if (!typeText || (!typeText.includes("Story") && !typeText.includes("StoryObj"))) continue;

        const zephyrIds = extractZephyrIdsFromDeclaration(decl);
        if (zephyrIds.length === 0) continue;

        const testName = extractNameFromStory(decl) || exportNameToTestName(exportName);
        mapping[toStoryKey(filePath, testName, cwd)] = zephyrIds;
      }
    }

    for (const [exportName, { storyName, zephyrIds }] of parseCSF2Exports(sourceFile, exportedNames)) {
      if (!zephyrIds || zephyrIds.length === 0) continue;
      const testName = storyName || exportNameToTestName(exportName);
      const storyKey = toStoryKey(filePath, testName, cwd);
      if (!mapping[storyKey]) mapping[storyKey] = zephyrIds;
    }
  }

  return mapping;
}