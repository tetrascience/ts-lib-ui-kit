import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import storybookPlugin from "eslint-plugin-storybook";
import importPlugin from "eslint-plugin-import";
import unicornPlugin from "eslint-plugin-unicorn";
import sonarjsPlugin from "eslint-plugin-sonarjs";
import jsdocPlugin from "eslint-plugin-jsdoc";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import globals from "globals";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/**/*", "node_modules/**/*", "examples/**/*", "storybook-static/**/*"],
  },
  // Main TypeScript/React configuration
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      import: importPlugin,
      unicorn: unicornPlugin,
      sonarjs: sonarjsPlugin,
      "jsx-a11y": jsxA11yPlugin,
      jsdoc: jsdocPlugin,
    },
    rules: {
      // ==========================================================================
      // Code Complexity & Quality (sonarjs + unicorn)
      // Goal: Flag overly complex functions/files for better code quality and AI-generated code
      // ==========================================================================

      // Cognitive complexity - helps identify functions that are hard to understand
      // Default threshold of 15 is reasonable; increase if too noisy
      "sonarjs/cognitive-complexity": ["warn", 15],

      // Detect code smells and potential bugs
      "sonarjs/no-identical-functions": "warn",
      "sonarjs/no-duplicated-branches": "warn",
      "sonarjs/no-collapsible-if": "warn",
      "sonarjs/no-collection-size-mischeck": "error",
      "sonarjs/no-redundant-jump": "warn",
      "sonarjs/no-same-line-conditional": "warn",
      "sonarjs/no-unused-collection": "warn",
      "sonarjs/prefer-immediate-return": "warn",
      "sonarjs/prefer-single-boolean-return": "warn",
      "sonarjs/no-nested-template-literals": "warn",

      // Unicorn - various helpful rules for cleaner code
      "unicorn/no-useless-undefined": "warn",
      "unicorn/prefer-array-find": "warn",
      "unicorn/prefer-array-flat-map": "warn",
      "unicorn/prefer-array-some": "warn",
      "unicorn/prefer-includes": "warn",
      "unicorn/prefer-string-starts-ends-with": "warn",
      "unicorn/prefer-ternary": ["warn", "only-single-line"],
      "unicorn/no-lonely-if": "warn",
      "unicorn/no-negated-condition": "warn",
      "unicorn/prefer-optional-catch-binding": "warn",
      "unicorn/prefer-regexp-test": "warn",
      "unicorn/prefer-default-parameters": "warn",
      "unicorn/no-array-push-push": "warn",
      "unicorn/prefer-spread": "warn",

      // Disable overly opinionated unicorn rules
      "unicorn/filename-case": "off", // We have existing naming conventions
      "unicorn/prevent-abbreviations": "off", // Too noisy for existing codebase
      "unicorn/no-null": "off", // null is valid in many cases
      "unicorn/no-array-reduce": "off", // reduce is useful when appropriate
      "unicorn/no-array-for-each": "off", // forEach is fine for side effects
      "unicorn/prefer-module": "off", // We handle module system at build level
      "unicorn/prefer-top-level-await": "off", // Not always applicable
      "unicorn/prefer-node-protocol": "off", // Not relevant for browser code

      // Accessibility rules (jsx-a11y)
      // These help ensure components are accessible to all users
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-has-content": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/heading-has-content": "warn",
      "jsx-a11y/img-redundant-alt": "warn",
      "jsx-a11y/interactive-supports-focus": "warn",
      "jsx-a11y/label-has-associated-control": "warn",
      "jsx-a11y/no-access-key": "warn",
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/no-redundant-roles": "warn",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "jsx-a11y/tabindex-no-positive": "warn",

      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "off", // Existing codebase uses any in several places
      "@typescript-eslint/ban-ts-comment": ["error", { "ts-ignore": "allow-with-description" }],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false,
        },
      ],

      // React rules
      "react/react-in-jsx-scope": "off", // Not needed with new JSX transform (React 17+)
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/forbid-component-props": [
        "warn",
        {
          forbid: [
            {
              propName: "style",
              message:
                "Avoid inline styles. Use CSS classes in SCSS files instead. Only use inline styles for dynamic values that depend on props.",
            },
          ],
        },
      ],

      // Magic numbers - warn on hardcoded values in component logic
      // Note: This rule is intentionally lenient to reduce noise while still
      // catching obvious cases. Constants files are excluded below.
      "no-magic-numbers": [
        "warn",
        {
          ignore: [-1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16, 24, 32, 48, 100], // Common values for layouts, percentages, grid sizes
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          enforceConst: true,
          detectObjects: false,
        },
      ],

      // Import organization
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/no-duplicates": "warn",

      // ==========================================================================
      // JSDoc - Enforce documentation on component Props interfaces
      // Ensures the auto-generated component catalog stays populated
      // ==========================================================================
      "jsdoc/require-jsdoc": [
        "warn",
        {
          require: {
            FunctionDeclaration: false,
            MethodDefinition: false,
            ClassDeclaration: false,
          },
          contexts: [
            // Require JSDoc on interfaces ending in "Props"
            "TSInterfaceDeclaration[id.name=/Props$/]",
            // Require JSDoc on each property of Props interfaces
            "TSInterfaceDeclaration[id.name=/Props$/] > TSPropertySignature",
            // Require JSDoc on type aliases ending in "Props" (e.g. type FooProps = {...})
            "TSTypeAliasDeclaration[id.name=/Props$/]",
          ],
        },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  // Component-level JSDoc requirements
  // Scoped to src/components to avoid noise from icon assets and server utilities.
  // This block overrides the global jsdoc/require-jsdoc for component files, so it
  // must repeat the Props contexts in addition to the new component-level contexts.
  {
    files: ["src/components/**/*.tsx"],
    ignores: ["src/components/**/*.stories.tsx"],
    rules: {
      "jsdoc/require-jsdoc": [
        "warn",
        {
          require: {
            FunctionDeclaration: false,
            MethodDefinition: false,
            ClassDeclaration: false,
          },
          contexts: [
            // Require JSDoc on interfaces ending in "Props"
            "TSInterfaceDeclaration[id.name=/Props$/]",
            // Require JSDoc on each property of Props interfaces
            "TSInterfaceDeclaration[id.name=/Props$/] > TSPropertySignature",
            // Require JSDoc on type aliases ending in "Props" (e.g. type FooProps = {...})
            "TSTypeAliasDeclaration[id.name=/Props$/]",
            // Require JSDoc on exported arrow function components: export const Foo = () => {}
            // The JSDoc before `export` attaches to ExportNamedDeclaration in the AST,
            // so we must target that node (not VariableDeclarator) for the plugin to find it.
            // [init.type='ArrowFunctionExpression'] excludes styled-components
            // (TaggedTemplateExpression) and story exports (ObjectExpression).
            "ExportNamedDeclaration:has(VariableDeclarator[id.name=/^[A-Z]/][init.type='ArrowFunctionExpression'])",
            // Require JSDoc on non-exported arrow function components: const Foo = () => {}
            // Must exclude VariableDeclarations inside ExportNamedDeclaration to avoid double-matching.
            "VariableDeclaration:not(ExportNamedDeclaration > VariableDeclaration):has(VariableDeclarator[id.name=/^[A-Z]/][init.type='ArrowFunctionExpression'])",
            // Require JSDoc on exported generic function components (e.g. export function Table<T>() {})
            "ExportNamedDeclaration > FunctionDeclaration[id.name=/^[A-Z]/]",
          ],
        },
      ],
    },
  },
  // Storybook-specific configuration
  ...storybookPlugin.configs["flat/recommended"],
  {
    files: ["**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)"],
    rules: {
      // Storybook files often need inline styles for demos
      "react/forbid-component-props": "off",
      // Storybook files often have magic numbers for demo data
      "no-magic-numbers": "off",
      // Story names are generated from export names and used for Zephyr sync
      "storybook/no-redundant-story-name": "off",
      // Story files are tests/demos, not library components — no JSDoc required
      "jsdoc/require-jsdoc": "off",
    },
  },
  // Test files - more lenient rules
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**/*"],
    rules: {
      "no-magic-numbers": "off",
      "react/forbid-component-props": "off",
    },
  },
  // Constants and configuration files - magic numbers are expected
  {
    files: ["**/constants.ts", "**/constants.tsx", "**/config.ts", "**/config.tsx"],
    rules: {
      "no-magic-numbers": "off",
    },
  },
  // Script files - more lenient cognitive complexity for build/automation scripts
  {
    files: ["scripts/**/*.ts", "scripts/**/*.tsx"],
    rules: {
      // Scripts are often procedural and more complex; allow higher threshold
      // Zephyr sync scripts are particularly complex due to AST parsing
      "sonarjs/cognitive-complexity": ["warn", 75],
      "no-magic-numbers": "off",
    },
  },
  // Barrel files (index.ts) must use `export *` for re-exports.
  // Named re-exports like `export { Foo } from "./bar"` or
  // `export type { Foo } from "./bar"` are redundant when `export *` is used.
  {
    files: ["src/**/index.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportNamedDeclaration[source]",
          message: "Use `export * from \"...\"` instead of named re-exports in barrel files.",
        },
      ],
    },
  },
  // Component source files must use inline exports (`export const`, `export interface`, etc.)
  // instead of bottom-of-file `export { Foo }` / `export type { Foo }` / `export default`.
  {
    files: ["src/components/**/*.ts", "src/components/**/*.tsx"],
    ignores: ["src/components/**/index.ts", "src/components/**/*.stories.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportNamedDeclaration:not([source]):not([declaration])",
          message:
            "Use inline exports (`export const`, `export interface`, `export type`) instead of `export { ... }` at the bottom of the file.",
        },
      ],
    },
  },
);
