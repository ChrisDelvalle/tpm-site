import { describe, expect, test } from "vitest";

import SiteHead from "../../../../src/components/seo/SiteHead.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("SiteHead", () => {
  test("renders canonical, Open Graph, Twitter, and title metadata", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(SiteHead, {
      props: {
        canonicalPath: "/articles/example/",
        description: "Example description.",
        image: "/assets/example.png",
        imageAlt: "Example image",
        title: "Example Article",
        type: "article",
      },
    });

    expect(view).toContain("<title>Example Article</title>");
    expect(view).toContain(
      'href="https://thephilosophersmeme.com/articles/example/"',
    );
    expect(view).toContain('property="og:type" content="article"');
    expect(view).toContain('name="twitter:card" content="summary_large_image"');
  });
});
