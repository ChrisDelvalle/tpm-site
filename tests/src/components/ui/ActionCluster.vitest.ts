import { describe, expect, test } from "vitest";

import ActionCluster from "../../../../src/components/ui/ActionCluster.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("ActionCluster", () => {
  test("renders one-line action groups with explicit alignment and gap variants", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ActionCluster, {
      props: {
        align: "end",
        class: "text-sm",
        gap: "xs",
      },
      slots: {
        default:
          "<a href='/articles/'>Articles</a><a href='/support/'>Support</a>",
      },
    });

    expect(view).toContain("data-action-cluster");
    expect(view).toContain("inline-flex");
    expect(view).toContain("flex-nowrap");
    expect(view).toContain("justify-end");
    expect(view).toContain("gap-1");
    expect(view).toContain("<a href='/articles/'>Articles</a>");
    expect(view).toContain("<a href='/support/'>Support</a>");
  });
});
