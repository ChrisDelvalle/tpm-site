import { describe, expect, test } from "vitest";

import HoverImageLink from "../../../../src/components/article/HoverImageLink.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("HoverImageLink", () => {
  test("renders a native anchored hover-image link with image metadata", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(HoverImageLink, {
      props: {
        alt: "Preview image",
        image: {
          height: 600,
          src: "/assets/preview.png",
          width: 800,
        },
        label: "preview",
      },
    });

    expect(view).toContain("preview");
    expect(view).toContain("/assets/preview.png");
    expect(view).toContain('data-anchor-preset="inline-hover-preview"');
    expect(view).not.toContain("client:idle");
  });
});
