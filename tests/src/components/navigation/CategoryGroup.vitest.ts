import { describe, expect, test } from "vitest";

import CategoryGroup from "../../../../src/components/navigation/CategoryGroup.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { navigationItems } from "./navigation-fixture";

describe("CategoryGroup", () => {
  test("renders the section navigation item wrapper", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(CategoryGroup, {
      props: { item: navigationItems[1] },
    });

    expect(view).toContain("History");
    expect(view).toContain('href="/categories/history/"');
  });
});
