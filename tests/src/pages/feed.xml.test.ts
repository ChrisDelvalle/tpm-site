import { readFile } from "node:fs/promises";

import { describe, expect, test } from "bun:test";

describe("feed endpoint source", () => {
  test("keeps RSS generation wired to published article content", async () => {
    const source = await readFile("src/pages/feed.xml.ts", "utf8");

    expect(source).toContain("getArticles");
    expect(source).toContain("rss({");
    expect(source).toContain("link: articleUrl(article.id)");
  });
});
