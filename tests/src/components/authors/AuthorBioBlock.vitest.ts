import { describe, expect, test } from "vitest";

import AuthorBioBlock from "../../../../src/components/authors/AuthorBioBlock.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { authorProfileFixture } from "./author-fixture";

describe("AuthorBioBlock", () => {
  test("renders nothing when no useful author profile content exists", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(AuthorBioBlock, {
      props: {
        profile: {
          ...authorProfileFixture,
          shortBio: undefined,
          socials: [],
          website: undefined,
        },
      },
    });

    expect(view.trim()).toBe("");
  });

  test("renders approved bio, profile links, and long profile body", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(AuthorBioBlock, {
      props: { hasProfileBody: true, profile: authorProfileFixture },
      slots: {
        default: "<p>Long profile body.</p>",
      },
    });

    expect(view).toContain("About Seong-Young Her");
    expect(view).toContain("Brief author bio.");
    expect(view).toContain("Long profile body.");
    expect(view).toContain("Profile");
  });
});
