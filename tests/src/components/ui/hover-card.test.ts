import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  HoverCard,
  HoverCardTrigger,
} from "../../../../src/components/ui/hover-card";

describe("hover-card primitives", () => {
  test("renders root children without adding unnecessary wrapper markup", () => {
    const view = renderToStaticMarkup(
      createElement(
        HoverCard,
        null,
        createElement("span", { className: "child" }, "Preview"),
      ),
    );

    expect(view).toBe('<span class="child">Preview</span>');
  });

  test("marks trigger elements with the expected data slot", () => {
    const view = renderToStaticMarkup(
      createElement(
        HoverCard,
        null,
        createElement(HoverCardTrigger, null, "Open preview"),
      ),
    );

    expect(view).toContain('data-slot="hover-card-trigger"');
    expect(view).toContain("Open preview");
  });
});
