import { describe, expect, test } from "vitest";

import HoverImageLink from "../../../../src/components/article/HoverImageLink.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("HoverImageLink", () => {
  test("renders a hydrated hover-image link with image metadata", async () => {
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
  });
});
