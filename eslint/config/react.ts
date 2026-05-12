import { fixupPluginRules } from "@eslint/compat";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactPerf from "eslint-plugin-react-perf";
import reactPreferFunctionComponent from "eslint-plugin-react-prefer-function-component";
import ssrFriendly from "eslint-plugin-ssr-friendly";
import validateJsxNesting from "eslint-plugin-validate-jsx-nesting";
import type { ConfigWithExtends } from "typescript-eslint";

import { isUndefined, requiredConfig, rulesAsErrors } from "./shared";

const jsxA11yStrictConfig = requiredConfig(
  jsxA11y.flatConfigs["strict"],
  "jsx-a11y/strict",
);

const reactJsxRuntimeConfig = requiredConfig(
  react.configs.flat?.["jsx-runtime"],
  "react/flat/jsx-runtime",
);

const reactRecommendedConfig = requiredConfig(
  react.configs.flat?.["recommended"],
  "react/flat/recommended",
);

const reactPreferFunctionComponentPlugin = reactPreferFunctionComponent;

const reactPreferFunctionComponentRecommendedConfig = requiredConfig(
  reactPreferFunctionComponentPlugin.configs["recommended"],
  "react-prefer-function-component/recommended",
);

const ssrFriendlyRecommendedConfig = requiredConfig(
  ssrFriendly.configs["recommended"],
  "ssr-friendly/recommended",
);

/**
 * Creates React island rules for accessible, function-based components.
 *
 * @returns Flat config blocks scoped to React component files.
 */
export function createReactConfigs(): readonly ConfigWithExtends[] {
  return [
    {
      files: ["src/**/*.tsx"],
      ...(isUndefined(jsxA11yStrictConfig.languageOptions)
        ? {}
        : {
            languageOptions: jsxA11yStrictConfig.languageOptions,
          }),
      plugins: {
        react: fixupPluginRules(react),
        "react-perf": fixupPluginRules(reactPerf),
        "react-prefer-function-component": fixupPluginRules(
          reactPreferFunctionComponent,
        ),
        "ssr-friendly": fixupPluginRules(ssrFriendly),
        "validate-jsx-nesting": fixupPluginRules(validateJsxNesting),
      },
      rules: {
        ...rulesAsErrors(reactRecommendedConfig.rules),
        ...rulesAsErrors(reactJsxRuntimeConfig.rules),
        ...rulesAsErrors(jsxA11yStrictConfig.rules),
        ...reactHooks.configs.flat.recommended.rules,
        ...rulesAsErrors(reactPerf.configs["recommended"]?.rules),
        ...rulesAsErrors(reactPreferFunctionComponentRecommendedConfig.rules),
        ...rulesAsErrors(ssrFriendlyRecommendedConfig.rules),
        "react-hooks/static-components": "off",
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
  ];
}
