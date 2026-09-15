import path from "node:path";

/** Repo-relative when the file is inside `cwd`, absolute otherwise (never `../../..` chains). */
export function displayPath(absolute: string, cwd = process.cwd()): string {
  const relative = path.relative(cwd, absolute);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative) ? relative : absolute;
}
