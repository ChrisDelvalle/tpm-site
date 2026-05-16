import { describe, expect, test } from "vitest";

import ActionPopover from "../../../../src/components/ui/ActionPopover.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("ActionPopover", () => {
  test("renders an anchored action popover shell with custom panel hooks", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ActionPopover, {
      props: {
        panelAttributes: {
          "data-example-panel": true,
        },
        panelLabel: "Example actions",
        panelWidth: "20rem",
        popoverId: "example-popover",
        preset: "article-action-menu",
      },
      slots: {
        default: "<p>Panel content</p>",
        trigger:
          '<button data-anchor-trigger popovertarget="example-popover">Open</button>',
      },
    });

    expect(view).toContain("data-action-popover");
    expect(view).toContain('data-anchor-preset="article-action-menu"');
    expect(view).toContain('id="example-popover"');
    expect(view).toContain('aria-label="Example actions"');
    expect(view).toContain("data-action-popover-panel");
    expect(view).toContain("data-example-panel");
    expect(view).toContain(
      "width: min(20rem, var(--anchor-max-width, calc(100vw - 2rem)));",
    );
    expect(view).toMatch(/\[(?:&|&#38;|&amp;):not\(:popover-open\)\]:hidden/);
  });
});
