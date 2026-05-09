import { describe, expect, test } from "bun:test";

import { extractLeadingDisplayLabel } from "../../../../src/lib/article-references/display-label";
import type {
  ArticleReferenceBlockContent,
  ArticleReferenceInlineContent,
  ArticleReferenceLabel,
} from "../../../../src/lib/article-references/model";

const label = "cite-baudrillard-1981" as ArticleReferenceLabel;

describe("article reference display label extraction", () => {
  test("extracts a valid leading display label and preserves rich content", () => {
    const result = extractLeadingDisplayLabel(label, [
      paragraph([
        {
          kind: "text",
          text: "[@Baudrillard 1981] Baudrillard, Jean. ",
        },
        {
          children: [{ kind: "text", text: "Simulacra" }],
          kind: "emphasis",
          text: "Simulacra",
        },
      ]),
    ]);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error("Expected valid display label.");
    }

    expect(result.displayLabel).toBe("Baudrillard 1981");
    const [firstChild] = result.children;

    expect(firstChild?.kind).toBe("paragraph");

    if (firstChild?.kind !== "paragraph") {
      throw new Error("Expected paragraph reference content.");
    }

    expect(firstChild.text).toBe("Baudrillard, Jean. Simulacra");
    expect(firstChild.children[0]).toEqual({
      kind: "text",
      text: "Baudrillard, Jean. ",
    });
    expect(firstChild.children[1]?.kind).toBe("emphasis");
  });

  test("keeps later display-label-like text as ordinary content", () => {
    const result = extractLeadingDisplayLabel(label, [
      paragraph([
        {
          kind: "text",
          text: "Baudrillard later marker [@ordinary text].",
        },
      ]),
    ]);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error("Expected ordinary content.");
    }

    expect(result.displayLabel).toBeUndefined();
    const [firstChild] = result.children;

    if (firstChild?.kind !== "paragraph") {
      throw new Error("Expected paragraph reference content.");
    }

    expect(firstChild.children[0]).toEqual({
      kind: "text",
      text: "Baudrillard later marker [@ordinary text].",
    });
  });

  test("rejects malformed leading display labels", () => {
    expect(
      extractLeadingDisplayLabel(label, [
        paragraph([{ kind: "text", text: "[@]" }]),
      ]),
    ).toEqual({ label, ok: false });
    expect(
      extractLeadingDisplayLabel(label, [
        paragraph([{ kind: "text", text: "[@Missing close" }]),
      ]),
    ).toEqual({ label, ok: false });
  });
});

function paragraph(
  children: readonly ArticleReferenceInlineContent[],
): ArticleReferenceBlockContent {
  return {
    children,
    kind: "paragraph",
    text: children.map((child) => child.text).join(""),
  };
}
