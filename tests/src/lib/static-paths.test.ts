import { describe, expect, test } from "bun:test";

import {
  articleStaticPaths,
  categoryStaticPaths,
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
});
