import { readFile } from "node:fs/promises";

import { describe, expect, test } from "bun:test";

describe("catalog e2e configuration", () => {
  test("detects catalog builds from the active output directory", async () => {
    const source = await readFile("tests/e2e/catalog-invariants.pw.ts", "utf8");

    expect(source).toContain(
      'const activeOutputDir = process.env["SITE_OUTPUT_DIR"] ?? "dist";',
    );
    expect(source).toContain(
      'path.join(activeOutputDir, "catalog", "index.html")',
    );
    expect(source).not.toContain('existsSync("dist/catalog/index.html")');
  });
});
