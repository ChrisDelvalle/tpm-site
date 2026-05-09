import { describe, expect, test } from "vitest";

import Input from "../../../../src/components/ui/Input.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("Input", () => {
  test("renders native inputs with invalid state styling", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(Input, {
      props: {
        invalid: true,
        name: "q",
        placeholder: "Search",
        type: "search",
      },
    });

    expect(view).toContain('type="search"');
    expect(view).toContain('aria-invalid="true"');
    expect(view).toContain("border-destructive");
  });
});
