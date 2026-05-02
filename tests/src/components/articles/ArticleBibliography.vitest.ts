import { describe, expect, test } from "vitest";

import ArticleBibliography from "../../../../src/components/articles/ArticleBibliography.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { articleReferenceFixture } from "./reference-fixtures";

describe("ArticleBibliography", () => {
  test("renders ordered citations with multiple backlinks and rich content", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleBibliography, {
      props: { citations: articleReferenceFixture.citations },
    });

    expect(view).toContain(">Bibliography<");
    expect(view).toContain('id="cite-baudrillard-1981"');
    expect(view).toContain("<ol");
    expect(view).toContain("<em");
    expect(view).toContain(">Simulacra</em>");
    expect(view).toContain("Back to citation reference 1");
    expect(view).toContain("Back to citation reference 2");
    expect(view).not.toContain("[@Baudrillard 1981]");
  });

  test("renders nothing for an empty citation array", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleBibliography, {
      props: { citations: [] },
    });

    expect(view.trim()).toBe("");
  });
});
