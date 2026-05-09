import { describe, expect, test } from "vitest";

import Card from "../../../../src/components/ui/Card.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("Card", () => {
  test("renders repeated item surfaces with semantic element control", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(Card, {
      props: {
        as: "li",
        padding: "sm",
      },
      slots: {
        default: "Archive item",
      },
    });

    expect(view).toContain("<li");
    expect(view).toContain("Archive item");
    expect(view).toContain("p-3");
  });
});
