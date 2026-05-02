import { describe, expect, test } from "vitest";

import ArticleCard from "../../../../src/components/articles/ArticleCard.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { articleItems } from "./article-fixture";

describe("ArticleCard", () => {
  test("renders a linked article teaser", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleCard, {
      props: articleItems[0],
    });

    expect(view).toContain("<article");
    expect(view).toContain("/articles/article-title/");
    expect(view).toContain("/authors/seong-young-her/");
    expect(view).toContain("Article Title");
    expect(view).toContain("Article description.");
  });
});
