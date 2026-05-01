import { describe, expect, test } from "vitest";

import Badge from "../../../../src/components/ui/Badge.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("Badge", () => {
  test("renders compact metadata labels with variant classes", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(Badge, {
      props: {
        tone: "primary",
        variant: "outline",
      },
      slots: {
        default: "Philosophy",
      },
    });

    expect(view).toContain("Philosophy");
    expect(view).toContain("border-primary");
  });
});
