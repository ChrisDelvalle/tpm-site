import { describe, expect, test } from "vitest";

import YouTubeButton from "../../../../src/components/ui/YouTubeButton.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("YouTubeButton", () => {
  test("renders a branded accessible YouTube channel link", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(YouTubeButton, {
      props: {
        href: "https://www.youtube.com/@ThePhilosophersMeme",
      },
    });

    expect(view).toContain(
      'href="https://www.youtube.com/@ThePhilosophersMeme"',
    );
    expect(view).toContain('aria-label="Visit YouTube"');
    expect(view).toContain("bg-[#FF0033]");
    expect(view).toContain("h-9 w-32");
    expect(view).toContain("min-w-0");
    expect(view).toContain("shrink");
    expect(view).toContain("rounded-xl");
    expect(view).toContain("h-5");
    expect(view).toContain("w-auto");
    expect(view).toContain("max-w-full");
    expect(view).toContain("youtube-logo-white.svg");
  });
});
