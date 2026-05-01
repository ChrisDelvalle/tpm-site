import { describe, expect, test } from "bun:test";

import { createReactConfigs } from "../../../eslint/config/react";

describe("React ESLint config", () => {
  test("keeps React islands accessible and function-component based", () => {
    const [config] = createReactConfigs();

    expect(config?.files).toEqual(["src/**/*.tsx"]);
    expect(config?.rules?.["react/no-danger"]).toBe("error");
    expect(config?.rules?.["react/no-set-state"]).toBe("error");
    expect(config?.settings).toMatchObject({ react: { version: "detect" } });
  });
});
