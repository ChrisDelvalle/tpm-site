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
    expect(view).toContain("data-anchor-root");
    expect(view).toContain('data-anchor-preset="header-dropdown"');
    expect(view).toContain("data-disclosure-root");
    expect(view).toContain('data-disclosure-mode="hover-focus-tap"');
    expect(view).toContain("data-anchor-trigger");
    expect(view).toContain("data-disclosure-trigger");
    expect(view).toContain("data-category-disclosure-trigger");
    expect(view).toContain('aria-controls="category-preview-test"');
    expect(view).toContain('aria-expanded="false"');
    expect(view).toContain("data-anchor-panel");
    expect(view).toContain("data-disclosure-panel");
    expect(view).toContain("data-floating-panel");
    expect(view).toContain("data-category-preview");
    expect(view).not.toContain("inset-x-4");
    expect(view).not.toContain("mx-auto");
    expect(view).toContain("lucide-chevron-down");
    expect(view).toContain('aria-current="page"');
    expect(view).toContain("View all Metamemetics");
    expect(view).not.toContain("<h2>Metamemetics</h2>");
  });
});
