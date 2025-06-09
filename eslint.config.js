import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default [
  { ignores: ["dist"] },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "import": importPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "import/order": [
        "error",
        {
          "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "never",
          "alphabetize": {
            "order": "asc",
            "caseInsensitive": true
          },
          "pathGroups": [
            {
              "pattern": "react",
              "group": "builtin",
              "position": "before"
            },
            {
              "pattern": "@atoms/**",
              "group": "internal",
              "position": "after"
            },
            {
              "pattern": "@molecules/**",
              "group": "internal",
              "position": "after"
            },
            {
              "pattern": "@organisms/**",
              "group": "internal",
              "position": "after"
            },
            {
              "pattern": "@/**",
              "group": "internal",
              "position": "after"
            }
          ],
          "pathGroupsExcludedImportTypes": ["react"]
        }
      ]
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
]; 