import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import postcssLess from "postcss-less";
import { dts } from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";
import json from "@rollup/plugin-json";
import pkg from "./package.json" assert { type: "json" };

export default [
  // JS build (processes .less and .css)
  {
    input: "src/index.ts",
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
        exports: "named",
        banner: "/* octant-ui-components – proprietary licence, © Octant 2025 */",
      },
      {
        file: pkg.module,
        format: "esm",
        sourcemap: true,
        exports: "named",
        banner: "/* octant-ui-components – proprietary licence, © Octant 2025 */",
      },
    ],
    external: [
      "react",
      "react-dom",
      ...Object.keys(pkg.peerDependencies || {}),
      ...Object.keys(pkg.dependencies   || {}),
    ],
    plugins: [
      peerDepsExternal(),
      resolve({ extensions: [".js", ".jsx", ".ts", ".tsx", ".json"] }),
      commonjs(),
      json(),
      typescript({
        tsconfig:        "./tsconfig.app.json",
        tsconfigOverride:{ compilerOptions: { declaration: false } },
        clean:           true,
      }),
      postcss({
        extensions: [".css", ".less"],
        extract:    false,
        inject:     false,
        minimize:   true,
        use:        ["less"],
        syntax:     postcssLess,
        autoModules: false,
      }),
      terser({ output: { comments: false }, compress: { drop_console: false } }),
    ],
  },

  // CSS bundle (only .css)
  {
    input: "src/index.css",
    output: {
      dir:            "dist",
      assetFileNames: "[name][extname]"
    },
    plugins: [
      postcss({
        extensions: [".css"],
        extract:    "index.css",
        minimize:   true,
      }),
    ],
  },

  // Bundle type declarations
  {
    input:  "src/index.ts",
    output: { file: "dist/index.d.ts", format: "es" },
    external:[ /\.less$/ ],
    plugins:[ dts() ],
  },
];
