"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
async function load() {
  const grammar = await Promise.resolve().then(() => /* @__PURE__ */ _interopNamespaceDefault(require("@shikijs/langs/bash")));
  const local = await Promise.resolve().then(() => require("./inner.cjs"));
  const p = await Promise.resolve().then(() => /* @__PURE__ */ _interopNamespaceDefault(require("plotly.js-dist")));
  return { g: grammar.default, l: local.inner, p };
}
exports.load = load;
