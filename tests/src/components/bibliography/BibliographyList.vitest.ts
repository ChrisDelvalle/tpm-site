import { describe, expect, test } from "vitest";

import BibliographyList from "../../../../src/components/bibliography/BibliographyList.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { bibliographyEntryFixture } from "./bibliography-fixture";

describe("BibliographyList", () => {
  test("renders bibliography entries in a semantic ordered list", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(BibliographyList, {
      props: { entries: [bibliographyEntryFixture] },
    });

    expect(view).toContain("<ol");
    expect(view).toContain("<li");
    expect(view).toContain("Simulacra and Simulation");
  });
});
