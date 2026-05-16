import { describe, expect, test } from "vitest";

import ActionMenuItem from "../../../../src/components/ui/ActionMenuItem.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("ActionMenuItem", () => {
  test("renders a native button action by default", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ActionMenuItem, {
      slots: {
        default: "Copy link",
        icon: "<svg aria-hidden='true'></svg>",
      },
    });

    expect(view).toContain("<button");
    expect(view).toContain('type="button"');
    expect(view).toContain("Copy link");
    expect(view).toContain("grid-cols-[1rem_minmax(0,1fr)]");
  });

  test("renders a native link action when requested", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ActionMenuItem, {
      props: {
        as: "a",
        href: "mailto:test@example.com",
      },
      slots: {
        default: "Email",
      },
    });

    expect(view).toContain("<a");
    expect(view).toContain('href="mailto:test@example.com"');
    expect(view).toContain("Email");
  });
});
