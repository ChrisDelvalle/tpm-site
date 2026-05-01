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
    expect(view).toContain("data-home-category-overview");
    expect(view).toContain("max-w-3xl");
    expect(view).not.toContain("xl:grid-cols-4");
  });
});
