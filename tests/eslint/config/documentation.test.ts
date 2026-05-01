import { describe, expect, test } from "bun:test";

import { publicDocumentationRules } from "../../../eslint/config/documentation";

describe("documentation ESLint config", () => {
  test("requires useful JSDoc for public functions and types", () => {
    expect(publicDocumentationRules["jsdoc/require-jsdoc"]).toBeDefined();
    expect(publicDocumentationRules["jsdoc/require-description"]).toBeDefined();
    expect(publicDocumentationRules["jsdoc/require-param"]).toBeDefined();
    expect(publicDocumentationRules["jsdoc/require-returns"]).toBeDefined();
  });
});
