import { describe, expect, test } from "vitest";

import BaseLayout from "../../../src/layouts/BaseLayout.astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../helpers/astro-container";

describe("BaseLayout", () => {
  test("renders the site shell, metadata, and slotted page content", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(BaseLayout, {
      props: {
        canonicalPath: "/example/",
        description: "Example page.",
        title: "Example Page",
      },
      request: new Request(`${testSiteUrl}/example/`),
      slots: {
        default: "<section><h1>Example Page</h1></section>",
      },
    });

    expect(view).toContain('class="site-header"');
    expect(view).toContain("<h1>Example Page</h1>");
    expect(view).toContain("Category navigation");
  });
});
