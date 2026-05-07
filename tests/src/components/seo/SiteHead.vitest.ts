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
        image: {
          alt: "Example image",
          height: 630,
          src: "/_astro/example.hash.jpg",
          type: "image/jpeg",
          width: 1200,
        },
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
    expect(view).toContain(
      'property="og:image" content="https://thephilosophersmeme.com/_astro/example.hash.jpg"',
    );
    expect(view).toContain('property="og:image:width" content="1200"');
    expect(view).toContain('property="og:image:height" content="630"');
    expect(view).toContain('property="og:image:type" content="image/jpeg"');
    expect(view).toContain('name="twitter:image:alt" content="Example image"');
  });
});
