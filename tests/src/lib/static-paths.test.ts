import { describe, expect, test } from "bun:test";

import {
  articleStaticPaths,
  categoryStaticPaths,
  tagStaticPaths,
} from "../../../src/lib/static-paths";
import { articleEntry, categorySummary } from "../../helpers/content";

describe("static path helpers", () => {
  test("builds article static path params from entry IDs", () => {
    const article = articleEntry({ id: "article-title" });

    expect(articleStaticPaths([article])).toEqual([
      {
        params: { slug: "article-title" },
        props: { article },
      },
    ]);
  });

  test("builds category static path params from category slugs", () => {
    const category = categorySummary({ slug: "history" });

    expect(categoryStaticPaths([category])).toEqual([
      {
        params: { category: "history" },
        props: { category },
      },
    ]);
  });

  test("builds tag static path params from raw labels so Astro encodes URLs", () => {
    const article = articleEntry({ id: "tagged" });
    const tag = {
      articles: [article],
      href: "/tags/meme%20history/",
      label: "meme history",
      pathSegment: "meme%20history",
    };

    expect(tagStaticPaths([tag])).toEqual([
      {
        params: { tag: "meme history" },
        props: { tag },
      },
    ]);
  });
});
