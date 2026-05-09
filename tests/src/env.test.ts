import { readFile } from "node:fs/promises";

import { describe, expect, test } from "bun:test";

describe("Astro environment declarations", () => {
  test("keeps Astro client and generated content types in scope", async () => {
    const source = await readFile("src/env.d.ts", "utf8");

    expect(source).toContain('path="../.astro/types.d.ts"');
    expect(source).toContain('types="astro/client"');
  });
});
