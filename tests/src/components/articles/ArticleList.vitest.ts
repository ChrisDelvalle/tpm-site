import { describe, expect, test } from "vitest";

import ArticleList from "../../../../src/components/articles/ArticleList.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { articleItems } from "./article-fixture";

describe("ArticleList", () => {
  test("renders ordered article cards and optional pagefind ignore marker", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleList, {
      props: {
        items: articleItems,
        pagefindIgnore: true,
      },
    });

    expect(view).toContain("<ol");
    expect(view).toContain("data-pagefind-ignore");
    expect(view).toContain("Article Title");
    expect(view).toContain("Second Article");
  });
});
