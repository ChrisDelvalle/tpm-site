import { describe, expect, test } from "vitest";

import DiscordButton from "../../../../src/components/ui/DiscordButton.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("DiscordButton", () => {
  test("renders a branded accessible Discord link with the white brand asset", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(DiscordButton, {
      props: {
        href: "https://discord.gg/8MVFRMa",
      },
    });

    expect(view).toContain('href="https://discord.gg/8MVFRMa"');
    expect(view).toContain('aria-label="Join Discord"');
    expect(view).toContain("bg-[#5865F2]");
    expect(view).toContain("h-9 w-32");
    expect(view).toContain("rounded-xl");
    expect(view).toContain("h-4");
    expect(view).toContain("w-auto");
    expect(view).toContain("max-w-full");
    expect(view).toContain("discord-logo-white.svg");
    expect(view).not.toContain("discord-logo-black.svg");
  });
});
