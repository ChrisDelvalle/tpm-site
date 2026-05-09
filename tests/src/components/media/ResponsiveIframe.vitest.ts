import { describe, expect, test } from "vitest";

import ResponsiveIframe from "../../../../src/components/media/ResponsiveIframe.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("ResponsiveIframe", () => {
  test("requires accessible iframe metadata and reserves responsive space", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ResponsiveIframe, {
      props: {
        src: "https://example.com/embed",
        title: "Example embed",
      },
    });

    expect(view).toContain("aspect-video");
    expect(view).toContain('loading="lazy"');
    expect(view).toContain('title="Example embed"');
  });
});
