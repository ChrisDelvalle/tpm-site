import { describe, expect, test } from "vitest";

import IconButton from "../../../../src/components/ui/IconButton.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("IconButton", () => {
  test("renders icon-only buttons with required accessible labels", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(IconButton, {
      props: {
        label: "Toggle dark mode",
      },
      slots: {
        default: '<span aria-hidden="true">*</span>',
      },
    });

    expect(view).toContain('aria-label="Toggle dark mode"');
    expect(view).toContain('title="Toggle dark mode"');
  });
});
