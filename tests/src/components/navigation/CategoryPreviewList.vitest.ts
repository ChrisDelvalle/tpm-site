import { describe, expect, test } from "vitest";

import CategoryPreviewList from "../../../../src/components/navigation/CategoryPreviewList.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { navigationItems } from "./navigation-fixture";

describe("CategoryPreviewList", () => {
  test("renders capped article preview links and a category fallback link", async () => {
    const category = navigationItems[0];

    const container = await createAstroTestContainer();
    const view = await container.renderToString(CategoryPreviewList, {
      props: {
        articles: category.articles,
        categoryHref: category.href,
        categoryTitle: category.title,
        maxItems: 1,
      },
    });

    expect(view).toContain("data-category-preview-list");
    expect(view).toContain("Current Article With A Very Long Title");
    expect(view).not.toContain("Other Article");
    expect(view).toContain("View all Metamemetics");
    expect(view).toContain('data-astro-prefetch="hover"');
  });

  test("renders a useful empty state without dropping the category link", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(CategoryPreviewList, {
      props: {
        articles: [],
        categoryHref: "/categories/history/",
        categoryTitle: "History",
      },
    });

    expect(view).toContain("data-category-preview-empty");
    expect(view).toContain("No article previews are available");
    expect(view).toContain("View all History");
  });
});
