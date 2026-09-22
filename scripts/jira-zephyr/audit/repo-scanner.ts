/**
 * Repository scanner: the read-only view of "what does the repo say about
 * stories and Zephyr IDs, and which Jira-keyed commits produced them".
 *
 * Mapping model (see README): Zephyr IDs live only in
 * `parameters.zephyr.testCaseId` on each story export; Jira keys live in commit
 * subjects (`feat: SW-1234 …`), merge subjects (branch names) and story-source
 * comments. The Zephyr-ID *line* is added later by the sync workflow's keyless
 * chore commit (or lands inside an unrelated squash), so the reliable anchor for
 * "which ticket produced this story" is the blame of the export declaration line.
 *
 * Everything here shells out to git in read-only mode and parses story files
 * with ts-morph; nothing is written.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { Node, Project, type SourceFile, type VariableStatement } from "ts-morph";

import { extractJiraKeys, parseZephyrIds } from "../shared/keys";

export interface CommitInfo {
  hash: string;
  subject: string;
  jiraKeys: string[];
}

export interface StoryRecord {
  /** Repo-relative POSIX path of the story file. */
  file: string;
  exportName: string;
  /** Display name Storybook derives (explicit `name` or the split export name). */
  storyName: string;
  /** 1-based line of the `export const …` declaration (blame anchor). */
  declarationLine: number;
  /** 1-based inclusive range covering leading comments and the whole statement. */
  startLine: number;
  endLine: number;
  zephyrIds: string[];
  /** True when `parameters.zephyr.testCaseId` exists but is empty (awaiting sync). */
  hasEmptyZephyrId: boolean;
  /** Leading comments + statement source, used for Jira-key references. */
  text: string;
  /** Jira keys written in `text` (filtered to known project keys). */
  jiraKeys: string[];
}

export interface StoryFileRecord {
  file: string;
  componentName: string;
  stories: StoryRecord[];
  fullText: string;
  /** Jira keys written in the file outside every story (headers, helpers, meta). */
  fileLevelJiraKeys: string[];
}

export interface BlameLine {
  commit: CommitInfo;
  content: string;
}

export interface RepoIndex {
  cwd: string;
  files: Map<string, StoryFileRecord>;
  storiesByZephyrId: Map<string, StoryRecord[]>;
  /** Newest-first history of each story file (subject + Jira keys). */
  commitsByFile: Map<string, CommitInfo[]>;
  /** Story files only, derived from the story-file history. */
  filesByJiraKey: Map<string, Set<string>>;
  /**
   * Every file each key's commits touched, story or not. Lazily computed: it
   * costs a repo-wide `git log`, and only the story-only filter needs it.
   */
  allFilesByJiraKey(): Map<string, Set<string>>;
  /** Project keys used to filter key-like tokens (e.g. `UTF-8`) out of free text. */
  projectKeys: Set<string>;
  /** Lazily computed, cached per file. */
  blame(file: string): Map<number, BlameLine>;
  /** The commit that first added the file (following renames), or null when unknown. */
  originCommit(file: string): CommitInfo | null;
}

export interface RepoIndexOptions {
  cwd?: string;
  /** Directory (relative to cwd) to scan for `*.stories.tsx`; defaults to `src`. */
  srcDir?: string;
  projectKeys: Iterable<string>;
}

const UNCOMMITTED_HASH = "0".repeat(40);
/** ASCII record/unit separators (0x1e / 0x1f) keep git output unambiguous whatever a subject contains. */
const RECORD_SEP = String.fromCharCode(0x1e);
const UNIT_SEP = String.fromCharCode(0x1f);
const SHA_RE = /^[0-9a-f]{40}$/;

export function runGit(cwd: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

export function toPosix(relativePath: string): string {
  return relativePath.split(path.sep).join("/");
}

/** Matches Storybook's export-name → display-name algorithm (same as scripts/zephyr). */
export function exportNameToStoryName(exportName: string): string {
  return exportName
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-zA-Z])(\d+)/g, "$1 $2")
    .replace(/(\d+)([a-zA-Z])/g, "$1 $2");
}

export function findStoryFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const found: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules") found.push(...findStoryFiles(full));
    } else if (entry.name.endsWith(".stories.tsx")) {
      found.push(full);
    }
  }
  return found.sort();
}

/** Strips `satisfies T`, `as T` and parentheses so `{…} satisfies Meta<…>` is seen as its object literal. */
function unwrapExpression(node: Node | undefined): Node | undefined {
  let current = node;
  while (
    current &&
    (Node.isSatisfiesExpression(current) ||
      Node.isAsExpression(current) ||
      Node.isParenthesizedExpression(current) ||
      Node.isTypeAssertion(current))
  ) {
    current = current.getExpression();
  }
  return current;
}

function stringProperty(node: Node | undefined, name: string): string | undefined {
  const objectLiteral = unwrapExpression(node);
  if (!objectLiteral || !Node.isObjectLiteralExpression(objectLiteral)) return undefined;
  const property = objectLiteral.getProperty(name);
  if (!property || !Node.isPropertyAssignment(property)) return undefined;
  const initializer = property.getInitializer();
  return initializer && Node.isStringLiteral(initializer) ? initializer.getLiteralText() : undefined;
}

function objectProperty(node: Node | undefined, name: string): Node | undefined {
  const objectLiteral = unwrapExpression(node);
  if (!objectLiteral || !Node.isObjectLiteralExpression(objectLiteral)) return undefined;
  const property = objectLiteral.getProperty(name);
  if (!property || !Node.isPropertyAssignment(property)) return undefined;
  return property.getInitializer();
}

function componentNameFrom(sourceFile: SourceFile, filePath: string): string {
  const fallback = path.basename(filePath, ".stories.tsx");
  const metaVar = sourceFile.getVariableDeclaration("meta");
  const fromMeta = stringProperty(metaVar?.getInitializer(), "title");
  const defaultExport = sourceFile.getDefaultExportSymbol()?.getDeclarations()[0];
  const fromDefault =
    defaultExport && Node.isExportAssignment(defaultExport)
      ? stringProperty(defaultExport.getExpression(), "title")
      : undefined;
  const title = fromMeta ?? fromDefault;
  if (!title) return fallback;
  const last = title.split("/").pop()?.trim();
  return last || fallback;
}

function isStoryDeclaration(statement: VariableStatement): boolean {
  return statement.getDeclarations().some((declaration) => {
    const typeText = declaration.getTypeNode()?.getText() ?? "";
    if (typeText.includes("Story")) return true;
    const initializer = unwrapExpression(declaration.getInitializer());
    return initializer !== undefined && Node.isObjectLiteralExpression(initializer);
  });
}

/** Parses one story file's CSF3 exports. Exported for tests; production code goes through buildRepoIndex. */
export function parseStoryFile(
  file: string,
  fullText: string,
  project = new Project({ useInMemoryFileSystem: true }),
  projectKeys?: ReadonlySet<string>,
): StoryFileRecord {
  const sourceFile = project.createSourceFile(file, fullText, { overwrite: true });
  const stories: StoryRecord[] = [];

  for (const statement of sourceFile.getVariableStatements()) {
    if (!statement.isExported() || !isStoryDeclaration(statement)) continue;
    for (const declaration of statement.getDeclarations()) {
      const exportName = declaration.getName();
      if (exportName === "meta" || exportName === "Template") continue;
      const initializer = declaration.getInitializer();
      const parameters = objectProperty(initializer, "parameters");
      const zephyr = objectProperty(parameters, "zephyr");
      const testCaseId = stringProperty(zephyr, "testCaseId");
      const leading = statement.getLeadingCommentRanges();
      const leadingText = leading.map((range) => range.getText()).join("\n");
      const startLine =
        leading.length > 0
          ? sourceFile.getLineAndColumnAtPos(leading[0].getPos()).line
          : statement.getStartLineNumber(false);
      const text = leadingText ? `${leadingText}\n${statement.getText()}` : statement.getText();
      stories.push({
        file,
        exportName,
        storyName: stringProperty(initializer, "name") ?? exportNameToStoryName(exportName),
        declarationLine: statement.getStartLineNumber(false),
        startLine,
        endLine: statement.getEndLineNumber(),
        zephyrIds: testCaseId ? parseZephyrIds(testCaseId) : [],
        hasEmptyZephyrId: testCaseId !== undefined && parseZephyrIds(testCaseId).length === 0,
        text,
        jiraKeys: extractJiraKeys(text, projectKeys),
      });
    }
  }

  const storyKeys = new Set(stories.flatMap((story) => story.jiraKeys));
  const record: StoryFileRecord = {
    file,
    componentName: componentNameFrom(sourceFile, file),
    stories,
    fullText,
    fileLevelJiraKeys: extractJiraKeys(fullText, projectKeys).filter((key) => !storyKeys.has(key)),
  };
  project.removeSourceFile(sourceFile);
  return record;
}

function toCommitInfo(hash: string, subject: string, projectKeys: ReadonlySet<string>): CommitInfo {
  if (hash === UNCOMMITTED_HASH) return { hash, subject: "(uncommitted working-tree change)", jiraKeys: [] };
  return { hash, subject, jiraKeys: extractJiraKeys(subject, projectKeys) };
}

/**
 * One `git log` over every story file, newest first. `--diff-merges=first-parent`
 * makes a non-squash merge commit ("Merge pull request … from …/SW-1234-…")
 * list the files its branch changed, so branch-name keys still attach to files.
 */
export function loadStoryFileHistory(
  cwd: string,
  srcDir: string,
  projectKeys: ReadonlySet<string>,
): Map<string, CommitInfo[]> {
  const pathspec = `:(glob)${toPosix(srcDir)}/**/*.stories.tsx`;
  const baseArgs = ["log", "--format=%x1e%H%x1f%s", "--name-only"];
  let output: string;
  try {
    output = runGit(cwd, [...baseArgs, "--diff-merges=first-parent", "--", pathspec]);
  } catch {
    output = runGit(cwd, [...baseArgs, "--", pathspec]);
  }
  return parseHistory(output, projectKeys);
}

/** True for a path that carries test cases rather than shipped library code. */
export function isStoryPath(file: string): boolean {
  return file.endsWith(".stories.tsx");
}

/**
 * Every file each Jira key's commits touched, across the whole repository —
 * not just story files, which is the point: it is what distinguishes a ticket
 * that changed shipped code from one that only added stories.
 *
 * One `git log` over all of history, bucketed by the keys in each commit
 * subject. Commits carrying no key are parsed and discarded; that is cheaper
 * than one `git log --grep` per key, and it matches on the same parsed subject
 * the rest of the scanner uses rather than a second, looser grep.
 */
export function loadFilesByJiraKey(cwd: string, projectKeys: ReadonlySet<string>): Map<string, Set<string>> {
  const baseArgs = ["log", "--format=%x1e%H%x1f%s", "--name-only"];
  let output: string;
  try {
    output = runGit(cwd, [...baseArgs, "--diff-merges=first-parent"]);
  } catch {
    output = runGit(cwd, baseArgs);
  }
  const byKey = new Map<string, Set<string>>();
  for (const block of output.split(RECORD_SEP)) {
    const lines = block.split("\n").map((line) => line.trimEnd());
    const header = lines.shift();
    if (!header) continue;
    const [hash, subject = ""] = header.split(UNIT_SEP);
    if (!SHA_RE.test(hash)) continue;
    const { jiraKeys } = toCommitInfo(hash, subject, projectKeys);
    if (jiraKeys.length === 0) continue;
    const files = lines.filter((line) => line.length > 0);
    for (const key of jiraKeys) {
      const set = byKey.get(key) ?? new Set<string>();
      for (const file of files) set.add(file);
      byKey.set(key, set);
    }
  }
  return byKey;
}

/**
 * Whether a key's commits touched anything outside story files.
 *
 * `undefined` when the key has no keyed commits at all — "we cannot tell" is a
 * different answer from "it changed only stories", and the caller must not skip
 * a ticket on the strength of an empty history.
 */
export function touchesNonStoryFiles(files: ReadonlySet<string> | undefined): boolean | undefined {
  if (!files || files.size === 0) return undefined;
  for (const file of files) {
    if (!isStoryPath(file)) return true;
  }
  return false;
}

export function parseHistory(output: string, projectKeys: ReadonlySet<string>): Map<string, CommitInfo[]> {
  const history = new Map<string, CommitInfo[]>();
  for (const block of output.split(RECORD_SEP)) {
    const lines = block.split("\n").map((line) => line.trimEnd());
    const header = lines.shift();
    if (!header) continue;
    const [hash, subject = ""] = header.split(UNIT_SEP);
    if (!SHA_RE.test(hash)) continue;
    const commit = toCommitInfo(hash, subject, projectKeys);
    for (const file of lines.filter((line) => line.length > 0)) {
      const list = history.get(file) ?? [];
      list.push(commit);
      history.set(file, list);
    }
  }
  return history;
}

/** Parses `git blame --line-porcelain` output into per-line commit + content. */
export function parseBlamePorcelain(output: string, projectKeys: ReadonlySet<string>): Map<number, BlameLine> {
  const subjects = new Map<string, string>();
  const result = new Map<number, BlameLine>();
  let current: { hash: string; finalLine: number } | null = null;
  for (const line of output.split("\n")) {
    const header = /^([0-9a-f]{40}) (\d+) (\d+)(?: (\d+))?$/.exec(line);
    if (header) {
      current = { hash: header[1], finalLine: Number(header[3]) };
      continue;
    }
    if (!current) continue;
    if (line.startsWith("summary ")) {
      subjects.set(current.hash, line.slice("summary ".length));
    } else if (line.startsWith("\t")) {
      const commit = toCommitInfo(current.hash, subjects.get(current.hash) ?? "", projectKeys);
      result.set(current.finalLine, { commit, content: line.slice(1) });
      current = null;
    }
  }
  return result;
}

export function blameFile(cwd: string, file: string, projectKeys: ReadonlySet<string>): Map<number, BlameLine> {
  return parseBlamePorcelain(runGit(cwd, ["blame", "--line-porcelain", "-w", "--", file]), projectKeys);
}

export function fileOriginCommit(cwd: string, file: string, projectKeys: ReadonlySet<string>): CommitInfo | null {
  const output = runGit(cwd, ["log", "--follow", "--diff-filter=A", "--format=%H%x1f%s", "--", file]).trim();
  if (!output) return null;
  const oldest = output.split("\n").pop() ?? "";
  const [hash, subject = ""] = oldest.split(UNIT_SEP);
  return SHA_RE.test(hash) ? toCommitInfo(hash, subject, projectKeys) : null;
}

export function buildRepoIndex(options: RepoIndexOptions): RepoIndex {
  const cwd = options.cwd ?? process.cwd();
  const srcDir = options.srcDir ?? "src";
  const projectKeys = new Set(options.projectKeys);
  const project = new Project({ useInMemoryFileSystem: true });

  const files = new Map<string, StoryFileRecord>();
  const storiesByZephyrId = new Map<string, StoryRecord[]>();
  for (const absolute of findStoryFiles(path.join(cwd, srcDir))) {
    const file = toPosix(path.relative(cwd, absolute));
    const record = parseStoryFile(file, fs.readFileSync(absolute, "utf8"), project, projectKeys);
    files.set(file, record);
    for (const story of record.stories) {
      for (const id of story.zephyrIds) {
        const list = storiesByZephyrId.get(id) ?? [];
        list.push(story);
        storiesByZephyrId.set(id, list);
      }
    }
  }

  const commitsByFile = loadStoryFileHistory(cwd, srcDir, projectKeys);
  let allFiles: Map<string, Set<string>> | undefined;
  const filesByJiraKey = new Map<string, Set<string>>();
  for (const [file, commits] of commitsByFile) {
    for (const commit of commits) {
      for (const key of commit.jiraKeys) {
        const set = filesByJiraKey.get(key) ?? new Set<string>();
        set.add(file);
        filesByJiraKey.set(key, set);
      }
    }
  }

  const blameCache = new Map<string, Map<number, BlameLine>>();
  const originCache = new Map<string, CommitInfo | null>();
  return {
    cwd,
    files,
    storiesByZephyrId,
    commitsByFile,
    filesByJiraKey,
    allFilesByJiraKey: () => {
      allFiles ??= loadFilesByJiraKey(cwd, projectKeys);
      return allFiles;
    },
    projectKeys,
    blame(file) {
      let cached = blameCache.get(file);
      if (!cached) {
        cached = blameFile(cwd, file, projectKeys);
        blameCache.set(file, cached);
      }
      return cached;
    },
    originCommit(file) {
      if (!originCache.has(file)) originCache.set(file, fileOriginCommit(cwd, file, projectKeys));
      return originCache.get(file) ?? null;
    },
  };
}

export interface RepoState {
  head: string;
  branch: string;
  dirty: boolean;
}

export function describeRepoState(cwd: string): RepoState {
  return {
    head: runGit(cwd, ["rev-parse", "HEAD"]).trim(),
    branch: runGit(cwd, ["rev-parse", "--abbrev-ref", "HEAD"]).trim(),
    dirty: runGit(cwd, ["status", "--porcelain"]).trim().length > 0,
  };
}
