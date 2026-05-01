import { describe, expect, test } from "vitest";

import ArticleHeader from "../../../../src/components/articles/ArticleHeader.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("ArticleHeader", () => {
  test("renders article title, category, metadata, description, and tags", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleHeader, {
      props: {
        author: "Seong-Young Her",
        category: {
          href: "/categories/history/",
          title: "History",
        },
        date: new Date("2022-04-06T23:58:10.000Z"),
        description: "Article description.",
        formattedDate: "April 6, 2022",
        tags: ["history"],
        title: "Article Title",
      },
    });

    expect(view).toContain("<h1");
    expect(view).toContain("Article Title");
    expect(view).toContain("/categories/history/");
    expect(view).toContain("Article description.");
    expect(view).toContain("history");
  });
});
