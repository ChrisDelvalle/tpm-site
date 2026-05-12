import { describe, expect, test } from "bun:test";

import {
  browserRuntimeGlobals,
  componentSyntaxRestrictions,
  sourceModuleSyntaxRestrictions,
  unsafeNumericGlobals,
} from "../../../eslint/config/restrictions";

describe("ESLint syntax restrictions", () => {
  test("ban mutable and stateful patterns in component files", () => {
    const selectors = componentSyntaxRestrictions.map(
      (restriction) => restriction.selector,
    );

    expect(selectors).toContain("VariableDeclaration[kind='let']");
    expect(selectors).toContain("AssignmentExpression");
  });

  test("ban ambiguous runtime globals in static views and numeric helpers", () => {
    expect(browserRuntimeGlobals.map((global) => global.name)).toContain(
      "document",
    );
    expect(unsafeNumericGlobals.map((global) => global.name)).toContain(
      "parseInt",
    );
  });

  test("requires named exports in reusable source modules", () => {
    expect(
      sourceModuleSyntaxRestrictions.map((rule) => rule.selector),
    ).toContain("ExportDefaultDeclaration");
  });
});
