import { describe, expect, it } from "vitest";

import { diffTexts, foldUnchangedRows, toDiffRows } from "../diff-model";

import type { DiffRow } from "../diff-model";

const unchanged = (count: number, from = 0): DiffRow[] =>
  Array.from({ length: count }, (_, i) => ({ original: from + i, modified: from + i, changed: false }));

describe("diffTexts", () => {
  it("reports changed lines per side and pairs them for character ranges", () => {
    const diff = diffTexts('a\n"version": "1.4.0"\nc', 'a\n"version": "1.5.0"\nc\nd', false);

    expect(diff.original.changedLines).toEqual([1]);
    expect(diff.modified.changedLines).toEqual([1, 3]);
    expect(diff.original.charRanges).toEqual([{ line: 1, start: 14, end: 15 }]);
    expect(diff.modified.charRanges).toEqual([{ line: 1, start: 14, end: 15 }]);
    expect(diff.hunks).toEqual([
      { changed: false, original: [0], modified: [0] },
      { changed: true, original: [1], modified: [1] },
      { changed: false, original: [2], modified: [2] },
      { changed: true, original: [], modified: [3] },
    ]);
  });

  it("splits CRLF text the way Shiki does", () => {
    expect(diffTexts("a\r\nb", "a\nb", false).hunks).toEqual([{ changed: false, original: [0, 1], modified: [0, 1] }]);
  });

  it("leaves character ranges out when a pair of lines shares no words", () => {
    const diff = diffTexts("alpha beta", "gamma delta", false);
    expect(diff.original.changedLines).toEqual([0]);
    expect(diff.original.charRanges).toEqual([]);
    expect(diff.modified.charRanges).toEqual([]);
  });

  it("leaves character ranges out when a line was replaced rather than edited", () => {
    // The two lines share only the comma.
    const diff = diffTexts("  ],", '    { "id": "export", "format": "csv" }', false);
    expect(diff.original.charRanges).toEqual([]);
    expect(diff.modified.charRanges).toEqual([]);
  });

  it("treats lines that differ only in surrounding whitespace as unchanged when asked to", () => {
    expect(diffTexts("  a\nb", "a  \nb", true).hunks).toEqual([{ changed: false, original: [0, 1], modified: [0, 1] }]);
    expect(diffTexts("  a\nb", "a  \nb", false).original.changedLines).toEqual([0]);
  });
});

describe("toDiffRows", () => {
  const { hunks } = diffTexts("a\nb\nc\nd", "a\nB\nd\ne", false);

  it("pairs removed and added lines on one row in split mode", () => {
    expect(toDiffRows(hunks, "split")).toEqual([
      { original: 0, modified: 0, changed: false },
      { original: 1, modified: 1, changed: true },
      { original: 2, modified: undefined, changed: true },
      { original: 3, modified: 2, changed: false },
      { original: undefined, modified: 3, changed: true },
    ]);
  });

  it("lists removed lines before added ones in unified mode", () => {
    expect(toDiffRows(hunks, "unified")).toEqual([
      { original: 0, modified: 0, changed: false },
      { original: 1, changed: true },
      { original: 2, changed: true },
      { modified: 1, changed: true },
      { original: 3, modified: 2, changed: false },
      { modified: 3, changed: true },
    ]);
  });
});

describe("foldUnchangedRows", () => {
  it("keeps three lines of context beside a change and folds the rest", () => {
    const change: DiffRow = { original: 10, modified: 10, changed: true };
    const folded = foldUnchangedRows([...unchanged(10), change, ...unchanged(10, 11)]);

    expect(folded).toEqual([
      { hidden: unchanged(7) },
      ...unchanged(3, 7),
      change,
      ...unchanged(3, 11),
      { hidden: unchanged(7, 14) },
    ]);
  });

  it("leaves a run alone when it would hide fewer than three lines", () => {
    const first: DiffRow = { original: 0, modified: 0, changed: true };
    const last: DiffRow = { original: 9, modified: 9, changed: true };
    const rows = [first, ...unchanged(8, 1), last];
    expect(foldUnchangedRows(rows)).toEqual(rows);
  });

  it("folds a diff with no changes into one row", () => {
    expect(foldUnchangedRows(unchanged(5))).toEqual([{ hidden: unchanged(5) }]);
  });
});
