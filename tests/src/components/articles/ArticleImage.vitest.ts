import { describe, expect, test } from "vitest";

import tallImage from "../../../../src/assets/articles/kandinsky-and-loss/loss_art_simplified.png";
import squareImage from "../../../../src/assets/articles/memes-jokes-and-visual-puns/meme-jokes-puns-4.png";
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
    expect(view).toContain('data-article-image-shape="portrait"');
    expect(view).toContain('data-article-image-inspectable="false"');
    expect(view).toContain('alt="The Philosopher\'s Meme preview image"');
    expect(view).toContain('data-article-image="true"');
    expect(view).toContain("30rem");
    expect(view).toContain("Preview caption.");
  });

  test("renders explicit inspectable article images with an accessible trigger", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleImage, {
      props: {
        alt: "Long thread screenshot",
        heightPolicy: "inspectable",
        src: sampleImage,
      },
    });

    expect(view).toContain('data-article-image-shape="extra-tall"');
    expect(view).toContain('data-article-image-inspectable="true"');
    expect(view).toContain("data-article-image-inspect-trigger");
    expect(view).toContain('aria-haspopup="dialog"');
    expect(view).toContain(
      'aria-label="View full image: Long thread screenshot"',
    );
    expect(view).toContain("View full image");
  });

  test("keeps square article images bounded below full prose width", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleImage, {
      props: {
        alt: "Square meme example",
        src: squareImage,
      },
    });

    expect(view).toContain('data-article-image-shape="square"');
    expect(view).toContain('data-article-image-inspectable="false"');
    expect(view).toContain("34rem");
    expect(view).not.toContain("data-article-image-inspect-trigger");
  });

  test("renders tall article images as inspectable square-height previews", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleImage, {
      props: {
        alt: "Tall loss diagram",
        src: tallImage,
      },
    });

    expect(view).toContain('data-article-image-shape="tall"');
    expect(view).toContain('data-article-image-inspectable="true"');
    expect(view).toContain("data-article-image-inspect-trigger");
    expect(view).toContain("26rem");
    expect(view).toContain("34rem");
  });

  test("keeps natural full-height image display explicit", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleImage, {
      props: {
        alt: "Natural image",
        heightPolicy: "natural",
        src: sampleImage,
      },
    });

    expect(view).toContain('data-article-image-shape="portrait"');
    expect(view).toContain('data-article-image-inspectable="false"');
    expect(view).toContain("max-h-none");
    expect(view).not.toContain("data-article-image-inspect-trigger");
  });
});
