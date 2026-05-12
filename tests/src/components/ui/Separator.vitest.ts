import { describe, expect, test } from "vitest";

import Separator from "../../../../src/components/ui/Separator.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("Separator", () => {
  test("renders semantic vertical separators when not decorative", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(Separator, {
      props: {
        decorative: false,
        orientation: "vertical",
      },
    });

    expect(view).toContain('role="separator"');
    expect(view).toContain('aria-orientation="vertical"');
  });
});
