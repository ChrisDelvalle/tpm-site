import { describe, expect, test } from "vitest";

import CategoryOverviewBlock from "../../../../src/components/blocks/CategoryOverviewBlock.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { navigationItems } from "../navigation/navigation-fixture";

describe("CategoryOverviewBlock", () => {
  test("renders categories from shared navigation data", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(CategoryOverviewBlock, {
      props: {
        description: "Browse the archive by subject.",
        items: navigationItems,
        title: "Categories",
      },
    });

    expect(view).toContain("Categories");
    expect(view).toContain("Browse the archive by subject.");
    expect(view).toContain("Metamemetics");
    expect(view).toMatch(/2\s+articles/);
  });
});
