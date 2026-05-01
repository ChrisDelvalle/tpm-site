import { describe, expect, test } from "vitest";

import Button from "../../../../src/components/ui/Button.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("Button", () => {
  test("renders native button actions with explicit type and variants", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(Button, {
      props: {
        pressed: true,
        tone: "neutral",
        variant: "outline",
      },
      slots: {
        default: "Toggle",
      },
    });

    expect(view).toContain("<button");
    expect(view).toContain('type="button"');
    expect(view).toContain('aria-pressed="true"');
    expect(view).toContain("Toggle");
  });
});
