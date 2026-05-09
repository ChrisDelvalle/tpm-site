import { describe, expect, test } from "vitest";

import ArticlesIndexPage from "../../../../src/pages/articles/index.astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../../helpers/astro-container";

describe("articles index page", () => {
  test("renders the articles hub with categories and latest articles", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticlesIndexPage, {
      request: new Request(`${testSiteUrl}/articles/`),
    });

    expect(view).toContain("data-articles-category-rail");
    expect(view).toContain("data-scroll-rail-viewport");
    expect(view).toContain('aria-label="Article categories"');
    expect(view).toContain("Latest Articles");
    expect(view).toContain("View all articles");
    expect(view).toContain("/articles/all/");
    expect(view).toContain("Metamemetics");
    expect(view).not.toContain("Browse Categories");
    expect(view).toContain("data-pagefind-ignore");
    expect(view).toContain("<article");
  });
});
