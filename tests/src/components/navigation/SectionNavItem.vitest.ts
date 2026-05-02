import { describe, expect, test } from "vitest";

import SectionNavItem from "../../../../src/components/navigation/SectionNavItem.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { navigationItems } from "./navigation-fixture";

describe("SectionNavItem", () => {
  test("renders category disclosure, category link, and current article state", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(SectionNavItem, {
      props: { item: navigationItems[0] },
    });

    expect(view).toContain("<details");
    expect(view).toContain("Metamemetics");
    expect(view).toContain('href="/categories/metamemetics/"');
    expect(view).toContain('href="/articles/current-article/"');
    expect(view).toContain('aria-current="page"');
    expect(view).toContain("View all Metamemetics");
  });
});
