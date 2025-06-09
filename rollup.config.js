import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import { dts } from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";
import json from "@rollup/plugin-json";
import pkg from "./package.json" assert { type: "json" };

export default [
  // JS build (swallow any component .scss imports)
  {
    input: "src/index.ts",
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
        exports: "named",
        banner: "/* tetrascience-ui – proprietary licence, © Tetrascience 2025 */",
      },
      {
        file: pkg.module,
        format: "esm",
        sourcemap: true,
        exports: "named",
        banner: "/* tetrascience-ui – proprietary licence, © Tetrascience 2025 */",
      },
    ],
    external: [
      "react",
      "react-dom",
      "styled-components",
      "@monaco-editor/react",
      "monaco-editor",
      "react-markdown",
      "react-syntax-highlighter",
      "rehype-raw",
      "remark-gfm",
      "plotly.js",
      ...Object.keys(pkg.peerDependencies || {}),
      ...Object.keys(pkg.dependencies   || {}),
    ],
    plugins: [
      peerDepsExternal(),
      resolve({ 
        extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
        alias: {
          '@': 'src',
          '@atoms': 'src/components/atoms',
          '@molecules': 'src/components/molecules',
          '@organisms': 'src/components/organisms',
          '@styles': 'src/styles',
          '@utils': 'src/utils',
          '@assets': 'src/assets',
        }
      }),
      commonjs(),
      json(),
      typescript({
        tsconfig:        "./tsconfig.app.json",
        tsconfigOverride:{ compilerOptions: { declaration: false } },
        clean:           true,
      }),
      postcss({
        extensions: [".css", ".scss"],
        extract:    false,
        inject:     false,
        minimize:   true,
        use:        {
          sass: {
            silenceDeprecations: ['legacy-js-api'],
          }
        },
        autoModules: false,
      }),
      terser({ output: { comments: false }, compress: { drop_console: false } }),
    ],
  },

  // SCSS -> single CSS file (dist/index.css)
  {
    input: "src/styles/index.scss",
    output: {
      dir:            "dist",
      assetFileNames: "[name][extname]"
    },
    plugins: [
      postcss({
        extensions: [".css", ".scss"],
        extract:    "index.css",
        minimize:   true,
        use:        {
          sass: {
            silenceDeprecations: ['legacy-js-api'],
          }
        },
      }),
    ],
  },

  // Bundle type declarations
  {
    input:  "src/index.ts",
    output: { file: "dist/index.d.ts", format: "es" },
    external:[ 
      /\.scss$/, 
      "react", 
      "react-dom",
      "styled-components",
      "monaco-editor",
      "@monaco-editor/react" 
    ],
    plugins:[ 
      dts({
        respectExternal: true,
        compilerOptions: {
          baseUrl: ".",
          paths: {
            "@/*": ["src/*"],
            "@atoms/*": ["src/components/atoms/*"],
            "@molecules/*": ["src/components/molecules/*"],
            "@organisms/*": ["src/components/organisms/*"],
            "@styles/*": ["src/styles/*"],
            "@utils/*": ["src/utils/*"]
          }
        }
      }) 
    ],
  },
];
