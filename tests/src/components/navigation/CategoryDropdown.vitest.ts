import { describe, expect, test } from "vitest";

import CategoryDropdown from "../../../../src/components/navigation/CategoryDropdown.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { navigationItems } from "./navigation-fixture";

describe("CategoryDropdown", () => {
  test("renders a native popover trigger and direct category link", async () => {
    const category = navigationItems[0];

    const container = await createAstroTestContainer();
    const view = await container.renderToString(CategoryDropdown, {
      props: {
        category,
        currentPath: category.href,
        popoverId: "category-popover-test",
      },
    });

    expect(view).toContain('popovertarget="category-popover-test"');
    expect(view).toContain('popover="auto"');
    expect(view).toContain('aria-label="Browse Metamemetics articles"');
    expect(view).toContain('aria-current="page"');
    expect(view).toContain("View all Metamemetics");
  });
});
