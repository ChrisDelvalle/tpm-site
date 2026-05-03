import { describe, expect, test } from "vitest";

import HoverImageCard from "../../../../src/components/article/HoverImageCard.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("HoverImageCard compatibility wrapper", () => {
  test("preserves the legacy import path with the anchored Astro component", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(HoverImageCard, {
      props: {
        alt: "Preview alt text",
        image: {
          height: 600,
          src: "/assets/example.png",
          width: 800,
        },
        label: "preview link",
      },
    });

    expect(view).toContain('data-anchor-preset="inline-hover-preview"');
    expect(view).toContain('href="/assets/example.png"');
    expect(view).toContain("preview link");
  });
});
