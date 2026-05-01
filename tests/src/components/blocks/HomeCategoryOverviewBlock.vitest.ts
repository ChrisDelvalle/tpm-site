import { describe, expect, test } from "vitest";

import HomeCategoryOverviewBlock from "../../../../src/components/blocks/HomeCategoryOverviewBlock.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { navigationItems } from "../navigation/navigation-fixture";

describe("HomeCategoryOverviewBlock", () => {
  test("renders category navigation data as a discovery grid", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(HomeCategoryOverviewBlock, {
      props: { items: navigationItems },
    });

    expect(view).toContain("Browse Categories");
    expect(view).toContain("Metamemetics");
    expect(view).toMatch(/2\s+articles/);
  });
});
