import { readFile } from "node:fs/promises";

import { describe, expect, test } from "bun:test";

describe("Wrangler config", () => {
  test("serves the generated static site without Worker-first routing", async () => {
    const config = await readFile("wrangler.toml", "utf8");

    expect(config).toContain('name = "tpm-site"');
    expect(config).toContain("[assets]");
    expect(config).toContain('directory = "./dist"');
    expect(config).toContain('not_found_handling = "404-page"');
    expect(config).not.toContain("main =");
    expect(config).not.toContain("run_worker_first");
  });
});
