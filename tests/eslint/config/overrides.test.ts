import { describe, expect, test } from "bun:test";

import { createOverrideConfigs } from "../../../eslint/config/overrides";

describe("override ESLint config", () => {
  test("keeps targeted exceptions scoped to known files", () => {
    const configs = createOverrideConfigs();
    const seoOverride = configs.find(
      (config) =>
        config.files?.includes("src/components/seo/ArticleJsonLd.astro") ===
        true,
    );

    expect(configs[0]?.rules?.["no-console"]).toBe("off");
    expect(seoOverride?.rules?.["astro/no-set-html-directive"]).toBe("off");
  });
});
