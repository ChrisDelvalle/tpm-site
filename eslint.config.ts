import path from "node:path";
import { fileURLToPath } from "node:url";

import { fixupPluginRules } from "@eslint/compat";
import js from "@eslint/js";
import eslintComments from "@eslint-community/eslint-plugin-eslint-comments";
import html from "@html-eslint/eslint-plugin";
import shopify from "@shopify/eslint-plugin";
import stylistic from "@stylistic/eslint-plugin";
import type { ESLint } from "eslint";
import { globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import arrayFunc from "eslint-plugin-array-func";
import astro from "eslint-plugin-astro";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import compat from "eslint-plugin-compat";
import decoratorPosition from "eslint-plugin-decorator-position";
import etc from "eslint-plugin-etc";
import functional from "eslint-plugin-functional";
import importPlugin from "eslint-plugin-import";
import jsdoc from "eslint-plugin-jsdoc";
import jsonc from "eslint-plugin-jsonc";
import jsxA11y from "eslint-plugin-jsx-a11y";
import * as mdx from "eslint-plugin-mdx";
import n from "eslint-plugin-n";
import noConstructorBind from "eslint-plugin-no-constructor-bind";
import noExplicitTypeExports from "eslint-plugin-no-explicit-type-exports";
import noOnlyTests from "eslint-plugin-no-only-tests";
import noUnsanitized from "eslint-plugin-no-unsanitized";
import noUseExtendNative from "eslint-plugin-no-use-extend-native";
import perfectionist from "eslint-plugin-perfectionist";
import playwright from "eslint-plugin-playwright";
import promise from "eslint-plugin-promise";
import putout, { safeRules as putoutSafeRules } from "eslint-plugin-putout";
import react from "eslint-plugin-react";
import reactFormFields from "eslint-plugin-react-form-fields";
import reactHookForm from "eslint-plugin-react-hook-form";
import reactHooks from "eslint-plugin-react-hooks";
import reactPerf from "eslint-plugin-react-perf";
import reactPreferFunctionComponent from "eslint-plugin-react-prefer-function-component";
import reactRefreshPlugin from "eslint-plugin-react-refresh";
import regexp from "eslint-plugin-regexp";
import security from "eslint-plugin-security";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import sonarjs from "eslint-plugin-sonarjs";
import sortClassMembers from "eslint-plugin-sort-class-members";
import ssrFriendly from "eslint-plugin-ssr-friendly";
import storybook from "eslint-plugin-storybook";
import styledComponentsA11y from "eslint-plugin-styled-components-a11y";
import testingLibrary from "eslint-plugin-testing-library";
import toml from "eslint-plugin-toml";
import totalFunctions from "eslint-plugin-total-functions";
import typescriptCompat from "eslint-plugin-typescript-compat";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";
import validateJsxNesting from "eslint-plugin-validate-jsx-nesting";
import yml from "eslint-plugin-yml";
import globals from "globals";
import tseslint, { type ConfigWithExtends } from "typescript-eslint";

const isUndefined = (value: unknown): value is undefined =>
  typeof value === "undefined";

type RuleSetting = RuleSettings[string];
type RuleSettings = NonNullable<ConfigWithExtends["rules"]>;

const reactPreferFunctionComponentPlugin = reactPreferFunctionComponent;

const typescriptCompatPlugin = {
  rules: typescriptCompat.rules,
} satisfies ESLint.Plugin;

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));

const typedFiles = [
  "astro.config.ts",
  "eslint.config.ts",
  "knip.ts",
  "prettier.config.ts",
  "src/**/*.{ts,tsx}",
  "scripts/**/*.ts",
  "tests/**/*.{ts,tsx}",
  "playwright.config.ts",
  "types/**/*.d.ts",
];

const componentFiles = [
  "src/**/*.astro",
  "src/components/**/*.{ts,tsx}",
  "src/layouts/**/*.{ts,tsx}",
  "src/pages/**/*.{ts,tsx}",
];

const componentSyntaxRestrictions = [
  {
    message:
      "Components must not declare mutable variables. Use const expressions or move logic into a helper/controller.",
    selector: "VariableDeclaration[kind='var']",
  },
  {
    message:
      "Components must not declare mutable local variables. Use const expressions or move logic into a helper/controller.",
    selector: "VariableDeclaration[kind='let']",
  },
  {
    message:
      "Components must not mutate values. Move stateful logic into a helper/controller or derive a new value immutably.",
    selector: "AssignmentExpression",
  },
  {
    message:
      "Components must not mutate values. Use immutable derivation instead.",
    selector: "UpdateExpression",
  },
  {
    message:
      "Components should not contain loops. Use map/filter/flatMap/reduce or move logic into a helper.",
    selector: "ForStatement",
  },
  {
    message:
      "Components should not contain loops. Use map/filter/flatMap/reduce or move logic into a helper.",
    selector: "ForInStatement",
  },
  {
    message:
      "Components should not contain loops. Use map/filter/flatMap/reduce or move logic into a helper.",
    selector: "ForOfStatement",
  },
  {
    message:
      "Components should not contain loops. Use map/filter/flatMap/reduce or move logic into a helper.",
    selector: "WhileStatement",
  },
  {
    message:
      "Components should not contain loops. Use map/filter/flatMap/reduce or move logic into a helper.",
    selector: "DoWhileStatement",
  },
  {
    message:
      "Components must not use mutating collection methods. Use immutable alternatives or move logic into a helper.",
    selector:
      "CallExpression > MemberExpression.callee > Identifier.property[name=/^(copyWithin|fill|pop|push|reverse|shift|sort|splice|unshift)$/]",
  },
  {
    message: "Components must be functions. Do not use React class components.",
    selector: "ClassDeclaration[superClass.name=/^(Component|PureComponent)$/]",
  },
  {
    message: "Components must be functions. Do not use React class components.",
    selector:
      "ClassDeclaration[superClass.property.name=/^(Component|PureComponent)$/]",
  },
  {
    message:
      "React stateful runtime hooks belong in external controller/hook files, not TSX view components.",
    selector:
      "CallExpression[callee.name=/^use(State|Reducer|Effect|LayoutEffect|InsertionEffect|Ref|ImperativeHandle)$/]",
  },
  {
    message:
      "React stateful runtime hooks belong in external controller/hook files, not TSX view components.",
    selector:
      "CallExpression[callee.property.name=/^use(State|Reducer|Effect|LayoutEffect|InsertionEffect|Ref|ImperativeHandle)$/]",
  },
];

const normalModuleSyntaxRestrictions = [
  {
    message:
      "Do not export mutable bindings. Export an accessor function instead.",
    selector: "ExportNamedDeclaration > VariableDeclaration[kind='let']",
  },
  {
    message: "Use plain enums rather than const enums.",
    selector: "TSEnumDeclaration[const=true]",
  },
];

const sourceModuleSyntaxRestrictions = [
  {
    message:
      "Use named exports. Default exports obscure the canonical symbol name.",
    selector: "ExportDefaultDeclaration",
  },
  ...normalModuleSyntaxRestrictions,
];

const unsafeNumericGlobals = [
  {
    message: "Use Number() plus an explicit Number.isFinite() check.",
    name: "parseFloat",
  },
  {
    message:
      "Use Number() plus explicit validation unless parsing a non-decimal radix.",
    name: "parseInt",
  },
  {
    message: "Use Number.isFinite() to avoid implicit coercion.",
    name: "isFinite",
  },
  {
    message: "Use Number.isNaN() to avoid implicit coercion.",
    name: "isNaN",
  },
];

const browserRuntimeGlobals = [
  {
    message:
      "Astro files are static views. Move browser runtime behavior into an island/controller.",
    name: "window",
  },
  {
    message:
      "Astro files are static views. Move browser runtime behavior into an island/controller.",
    name: "document",
  },
  {
    message:
      "Astro files are static views. Move browser runtime behavior into an island/controller.",
    name: "localStorage",
  },
  {
    message:
      "Astro files are static views. Move browser runtime behavior into an island/controller.",
    name: "sessionStorage",
  },
  {
    message:
      "Astro files are static views. Move browser runtime behavior into an island/controller.",
    name: "navigator",
  },
];

const exportedFunctionContexts = [
  "ExportNamedDeclaration > FunctionDeclaration",
  "ExportDefaultDeclaration > FunctionDeclaration",
  "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression",
  "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > FunctionExpression",
  "ExportDefaultDeclaration > ArrowFunctionExpression",
  "ExportDefaultDeclaration > FunctionExpression",
];

const exportedTypeContexts = [
  "ExportNamedDeclaration > TSInterfaceDeclaration",
  "ExportNamedDeclaration > TSTypeAliasDeclaration",
];

const publicDocumentationRules = {
  "jsdoc/require-description": [
    "error",
    {
      contexts: [...exportedFunctionContexts, ...exportedTypeContexts],
      descriptionStyle: "body",
    },
  ],
  "jsdoc/require-jsdoc": [
    "error",
    {
      contexts: [...exportedFunctionContexts, ...exportedTypeContexts],
      enableFixer: false,
      exemptEmptyConstructors: false,
      exemptEmptyFunctions: false,
      publicOnly: {
        cjs: true,
        esm: true,
        window: false,
      },
      require: {
        ArrowFunctionExpression: true,
        ClassDeclaration: true,
        ClassExpression: true,
        FunctionDeclaration: true,
        FunctionExpression: true,
        MethodDefinition: true,
      },
    },
  ],
  "jsdoc/require-param": [
    "error",
    {
      checkDestructured: false,
      checkDestructuredRoots: false,
      contexts: exportedFunctionContexts,
      enableFixer: false,
    },
  ],
  "jsdoc/require-param-description": [
    "error",
    {
      contexts: exportedFunctionContexts,
    },
  ],
  "jsdoc/require-returns": [
    "error",
    {
      contexts: exportedFunctionContexts,
      enableFixer: false,
      forceReturnsWithAsync: false,
    },
  ],
  "jsdoc/require-returns-check": "error",
  "jsdoc/require-returns-description": [
    "error",
    {
      contexts: exportedFunctionContexts,
    },
  ],
} as RuleSettings;

function configsAsErrors(
  configs: readonly ConfigWithExtends[],
): readonly ConfigWithExtends[] {
  return configs.map((config) => ({
    ...config,
    rules: rulesAsErrors(config.rules),
  }));
}

function requiredConfig<T>(config: T | undefined, label: string): T {
  if (isUndefined(config)) {
    throw new Error(`Missing ESLint shared config: ${label}.`);
  }

  return config;
}

function rulesAsErrors(
  rules?: Readonly<Record<string, unknown>>,
): RuleSettings {
  return Object.fromEntries(
    Object.entries({ ...rules }).map(([name, setting]) => [
      name,
      ruleSettingAsError(setting),
    ]),
  );
}

function ruleSettingAsError(setting: unknown): RuleSetting {
  if (setting === 0 || setting === "off") return setting;

  if (Array.isArray(setting)) {
    return ["error", ...setting.slice(1)] as RuleSetting;
  }

  return "error";
}

function scopeToTypedFiles(
  configs: readonly ConfigWithExtends[],
): readonly ConfigWithExtends[] {
  return configs.map((config) => ({
    ...config,
    files: [...typedFiles],
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

const arrayFuncRecommendedConfig = requiredConfig(
  arrayFunc.configs["recommended"],
  "array-func/recommended",
);

const etcRecommendedConfig = requiredConfig(
  etc.configs["recommended"],
  "etc/recommended",
);

const jsxA11yStrictConfig = requiredConfig(
  jsxA11y.flatConfigs["strict"],
  "jsx-a11y/strict",
);

const noUseExtendNativeRecommendedConfig = requiredConfig(
  noUseExtendNative.configs["recommended"],
  "no-use-extend-native/recommended",
);

const promiseRecommendedConfig = requiredConfig(
  promise.configs["flat/recommended"],
  "promise/flat/recommended",
);

const reactJsxRuntimeConfig = requiredConfig(
  react.configs.flat?.["jsx-runtime"],
  "react/flat/jsx-runtime",
);

const reactRecommendedConfig = requiredConfig(
  react.configs.flat?.["recommended"],
  "react/flat/recommended",
);

const reactPreferFunctionComponentRecommendedConfig = requiredConfig(
  reactPreferFunctionComponentPlugin.configs["recommended"],
  "react-prefer-function-component/recommended",
);

const securityRecommendedConfig = requiredConfig(
  security.configs["recommended"],
  "security/recommended",
);

const ssrFriendlyRecommendedConfig = requiredConfig(
  ssrFriendly.configs["recommended"],
  "ssr-friendly/recommended",
);

const storybookRecommendedConfigs = requiredConfig(
  storybook.configs["flat/recommended"],
  "storybook/flat/recommended",
).map((config) => ({
  name: config.name,
  ...(isUndefined(config.files) ? {} : { files: config.files }),
  ...(isUndefined(config.plugins) ? {} : { plugins: config.plugins }),
  ...(isUndefined(config.rules) ? {} : { rules: config.rules }),
})) satisfies readonly ConfigWithExtends[];

const styledComponentsA11yStrictConfig = requiredConfig(
  styledComponentsA11y.flatConfigs["strict"],
  "styled-components-a11y/strict",
);

const totalFunctionsRecommendedConfig = requiredConfig(
  totalFunctions.configs["recommended"],
  "total-functions/recommended",
);

const perfectionistRules = {
  ...rulesAsErrors(perfectionist.configs["recommended-natural"].rules),
  "perfectionist/sort-imports": "off",
  "perfectionist/sort-named-imports": "off",
} satisfies RuleSettings;

export default tseslint.config(
  globalIgnores([
    ".astro/",
    ".lighthouseci/",
    "coverage/",
    "dist/",
    "node_modules/",
    "playwright-report/",
    "test-results/",
    "tmp/",
    "package-lock.json",
  ]),
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },
  js.configs.recommended,
  ...astro.configs["flat/recommended"],
  ...astro.configs["flat/jsx-a11y-strict"],
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
  ...configsAsErrors(toml.configs["flat/recommended"]),
  {
    ...html.configs["flat/recommended"],
    files: ["**/*.html"],
    rules: {
      ...rulesAsErrors(html.configs["flat/recommended"].rules),
      "@html-eslint/no-inline-styles": "error",
      "@html-eslint/no-multiple-h1": "error",
      "@html-eslint/require-button-type": "error",
      "@html-eslint/require-explicit-size": "error",
      "@html-eslint/require-img-alt": "error",
      "@html-eslint/require-lang": "error",
      "@html-eslint/require-title": "error",
    },
  },
  regexp.configs["flat/recommended"],
  ...configsAsErrors(storybookRecommendedConfigs),
  ...scopeToTypedFiles(tseslint.configs.recommended),
  ...scopeToTypedFiles(tseslint.configs.strictTypeChecked),
  ...scopeToTypedFiles(tseslint.configs.stylisticTypeChecked),
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.bunBuiltin,
      },
      sourceType: "module",
    },
    plugins: {
      "@eslint-community/eslint-comments": fixupPluginRules(eslintComments),
      "@shopify": fixupPluginRules(shopify),
      "@stylistic": stylistic,
      "array-func": arrayFunc,
      compat,
      "decorator-position": decoratorPosition,
      import: importPlugin,
      jsdoc,
      "jsx-a11y": jsxA11y,
      "no-constructor-bind": fixupPluginRules(noConstructorBind),
      "no-only-tests": noOnlyTests,
      "no-unsanitized": noUnsanitized,
      "no-use-extend-native": noUseExtendNative,
      perfectionist,
      promise,
      putout,
      "react-hooks": reactHooks,
      "react-refresh": reactRefreshPlugin,
      security,
      "simple-import-sort": simpleImportSort,
      sonarjs,
      "sort-class-members": sortClassMembers,
      "typescript-compat": fixupPluginRules(typescriptCompatPlugin),
      unicorn,
      "unused-imports": unusedImports,
    },
    rules: {
      ...rulesAsErrors(arrayFuncRecommendedConfig.rules),
      ...rulesAsErrors(compat.configs["flat/recommended"].rules),
      ...rulesAsErrors(eslintComments.configs.recommended.rules),
      ...rulesAsErrors(importPlugin.flatConfigs.recommended.rules),
      ...rulesAsErrors(importPlugin.flatConfigs.typescript.rules),
      ...rulesAsErrors(noUseExtendNativeRecommendedConfig.rules),
      ...perfectionistRules,
      ...rulesAsErrors(promiseRecommendedConfig.rules),
      ...rulesAsErrors(securityRecommendedConfig.rules),
      ...rulesAsErrors(stylistic.configs.recommended.rules),
      "@shopify/binary-assignment-parens": ["error", "always"],
      "@shopify/class-property-semi": "error",
      "@shopify/no-context-menu": "error",
      "@shopify/no-debugger": "error",
      "@shopify/no-fully-static-classes": "error",
      "@shopify/no-useless-computed-properties": "error",
      "@shopify/prefer-early-return": "error",
      "@shopify/prefer-module-scope-constants": "error",
      "@shopify/prefer-twine": "error",
      "@shopify/strict-component-boundaries": "error",
      "block-scoped-var": "error",
      curly: ["error", "all"],
      "decorator-position/decorator-position": "error",
      "default-case-last": "error",
      "dot-notation": "error",
      eqeqeq: ["error", "always"],
      "guard-for-in": "error",
      "import/no-cycle": "error",
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: [
            "*.config.{js,cjs,mjs,ts}",
            "scripts/**/*.ts",
            "tests/**/*.{ts,tsx}",
          ],
        },
      ],
      "import/no-mutable-exports": "error",
      "import/no-self-import": "error",
      "import/no-unresolved": [
        "error",
        {
          ignore: ["^astro:"],
        },
      ],
      "import/no-useless-path-segments": "error",
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
      "no-constructor-bind/no-constructor-bind": "error",
      "no-constructor-bind/no-constructor-state": "error",
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
      "putout/putout": [
        "error",
        {
          rules: {
            ...putoutSafeRules,
            "apply-arrow": "off",
            "apply-dot-notation": "off",
            "conditions/remove-boolean": "off",
            "conditions/remove-zero": "off",
            "convert-quotes-to-backticks": "off",
          },
        },
      ],
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
      "sort-class-members/sort-class-members": "error",
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
      "unused-imports/no-unused-imports": "error",
      ...publicDocumentationRules,
    },
    settings: {
      "import/core-modules": ["astro:assets", "astro:content", "bun:test"],
      "import/resolver": {
        node: true,
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
  },
  {
    files: [...typedFiles],
    plugins: {
      etc: fixupPluginRules(etc),
      functional,
      "no-explicit-type-exports": fixupPluginRules(noExplicitTypeExports),
      "total-functions": fixupPluginRules(totalFunctions),
    },
    rules: {
      ...rulesAsErrors(etcRecommendedConfig.rules),
      ...rulesAsErrors(totalFunctionsRecommendedConfig.rules),
      "@shopify/typescript-prefer-pascal-case-enums": "error",
      "@shopify/typescript-prefer-singular-enums": "error",
      "@typescript-eslint/array-type": [
        "error",
        {
          default: "array-simple",
          readonly: "array-simple",
        },
      ],
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          minimumDescriptionLength: 10,
          "ts-check": false,
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": true,
        },
      ],
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          disallowTypeAnnotations: true,
          fixStyle: "inline-type-imports",
          prefer: "type-imports",
        },
      ],
      "@typescript-eslint/default-param-last": "error",
      "@typescript-eslint/dot-notation": [
        "error",
        {
          allowIndexSignaturePropertyAccess: false,
        },
      ],
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowHigherOrderFunctions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      "@typescript-eslint/no-array-delete": "error",
      "@typescript-eslint/no-confusing-void-expression": [
        "error",
        {
          ignoreArrowShorthand: true,
          ignoreVoidOperator: false,
        },
      ],
      "@typescript-eslint/no-duplicate-enum-values": "error",
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-explicit-any": [
        "error",
        {
          fixToUnknown: true,
          ignoreRestArgs: false,
        },
      ],
      "@typescript-eslint/no-extraneous-class": [
        "error",
        {
          allowConstructorOnly: false,
          allowEmpty: false,
          allowStaticOnly: false,
          allowWithDecorator: false,
        },
      ],
      "@typescript-eslint/no-floating-promises": [
        "error",
        {
          ignoreIIFE: false,
          ignoreVoid: false,
        },
      ],
      "@typescript-eslint/no-for-in-array": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: true,
        },
      ],
      "@typescript-eslint/no-misused-spread": "error",
      "@typescript-eslint/no-mixed-enums": "error",
      "@typescript-eslint/no-namespace": [
        "error",
        {
          allowDeclarations: false,
          allowDefinitionFiles: false,
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/no-unnecessary-condition": [
        "error",
        {
          allowConstantLoopConditions: false,
        },
      ],
      "@typescript-eslint/no-unnecessary-type-arguments": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-unnecessary-type-conversion": "error",
      "@typescript-eslint/no-unsafe-type-assertion": "error",
      "@typescript-eslint/no-wrapper-object-types": "error",
      "@typescript-eslint/only-throw-error": "error",
      "@typescript-eslint/prefer-enum-initializers": "error",
      "@typescript-eslint/prefer-literal-enum-member": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/prefer-promise-reject-errors": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/promise-function-async": "error",
      "@typescript-eslint/require-array-sort-compare": [
        "error",
        {
          ignoreStringArrays: true,
        },
      ],
      "@typescript-eslint/restrict-plus-operands": [
        "error",
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowNumberAndString: false,
          allowRegExp: false,
        },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowAny: false,
          allowBoolean: false,
          allowNever: false,
          allowNullish: false,
          allowNumber: true,
          allowRegExp: false,
        },
      ],
      "@typescript-eslint/strict-boolean-expressions": [
        "error",
        {
          allowAny: false,
          allowNullableBoolean: false,
          allowNullableEnum: false,
          allowNullableNumber: false,
          allowNullableObject: true,
          allowNullableString: false,
          allowNumber: false,
          allowString: false,
        },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          considerDefaultExhaustiveForUnions: false,
          requireDefaultForNonUnion: false,
        },
      ],
      "@typescript-eslint/triple-slash-reference": "error",
      "dot-notation": "off",
      "functional/no-class-inheritance": "error",
      "functional/no-classes": "error",
      "functional/no-loop-statements": "error",
      "functional/no-this-expressions": "error",
      "functional/prefer-readonly-type": "error",
      "no-explicit-type-exports/no-explicit-type-exports": "error",
      "no-restricted-syntax": ["error", ...normalModuleSyntaxRestrictions],
      "total-functions/require-strict-mode": "off",
      "typescript-compat/compat": "error",
    },
  },
  {
    files: ["src/lib/**/*.ts", "scripts/**/*.ts", "tests/**/*.ts"],
    rules: {
      "no-restricted-syntax": ["error", ...sourceModuleSyntaxRestrictions],
    },
  },
  {
    files: ["src/**/*.tsx"],
    ...(isUndefined(jsxA11yStrictConfig.languageOptions)
      ? {}
      : {
          languageOptions: jsxA11yStrictConfig.languageOptions,
        }),
    plugins: {
      react: fixupPluginRules(react),
      "react-form-fields": fixupPluginRules(reactFormFields),
      "react-hook-form": fixupPluginRules(reactHookForm),
      "react-perf": fixupPluginRules(reactPerf),
      "react-prefer-function-component": fixupPluginRules(
        reactPreferFunctionComponent,
      ),
      "ssr-friendly": fixupPluginRules(ssrFriendly),
      "styled-components-a11y": fixupPluginRules(styledComponentsA11y),
      "validate-jsx-nesting": fixupPluginRules(validateJsxNesting),
    },
    rules: {
      ...rulesAsErrors(reactRecommendedConfig.rules),
      ...rulesAsErrors(reactJsxRuntimeConfig.rules),
      ...rulesAsErrors(jsxA11yStrictConfig.rules),
      ...rulesAsErrors(reactFormFields.configs["recommended"]?.rules),
      ...rulesAsErrors(reactHookForm.configs["recommended"]?.rules),
      ...reactHooks.configs.flat.recommended.rules,
      ...rulesAsErrors(reactPerf.configs["recommended"]?.rules),
      ...rulesAsErrors(reactPreferFunctionComponentRecommendedConfig.rules),
      ...rulesAsErrors(ssrFriendlyRecommendedConfig.rules),
      ...rulesAsErrors(styledComponentsA11yStrictConfig.rules),
      "react-refresh/only-export-components": [
        "error",
        {
          allowConstantExport: true,
        },
      ],
      "react/button-has-type": "error",
      "react/default-props-match-prop-types": "off",
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "function-declaration",
          unnamedComponents: "arrow-function",
        },
      ],
      "react/hook-use-state": "error",
      "react/jsx-no-bind": [
        "error",
        {
          allowArrowFunctions: false,
          allowBind: false,
          allowFunctions: false,
          ignoreRefs: false,
        },
      ],
      "react/jsx-no-constructed-context-values": "error",
      "react/no-array-index-key": "error",
      "react/no-danger": "error",
      "react/no-did-mount-set-state": "error",
      "react/no-did-update-set-state": "error",
      "react/no-set-state": "error",
      "react/no-unused-prop-types": "off",
      "react/prop-types": "off",
      "validate-jsx-nesting/no-invalid-jsx-nesting": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: [
      "tests/**/*.{test,spec}.tsx",
      "tests/components/**/*.{test,spec}.{ts,tsx}",
    ],
    plugins: {
      "testing-library": testingLibrary,
    },
    rules: rulesAsErrors(testingLibrary.configs["flat/react"].rules),
  },
  {
    files: ["tests/{a11y,e2e}/**/*.ts", "playwright.config.ts"],
    ...playwright.configs["flat/recommended"],
    rules: rulesAsErrors(playwright.configs["flat/recommended"].rules),
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-console": "error",
    },
  },
  {
    files: [...componentFiles],
    plugins: {
      functional,
      sonarjs,
    },
    rules: {
      "functional/immutable-data": "error",
      "functional/no-class-inheritance": "error",
      "functional/no-classes": "error",
      "functional/no-let": "error",
      "functional/no-loop-statements": "error",
      "functional/no-this-expressions": "error",
      "no-param-reassign": "error",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              message:
                "Components must not import filesystem APIs. Move IO into scripts, loaders, or helpers outside the view layer.",
              name: "node:fs",
            },
            {
              message:
                "Components must not import filesystem APIs. Move IO into scripts, loaders, or helpers outside the view layer.",
              name: "node:fs/promises",
            },
            {
              message:
                "Components must not import process APIs. Pass explicit data into views instead.",
              name: "node:process",
            },
          ],
          patterns: [
            {
              group: ["scripts/**", "../scripts/**", "../../scripts/**"],
              message: "Components must not import repository scripts.",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        ...normalModuleSyntaxRestrictions,
        ...componentSyntaxRestrictions,
      ],
      "sonarjs/cognitive-complexity": ["error", 8],
    },
  },
  {
    files: ["src/**/*.astro"],
    plugins: {
      jsdoc,
      "no-unsanitized": noUnsanitized,
    },
    rules: {
      "astro/no-exports-from-components": "error",
      "astro/no-prerender-export-outside-pages": "error",
      "astro/no-set-html-directive": "error",
      "astro/no-set-text-directive": "error",
      "astro/no-unsafe-inline-scripts": "error",
      "astro/no-unused-css-selector": "error",
      "astro/prefer-class-list-directive": "error",
      "no-console": "error",
      "no-restricted-globals": [
        "error",
        ...unsafeNumericGlobals,
        ...browserRuntimeGlobals,
      ],
      ...publicDocumentationRules,
      "no-unsanitized/method": "error",
      "no-unsanitized/property": "error",
    },
  },
  {
    files: [
      "scripts/**/*.ts",
      "*.config.{js,cjs,ts,mjs}",
      "playwright.config.ts",
    ],
    plugins: {
      n,
    },
    rules: {
      ...rulesAsErrors(n.configs["flat/recommended-module"].rules),
      "n/file-extension-in-import": "off",
      "n/no-missing-import": "off",
      "n/no-unsupported-features/es-syntax": "off",
      "n/no-unsupported-features/node-builtins": "off",
    },
    settings: {
      n: {
        tryExtensions: [".js", ".mjs", ".cjs", ".ts", ".tsx"],
      },
    },
  },
  {
    ...betterTailwindcss.configs["correctness-error"],
    files: ["src/**/*.{astro,ts,tsx}"],
    rules: {
      ...betterTailwindcss.configs["correctness-error"].rules,
      "better-tailwindcss/no-deprecated-classes": "error",
      "better-tailwindcss/no-duplicate-classes": "error",
      "better-tailwindcss/no-restricted-classes": [
        "error",
        {
          restrict: [
            {
              message:
                "Gradients are not part of the current visual direction unless explicitly approved.",
              pattern: "^(.*:)?(bg|from|via|to)-.*gradient.*$",
            },
            {
              message:
                "Use semantic color tokens in project UI instead of raw Tailwind palette colors.",
              pattern:
                "^(.*:)?(bg|text|border|ring|outline|decoration|accent|caret|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3}(\\/\\d{1,3})?$",
            },
            {
              message:
                "Avoid arbitrary pixel values in components. Prefer Tailwind tokens, rems, percentages, or named design tokens.",
              pattern: "^.*\\[[^\\]]*\\d+(?:\\.\\d+)?px[^\\]]*\\].*$",
            },
          ],
        },
      ],
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/styles/global.css",
        messageStyle: "compact",
        tsconfig: "tsconfig.json",
      },
    },
  },
  {
    files: [
      "src/lib/**/*.ts",
      "src/pages/**/*.ts",
      "tests/**/*.ts",
      "scripts/**/*.ts",
      "*.config.{js,cjs,ts,mjs}",
    ],
    rules: {
      "compat/compat": "off",
      "no-console": "off",
    },
  },
  {
    files: ["eslint.config.ts", "*.config.{js,cjs,ts,mjs}"],
    rules: {
      "@typescript-eslint/no-deprecated": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-type-assertion": "off",
      "array-func/prefer-array-from": "off",
      "etc/no-deprecated": "off",
      "import/no-named-as-default-member": "off",
      "putout/putout": "off",
      "total-functions/no-unsafe-readonly-mutable-assignment": "off",
      "total-functions/no-unsafe-type-assertion": "off",
      "unicorn/no-anonymous-default-export": "off",
    },
  },
  {
    files: ["src/env.d.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },
  {
    files: ["types/**/*.d.ts"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "off",
      "putout/putout": "off",
    },
  },
  eslintConfigPrettier,
);
