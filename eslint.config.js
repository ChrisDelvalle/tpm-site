import { fileURLToPath } from "node:url";

import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import astro from "eslint-plugin-astro";
import jsdoc from "eslint-plugin-jsdoc";
import jsonc from "eslint-plugin-jsonc";
import jsxA11y from "eslint-plugin-jsx-a11y";
import * as mdx from "eslint-plugin-mdx";
import noUnsanitized from "eslint-plugin-no-unsanitized";
import regexp from "eslint-plugin-regexp";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import yml from "eslint-plugin-yml";
import globals from "globals";
import tseslint from "typescript-eslint";

const tsconfigRootDir = fileURLToPath(new URL(".", import.meta.url));

const typedFiles = [
  "src/**/*.{ts,tsx}",
  "tests/**/*.{ts,tsx}",
  "playwright.config.ts",
];

function scopeToTypedFiles(configs) {
  return configs.map((config) => ({
    ...config,
    files: typedFiles,
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        ...config.languageOptions?.parserOptions,
        project: ["./tsconfig.json", "./tsconfig.tools.json"],
        tsconfigRootDir,
      },
    },
  }));
}

export default tseslint.config(
  {
    ignores: [
      ".astro/",
      ".lighthouseci/",
      "_config.yml",
      "_site/",
      "assets/js/vendor/",
      "coverage/",
      "dist/",
      "docs/",
      "node_modules/",
      "playwright-report/",
      "public/assets/",
      "public/uploads/",
      "src/content/legacy/",
      "test-results/",
      "tmp/",
      "package-lock.json",
    ],
  },
  js.configs.recommended,
  ...astro.configs["flat/recommended"],
  ...astro.configs["flat/jsx-a11y-recommended"],
  {
    ...mdx.flat,
    files: ["**/*.mdx"],
    processor: mdx.createRemarkProcessor({
      lintCodeBlocks: true,
    }),
    rules: {
      ...mdx.flat.rules,
      "mdx/remark": "error",
      "no-irregular-whitespace": "off",
      "no-unused-vars": "off",
    },
    settings: {
      "mdx/code-blocks": true,
    },
  },
  {
    ...mdx.flatCodeBlocks,
    files: ["**/*.mdx/**"],
    rules: {
      ...mdx.flatCodeBlocks.rules,
      "no-var": "error",
      "prefer-const": "error",
    },
  },
  ...jsonc.configs["flat/recommended-with-jsonc"],
  ...yml.configs["flat/recommended"],
  regexp.configs["flat/recommended"],
  ...scopeToTypedFiles(tseslint.configs.recommended),
  ...scopeToTypedFiles(tseslint.configs.strictTypeChecked),
  ...scopeToTypedFiles(tseslint.configs.stylisticTypeChecked),
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.bunBuiltin,
      },
    },
    plugins: {
      jsdoc,
      "jsx-a11y": jsxA11y,
      "no-unsanitized": noUnsanitized,
      "simple-import-sort": simpleImportSort,
      sonarjs,
      unicorn,
    },
    rules: {
      "block-scoped-var": "error",
      curly: ["error", "all"],
      "default-case-last": "error",
      "dot-notation": "error",
      eqeqeq: ["error", "always"],
      "guard-for-in": "error",
      "no-alert": "error",
      "no-array-constructor": "error",
      "no-caller": "error",
      "no-console": "warn",
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "no-eval": "error",
      "no-extend-native": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "**/content/legacy/*",
            "**/content/legacy/**",
            "**/src/content/legacy/*",
            "**/src/content/legacy/**",
          ],
        },
      ],
      "no-restricted-properties": [
        "error",
        {
          message: "Focused tests must not be committed.",
          object: "describe",
          property: "only",
        },
        {
          message: "Focused tests must not be committed.",
          object: "it",
          property: "only",
        },
        {
          message: "Focused tests must not be committed.",
          object: "test",
          property: "only",
        },
      ],
      "no-new-wrappers": "error",
      "no-octal-escape": "error",
      "no-proto": "error",
      "no-script-url": "error",
      "no-sequences": "error",
      "no-template-curly-in-string": "error",
      "no-unneeded-ternary": "error",
      "no-useless-call": "error",
      "no-useless-computed-key": "error",
      "no-useless-concat": "error",
      "no-useless-return": "error",
      "no-var": "error",
      "one-var": ["error", "never"],
      "prefer-arrow-callback": "error",
      "prefer-const": "error",
      "prefer-object-has-own": "error",
      "prefer-regex-literals": "error",
      radix: "error",
      "require-atomic-updates": "error",
      "simple-import-sort/imports": "error",
      "sonarjs/cognitive-complexity": ["error", 18],
      "sonarjs/no-all-duplicated-branches": "error",
      "sonarjs/no-collapsible-if": "error",
      "sonarjs/no-duplicated-branches": "error",
      "sonarjs/no-identical-conditions": "error",
      "sonarjs/no-identical-expressions": "error",
      "sonarjs/no-redundant-boolean": "error",
      "unicorn/error-message": "error",
      "unicorn/no-abusive-eslint-disable": "error",
      "unicorn/no-new-array": "error",
      "unicorn/no-useless-fallback-in-spread": "error",
      "unicorn/no-useless-spread": "error",
      "unicorn/prefer-add-event-listener": "error",
      "unicorn/prefer-dom-node-text-content": "error",
      "unicorn/prefer-modern-dom-apis": "error",
      "unicorn/prefer-number-properties": "error",
      "unicorn/prefer-string-slice": "error",
      "unicorn/throw-new-error": "error",
      "no-unsanitized/method": "error",
      "no-unsanitized/property": "error",
      "jsdoc/check-alignment": "error",
      "jsdoc/check-param-names": "error",
      "jsdoc/check-property-names": "error",
      "jsdoc/check-tag-names": "error",
      "jsdoc/check-types": "error",
      "jsdoc/check-values": "error",
      "jsdoc/no-bad-blocks": "error",
      "jsdoc/no-blank-block-descriptions": "error",
      "jsdoc/no-blank-blocks": "error",
    },
  },
  {
    files: typedFiles,
    rules: {
      "dot-notation": "off",
      "@typescript-eslint/dot-notation": [
        "error",
        { allowIndexSignaturePropertyAccess: false },
      ],
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-explicit-any": [
        "error",
        { fixToUnknown: true, ignoreRestArgs: false },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/restrict-plus-operands": "error",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowBoolean: false, allowNumber: true },
      ],
      "@typescript-eslint/strict-boolean-expressions": [
        "error",
        { allowNullableString: false, allowNumber: false },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": "error",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-console": "error",
    },
  },
  {
    files: ["src/**/*.astro"],
    plugins: {
      "no-unsanitized": noUnsanitized,
    },
    rules: {
      "no-console": "error",
      "no-unsanitized/method": "error",
      "no-unsanitized/property": "error",
    },
  },
  {
    files: ["tests/**/*.ts", "scripts/**/*.mjs", "*.config.{js,cjs,ts,mjs}"],
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["src/env.d.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },
  eslintConfigPrettier,
);
