import { readFile } from "node:fs/promises";

import { describe, expect, test } from "bun:test";

describe("feed endpoint source", () => {
  test("keeps RSS generation wired to published publishable content", async () => {
    const source = await readFile("src/pages/feed.xml.ts", "utf8");

    expect(source).toContain("getArticles");
    expect(source).toContain("getAnnouncements");
    expect(source).toContain("getAuthorEntries");
    expect(source).toContain("publishableFeedEntries");
    expect(source).toContain("socialPreviewImageViewModel");
    expect(source).toContain("getImage");
    expect(source).toContain("rss({");
    expect(source).toContain("link: entry.href");
  });
});
