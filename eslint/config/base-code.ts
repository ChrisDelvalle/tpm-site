import { fixupPluginRules } from "@eslint/compat";
import eslintComments from "@eslint-community/eslint-plugin-eslint-comments";
import stylistic from "@stylistic/eslint-plugin";
import arrayFunc from "eslint-plugin-array-func";
import decoratorPosition from "eslint-plugin-decorator-position";
import jsdoc from "eslint-plugin-jsdoc";
import jsxA11y from "eslint-plugin-jsx-a11y";
import noOnlyTests from "eslint-plugin-no-only-tests";
import noUnsanitized from "eslint-plugin-no-unsanitized";
import noUseExtendNative from "eslint-plugin-no-use-extend-native";
import perfectionist from "eslint-plugin-perfectionist";
import promise from "eslint-plugin-promise";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefreshPlugin from "eslint-plugin-react-refresh";
import security from "eslint-plugin-security";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import type { ConfigWithExtends } from "typescript-eslint";

import { publicDocumentationRules } from "./documentation";
import { unsafeNumericGlobals } from "./restrictions";
import { requiredConfig, rulesAsErrors, type RuleSettings } from "./shared";

const arrayFuncRecommendedConfig = requiredConfig(
  arrayFunc.configs["recommended"],
  "array-func/recommended",
);

const noUseExtendNativeRecommendedConfig = requiredConfig(
  noUseExtendNative.configs["recommended"],
  "no-use-extend-native/recommended",
);

const promiseRecommendedConfig = requiredConfig(
  promise.configs["flat/recommended"],
  "promise/flat/recommended",
);

const securityRecommendedConfig = requiredConfig(
  security.configs["recommended"],
  "security/recommended",
);

const perfectionistRules = {
  ...rulesAsErrors(perfectionist.configs["recommended-natural"].rules),
  "perfectionist/sort-imports": "off",
  "perfectionist/sort-named-imports": "off",
  "perfectionist/sort-objects": "off",
} satisfies RuleSettings;

/**
 * Creates general JavaScript and TypeScript rules shared across code files.
 *
 * @returns Flat config blocks for normal source and tooling code.
 */
export function createBaseCodeConfigs(): readonly ConfigWithExtends[] {
  return [
    {
      files: ["**/*.{js,mjs,cjs,ts,tsx}"],
      ignores: ["**/*.astro/**", "**/*.mdx/**"],
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
          ...globals.bunBuiltin,
        },
      },
    },
    {
      files: ["**/*.{js,mjs,cjs,ts,tsx}"],
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      plugins: {
        "@eslint-community/eslint-comments": fixupPluginRules(eslintComments),
        "@stylistic": stylistic,
        "array-func": arrayFunc,
        "decorator-position": decoratorPosition,
        jsdoc,
        "jsx-a11y": jsxA11y,
        "no-only-tests": noOnlyTests,
        "no-unsanitized": noUnsanitized,
        "no-use-extend-native": noUseExtendNative,
        perfectionist,
        promise,
        "react-hooks": reactHooks,
        "react-refresh": reactRefreshPlugin,
        security,
        "simple-import-sort": simpleImportSort,
        sonarjs,
        unicorn,
      },
      rules: {
        ...rulesAsErrors(arrayFuncRecommendedConfig.rules),
        ...rulesAsErrors(eslintComments.configs.recommended.rules),
        ...rulesAsErrors(noUseExtendNativeRecommendedConfig.rules),
        ...perfectionistRules,
        ...rulesAsErrors(promiseRecommendedConfig.rules),
        ...rulesAsErrors(securityRecommendedConfig.rules),
        ...rulesAsErrors(stylistic.configs.recommended.rules),
        "block-scoped-var": "error",
        curly: ["error", "all"],
        "decorator-position/decorator-position": "error",
        "default-case-last": "error",
        "dot-notation": "error",
        eqeqeq: ["error", "always"],
        "guard-for-in": "error",
        "jsdoc/check-alignment": "error",
        "jsdoc/check-param-names": "error",
        "jsdoc/check-property-names": "error",
        "jsdoc/check-tag-names": "error",
        "jsdoc/check-template-names": "error",
        "jsdoc/check-types": "error",
        "jsdoc/check-values": "error",
        "jsdoc/empty-tags": "error",
        "jsdoc/implements-on-classes": "error",
        "jsdoc/no-bad-blocks": "error",
        "jsdoc/no-blank-block-descriptions": "error",
        "jsdoc/no-blank-blocks": "error",
        "jsdoc/no-defaults": "error",
        "jsdoc/no-multi-asterisks": "error",
        "jsdoc/no-types": "error",
        "jsdoc/require-hyphen-before-param-description": ["error", "never"],
        "jsdoc/require-param-name": "error",
        "jsdoc/require-property": "error",
        "jsdoc/require-property-description": "error",
        "jsdoc/require-property-name": "error",
        "jsdoc/require-template": "error",
        "jsdoc/require-template-description": "error",
        "no-alert": "error",
        "no-array-constructor": "error",
        "no-caller": "error",
        "no-console": "error",
        "no-debugger": "error",
        "no-duplicate-imports": "error",
        "no-eval": "error",
        "no-extend-native": "error",
        "no-implicit-coercion": [
          "error",
          {
            allow: [],
            boolean: false,
            disallowTemplateShorthand: true,
            number: true,
            string: true,
          },
        ],
        "no-implied-eval": "error",
        "no-new-func": "error",
        "no-new-wrappers": "error",
        "no-octal-escape": "error",
        "no-only-tests/no-only-tests": "error",
        "no-param-reassign": "error",
        "no-proto": "error",
        "no-restricted-globals": ["error", ...unsafeNumericGlobals],
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
        "no-script-url": "error",
        "no-sequences": "error",
        "no-template-curly-in-string": "error",
        "no-undef-init": "error",
        "no-unneeded-ternary": "error",
        "no-unsanitized/method": "error",
        "no-unsanitized/property": "error",
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
        "sonarjs/cognitive-complexity": ["error", 15],
        "sonarjs/no-all-duplicated-branches": "error",
        "sonarjs/no-collapsible-if": "error",
        "sonarjs/no-duplicated-branches": "error",
        "sonarjs/no-identical-conditions": "error",
        "sonarjs/no-identical-expressions": "error",
        "sonarjs/no-inverted-boolean-check": "error",
        "sonarjs/no-nested-conditional": "error",
        "sonarjs/no-redundant-boolean": "error",
        "sonarjs/no-small-switch": "error",
        "sonarjs/no-useless-catch": "error",
        "unicorn/catch-error-name": "error",
        "unicorn/error-message": "error",
        "unicorn/no-abusive-eslint-disable": "error",
        "unicorn/no-anonymous-default-export": "error",
        "unicorn/no-new-array": "error",
        "unicorn/no-static-only-class": "error",
        "unicorn/no-useless-fallback-in-spread": "error",
        "unicorn/no-useless-spread": "error",
        "unicorn/prefer-add-event-listener": "error",
        "unicorn/prefer-dom-node-text-content": "error",
        "unicorn/prefer-modern-dom-apis": "error",
        "unicorn/prefer-number-properties": "error",
        "unicorn/prefer-string-slice": "error",
        "unicorn/throw-new-error": "error",
        ...publicDocumentationRules,
      },
    },
  ];
}
