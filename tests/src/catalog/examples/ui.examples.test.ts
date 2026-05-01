import { describe, expect, test } from "bun:test";

import { uiCatalogExamples } from "../../../../src/catalog/examples/ui.examples";

describe("UI catalog examples", () => {
  test("cover milestone-one primitives with stable component paths", () => {
    const paths = uiCatalogExamples.map((example) => example.componentPath);

    expect(paths).toContain("src/components/ui/Button.astro");
    expect(paths).toContain("src/components/ui/LinkButton.astro");
    expect(paths).toContain("src/components/media/ResponsiveIframe.astro");
    expect(new Set(paths).size).toBe(paths.length);
  });
});
