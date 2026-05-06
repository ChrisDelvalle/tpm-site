import { readFile } from "node:fs/promises";

import { describe, expect, test } from "bun:test";

describe("markdownlint config", () => {
  test("delegates TPM citation labels to the article-reference verifier", async () => {
    const config = await readFile(".markdownlint-cli2.jsonc", "utf8");

    expect(config).toContain('"MD052": false');
    expect(config).toContain("[^cite-*]");
    expect(config).toContain("article-reference verifier");
  });
});
