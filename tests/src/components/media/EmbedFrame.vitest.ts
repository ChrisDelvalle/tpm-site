import { describe, expect, test } from "vitest";

import EmbedFrame from "../../../../src/components/media/EmbedFrame.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("EmbedFrame", () => {
  test("renders stable embed chrome with fallback source links", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(EmbedFrame, {
      props: {
        description: "External video embed.",
        fallbackHref: "https://example.com/video",
        title: "Example video",
      },
    });

    expect(view).toContain("aspect-video");
    expect(view).toContain("External video embed.");
    expect(view).toContain("https://example.com/video");
  });
});
