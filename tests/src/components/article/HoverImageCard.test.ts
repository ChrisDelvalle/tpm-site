import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import HoverImageCard from "../../../../src/components/article/HoverImageCard";

describe("HoverImageCard", () => {
  test("renders the inline trigger link and preview image metadata", () => {
    const view = renderToStaticMarkup(
      createElement(HoverImageCard, {
        alt: "Screenshot of a text message conversation",
        image: {
          height: 600,
          src: "/src/assets/articles/example/image.png",
          width: 800,
        },
        label: "inline preview",
      }),
    );

    expect(view).toContain("inline preview");
    expect(view).toContain('href="/src/assets/articles/example/image.png"');
  });
});
