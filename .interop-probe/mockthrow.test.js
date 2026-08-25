function probe(id) {
  try { jest.mock(id, () => ({})); return "no throw"; }
  catch (e) { return "THREW: " + e.message.split("\n")[0]; }
}
test("does jest.mock throw for unresolvable specifiers?", () => {
  for (const id of ["streamdown", "use-stick-to-bottom", "@shikijs/langs/python", "shiki/core", "plotly.js-dist", "@rdkit/rdkit", "definitely-not-installed-xyz"]) {
    console.log(id.padEnd(28), "->", probe(id));
  }
  expect(true).toBe(true);
});
