import type { RuleSettings } from "./shared";

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

export const publicDocumentationRules = {
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
