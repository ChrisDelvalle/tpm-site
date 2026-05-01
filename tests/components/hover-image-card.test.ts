import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import HoverImageCard from "../../src/components/article/HoverImageCard";

describe("HoverImageCard", () => {
  test("renders an accessible linked preview trigger", () => {
    const view = renderToStaticMarkup(
      createElement(HoverImageCard, {
        alt: "Preview alt text",
        image: {
          height: 600,
          src: "/assets/example.png",
          width: 800,
        },
        label: "preview link",
      }),
    );

    expect(view).toContain("preview link");
    expect(view).toContain('href="/assets/example.png"');
  });
});
