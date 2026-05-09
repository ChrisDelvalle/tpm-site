import { describe, expect, test } from "vitest";

import Container from "../../../../src/components/ui/Container.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("Container", () => {
  test("renders constrained responsive page containers", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(Container, {
      props: {
        as: "main",
        size: "prose",
      },
      slots: {
        default: "Page content",
      },
    });

    expect(view).toContain("<main");
    expect(view).toContain("max-w-prose");
    expect(view).toContain("Page content");
  });
});
