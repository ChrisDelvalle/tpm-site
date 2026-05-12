import { describe, expect, test } from "vitest";

import Section from "../../../../src/components/ui/Section.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("Section", () => {
  test("renders full-width content bands with tokenized tones", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(Section, {
      props: {
        tone: "muted",
      },
      slots: {
        default: "<h2>Latest</h2>",
      },
    });

    expect(view).toContain("<section");
    expect(view).toContain("bg-muted");
    expect(view).toContain("Latest");
  });
});
