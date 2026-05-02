import { describe, expect, test } from "bun:test";

import {
  articleReferenceBacklinkId,
  articleReferenceEntryId,
  articleReferenceMarkerDisplayText,
  articleReferenceMarkerId,
} from "../../../../src/lib/article-references/ids";
import type { ArticleReferenceLabel } from "../../../../src/lib/article-references/model";

const citationLabel = "cite-baudrillard-1981" as ArticleReferenceLabel;
const noteLabel = "note-term-scope" as ArticleReferenceLabel;

describe("article reference ID helpers", () => {
  test("generate stable entry, marker, and backlink IDs", () => {
    expect(articleReferenceEntryId(citationLabel)).toBe(
      "cite-baudrillard-1981",
    );
    expect(articleReferenceMarkerId(citationLabel, 0)).toBe(
      "cite-ref-baudrillard-1981",
    );
    expect(articleReferenceMarkerId(citationLabel, 1)).toBe(
      "cite-ref-baudrillard-1981-2",
    );
    expect(articleReferenceBacklinkId(noteLabel, 0)).toBe(
      "note-backref-term-scope",
    );
  });

  test("uses citation display labels only when provided", () => {
    expect(
      articleReferenceMarkerDisplayText("citation", 2, "Baudrillard 1981"),
    ).toBe("Baudrillard 1981");
    expect(articleReferenceMarkerDisplayText("citation", 2, undefined)).toBe(
      "2",
    );
    expect(articleReferenceMarkerDisplayText("note", 1, "term scope")).toBe(
      "1",
    );
  });
});
