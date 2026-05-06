import { describe, expect, test } from "vitest";

import PatreonButton from "../../../../src/components/ui/PatreonButton.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("PatreonButton", () => {
  test("renders a branded accessible Patreon support link", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(PatreonButton, {
      props: {
        href: "https://patreon.com/thephilosophersmeme",
      },
    });

    expect(view).toContain('href="https://patreon.com/thephilosophersmeme"');
    expect(view).toContain('aria-label="Support Us"');
    expect(view).toContain("bg-[#F96854]");
    expect(view).toContain("h-9 w-32");
    expect(view).toContain("rounded-xl");
    expect(view).toContain("h-4");
    expect(view).toContain("w-auto");
    expect(view).toContain("max-w-full");
    expect(view).toContain("patreon-lockup-white.svg");
  });
});
