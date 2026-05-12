import { describe, expect, test } from "vitest";

import PriorityInlineRow from "../../../../src/components/layout/PriorityInlineRow.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("PriorityInlineRow", () => {
  test("renders named slots inside stable start, center, and end layout hooks", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(PriorityInlineRow, {
      props: {
        "aria-label": "Header row",
        class: "border-border",
        gap: "sm",
      },
      slots: {
        center: "<strong>Centered identity</strong>",
        end: "<a href='/support/'>Support</a>",
        start: "<button type='button'>Menu</button>",
      },
    });

    expect(view).toContain("data-priority-inline-row");
    expect(view).toContain('aria-label="Header row"');
    expect(view).toContain("grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]");
    expect(view).toContain("gap-3");
    expect(view).toContain("data-priority-inline-start");
    expect(view).toContain("data-priority-inline-center");
    expect(view).toContain("data-priority-inline-end");
    expect(view).toMatch(
      /<div class="justify-self-center text-center" data-priority-inline-center(?:\s|>)/u,
    );
    expect(view).toContain("<button type='button'>Menu</button>");
    expect(view).toContain("<strong>Centered identity</strong>");
    expect(view).toContain("<a href='/support/'>Support</a>");
  });
});
