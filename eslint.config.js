import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import storybookPlugin from "eslint-plugin-storybook";
import importPlugin from "eslint-plugin-import";
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
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "off",
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
      "react/react-in-jsx-scope": "off",
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
    },
    settings: {
      react: {
        version: "detect",
      },
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
    },
  },
  // Constants and configuration files - magic numbers are expected
  {
    files: ["**/constants.ts", "**/constants.tsx", "**/config.ts", "**/config.tsx"],
    rules: {
      "no-magic-numbers": "off",
    },
  },
  // Test files - more lenient rules
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**/*"],
    rules: {
      "no-magic-numbers": "off",
      "react/forbid-component-props": "off",
    },
  }
);
