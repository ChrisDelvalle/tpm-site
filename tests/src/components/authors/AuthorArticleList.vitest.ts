import { describe, expect, test } from "vitest";

import AuthorArticleList from "../../../../src/components/authors/AuthorArticleList.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { articleItems } from "../articles/article-fixture";

describe("AuthorArticleList", () => {
  test("renders an author article section with shared article cards", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(AuthorArticleList, {
      props: { items: articleItems, title: "Articles by Seong-Young Her" },
    });

    expect(view).toContain("Articles by Seong-Young Her");
    expect(view).toContain("Article Title");
    expect(view).toContain("data-pagefind-ignore");
  });
});
