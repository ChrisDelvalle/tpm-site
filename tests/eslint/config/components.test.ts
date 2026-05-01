import { describe, expect, test } from "bun:test";

import {
  createComponentBoundaryConfigs,
  createSourceModuleConfigs,
} from "../../../eslint/config/components";

describe("component boundary ESLint config", () => {
  test("keeps components pure and source modules named-export only", () => {
    const componentConfigs = createComponentBoundaryConfigs();
    const sourceConfigs = createSourceModuleConfigs();

    expect(componentConfigs[1]?.files).toContain("src/**/*.astro");
    expect(componentConfigs[1]?.rules?.["no-param-reassign"]).toBe("error");
    expect(sourceConfigs[0]?.rules?.["no-restricted-syntax"]).toBeDefined();
  });
});
