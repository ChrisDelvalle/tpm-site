import { readFile } from "node:fs/promises";

import { describe, expect, test } from "bun:test";

describe("Astro component module declarations", () => {
  test("types Astro imports as renderable component factories", async () => {
    const source = await readFile("types/astro-components.d.ts", "utf8");

    expect(source).toContain('declare module "*.astro"');
    expect(source).toContain("AstroComponentFactory");
  });
});
