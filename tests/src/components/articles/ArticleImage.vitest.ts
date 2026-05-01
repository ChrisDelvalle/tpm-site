import { describe, expect, test } from "vitest";

import sampleImage from "../../../../src/assets/shared/tpm_defaultpic.jpg";
import ArticleImage from "../../../../src/components/articles/ArticleImage.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("ArticleImage", () => {
  test("renders optimized article image markup with alt text and caption", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleImage, {
      props: {
        alt: "The Philosopher's Meme preview image",
        caption: "Preview caption.",
        src: sampleImage,
      },
    });

    expect(view).toContain("<figure");
    expect(view).toContain('alt="The Philosopher\'s Meme preview image"');
    expect(view).toContain("Preview caption.");
  });
});
