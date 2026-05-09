import { describe, expect, test } from "vitest";

import PageHeader from "../../../../src/components/pages/PageHeader.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("PageHeader", () => {
  test("renders a generic page title and optional description", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(PageHeader, {
      props: {
        description: "About The Philosopher's Meme.",
        title: "About",
      },
    });

    expect(view).toContain("<h1");
    expect(view).toContain("About");
    expect(view).toContain("About The Philosopher&#39;s Meme.");
  });
});
