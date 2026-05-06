import { describe, expect, test } from "bun:test";

import { uiCatalogExamples } from "../../../../src/catalog/examples/ui.examples";

describe("UI catalog examples", () => {
  test("cover milestone-one primitives with stable component paths", () => {
    const paths = uiCatalogExamples.map((example) => example.componentPath);

    expect(paths).toContain("src/components/ui/ActionCluster.astro");
    expect(paths).toContain("src/components/ui/Button.astro");
    expect(paths).toContain("src/components/ui/DiscordButton.astro");
    expect(paths).toContain("src/components/ui/LinkButton.astro");
    expect(paths).toContain("src/components/ui/PatreonButton.astro");
    expect(paths).toContain("src/components/ui/YouTubeButton.astro");
    expect(paths).toContain("src/components/media/ResponsiveIframe.astro");
    expect(paths).toContain("src/components/media/ThemedImage.astro");
    expect(new Set(paths).size).toBe(paths.length);
  });
});
