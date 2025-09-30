// eslint.config.js
import tsParser from "@typescript-eslint/parser";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// убираем битый глоб
const browserGlobals = { ...globals.browser };
delete browserGlobals["AudioWorkletGlobalScope "];

export default [
  {
    ignores: [
      "**/.github/",
      "**/.vscode/",
      "**/android/",
      "**/coverage/",
      "**/demonstration/",
      "**/dist/",
      "**/info/",
      "**/node_modules/",
      "**/public/",
      "**/resources/",
    ],
  },

  // JS/JSX файлы — без TS project
  {
    files: ["*.js", "*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...browserGlobals,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      prettier,
    },
    rules: {
      "no-unused-vars": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/react-in-jsx-scope": "off",
      "prettier/prettier": ["warn"],
    },
  },

  // TS/TSX файлы — с project
  {
    files: ["*.ts", "*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        tsconfigRootDir: __dirname,
        project: "./tsconfig.json",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...browserGlobals,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      react,
      "react-hooks": reactHooks,
      prettier,
    },
    rules: {
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/unbound-method": ["warn", { ignoreStatic: true }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/react-in-jsx-scope": "off",
      "prettier/prettier": ["warn"],
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // Тесты — отдельные правила
  {
    files: ["src/tests/**"],
    rules: {
      "@typescript-eslint/unbound-method": "off",
      "import/first": "off",
    },
  },
];
