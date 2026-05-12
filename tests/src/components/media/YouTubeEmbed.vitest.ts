import { describe, expect, test } from "vitest";

import YouTubeEmbed from "../../../../src/components/media/YouTubeEmbed.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("YouTubeEmbed", () => {
  test("renders a responsive video iframe", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(YouTubeEmbed, {
      props: {
        src: "https://www.youtube.com/embed/example",
        title: "YouTube video",
      },
    });

    expect(view).toContain("https://www.youtube.com/embed/example");
    expect(view).toContain("aspect-video");
    expect(view).toContain("YouTube video");
  });
});
