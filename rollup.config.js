import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import { dts } from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";
import json from "@rollup/plugin-json";
import pkg from "./package.json" assert { type: "json" };

const banner = `/*
 * tetrascience-react-ui
 * Copyright ${new Date().getFullYear()} TetraScience, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */`;

export default [
  // React components (swallow any component .scss imports)
  {
    input: "src/index.ts",
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
        exports: "named",
        banner,
      },
      {
        file: pkg.module,
        format: "esm",
        sourcemap: true,
        exports: "named",
        banner,
      },
    ],
    external: [
      "react",
      "react-dom",
      ...Object.keys(pkg.peerDependencies || {}),
      ...Object.keys(pkg.dependencies || {}),
    ],
    plugins: [
      peerDepsExternal(),
      resolve({ extensions: [".js", ".jsx", ".ts", ".tsx", ".json"] }),
      commonjs(),
      json(),
      typescript({
        tsconfig: "./tsconfig.app.json",
        tsconfigOverride: { compilerOptions: { declaration: false } },
        clean: true,
      }),
      postcss({
        extensions: [".css", ".scss"],
        extract: false,
        inject: false,
        minimize: true,
        use: ["sass"],
        autoModules: false,
      }),
      terser({
        output: { comments: false },
        compress: { drop_console: false },
      }),
    ],
  },

  // Server JS build (main entry - includes all providers)
  {
    input: "src/server.ts",
    output: [
      {
        file: "dist/cjs/server.js",
        format: "cjs",
        sourcemap: true,
        exports: "named",
        banner,
      },
      {
        file: "dist/esm/server.js",
        format: "esm",
        sourcemap: true,
        exports: "named",
        banner,
      },
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
      resolve({ extensions: [".js", ".jsx", ".ts", ".tsx", ".json"] }),
      commonjs(),
      json(),
      typescript({
        tsconfig: "./tsconfig.app.json",
        tsconfigOverride: { compilerOptions: { declaration: false } },
        clean: true,
      }),
      terser({
        output: { comments: false },
        compress: { drop_console: false },
      }),
    ],
  },

  // Individual provider builds for tree-shaking
  {
    input: {
      athena: "src/server/providers/entries/athena.ts",
      snowflake: "src/server/providers/entries/snowflake.ts",
      databricks: "src/server/providers/entries/databricks.ts",
    },
    output: [
      {
        dir: "dist/cjs/providers",
        format: "cjs",
        sourcemap: true,
        exports: "named",
        entryFileNames: "[name].js",
        banner,
      },
      {
        dir: "dist/esm/providers",
        format: "esm",
        sourcemap: true,
        exports: "named",
        entryFileNames: "[name].js",
        banner,
      },
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
      resolve({ extensions: [".js", ".jsx", ".ts", ".tsx", ".json"] }),
      commonjs(),
      json(),
      typescript({
        tsconfig: "./tsconfig.app.json",
        tsconfigOverride: { compilerOptions: { declaration: false } },
        clean: true,
      }),
      terser({
        output: { comments: false },
        compress: { drop_console: false },
      }),
    ],
  },

  // CSS -> single CSS file (dist/index.css)
  {
    input: "src/index.css",
    output: {
      dir: "dist",
      assetFileNames: "[name][extname]",
    },
    plugins: [
      postcss({
        extensions: [".css", ".scss"],
        extract: "index.css",
        minimize: true,
        use: ["sass"],
      }),
    ],
  },

  // Bundle type declarations for main entry
  {
    input: "src/index.ts",
    output: { file: "dist/index.d.ts", format: "es" },
    external: [/\.scss$/],
    plugins: [dts()],
  },

  // Bundle type declarations for server entry
  {
    input: "src/server.ts",
    output: { file: "dist/server.d.ts", format: "es" },
    plugins: [dts()],
  },

  // Bundle type declarations for individual providers
  {
    input: {
      athena: "src/server/providers/entries/athena.ts",
      snowflake: "src/server/providers/entries/snowflake.ts",
      databricks: "src/server/providers/entries/databricks.ts",
    },
    output: {
      dir: "dist/providers",
      format: "es",
      entryFileNames: "[name].d.ts",
    },
    plugins: [dts()],
  },
];
