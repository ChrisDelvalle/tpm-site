import { describe, expect, test } from "vitest";

import CategoryDropdown from "../../../../src/components/navigation/CategoryDropdown.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { navigationItems } from "./navigation-fixture";

describe("CategoryDropdown", () => {
  test("renders a hover and focus dropdown with a direct category link", async () => {
    const category = navigationItems[0];

    const container = await createAstroTestContainer();
    const view = await container.renderToString(CategoryDropdown, {
      props: {
        category,
        currentPath: category.href,
        previewId: "category-preview-test",
      },
    });

    expect(view).toContain(`href="${category.href}"`);
    expect(view).toContain("data-category-preview");
    expect(view).toContain("lucide-chevron-down");
    expect(view).toContain('aria-current="page"');
    expect(view).toContain("View all Metamemetics");
    expect(view.match(/Metamemetics/gu)).toHaveLength(2);
  });
});
