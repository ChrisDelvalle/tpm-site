import { describe, expect, test } from "vitest";

import CategorySidebar from "../../../../src/components/navigation/CategorySidebar.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { navigationItems } from "./navigation-fixture";

describe("CategorySidebar", () => {
  test("renders category discovery inside an aside", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(CategorySidebar, {
      props: { heading: "Categories", items: navigationItems },
    });

    expect(view).toContain("<aside");
    expect(view).toContain('aria-label="Category navigation"');
    expect(view).toContain("Metamemetics");
  });
});
