import { describe, expect, test } from "vitest";

import CategoryTree from "../../../../src/components/navigation/CategoryTree.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { navigationItems } from "./navigation-fixture";

describe("CategoryTree", () => {
  test("renders a labeled category navigation tree", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(CategoryTree, {
      props: { items: navigationItems, label: "Catalog categories" },
    });

    expect(view).toContain('aria-label="Catalog categories"');
    expect(view).toContain("Metamemetics");
    expect(view).toContain("History");
  });
});
