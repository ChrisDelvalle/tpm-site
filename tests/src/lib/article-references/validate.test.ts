import { describe, expect, test } from "bun:test";

import {
  articleReferenceDiagnosticMessage,
  hasArticleReferenceDiagnostics,
} from "../../../../src/lib/article-references/validate";

describe("article reference diagnostics", () => {
  test("reports whether diagnostics are present", () => {
    expect(hasArticleReferenceDiagnostics([])).toBe(false);
    expect(
      hasArticleReferenceDiagnostics([
        {
          code: "invalid-label",
          label: "source-1",
          source: "reference",
        },
      ]),
    ).toBe(true);
  });

  test("formats author-readable messages with repair hints", () => {
    expect(
      articleReferenceDiagnosticMessage({
        code: "missing-definition",
        label: "cite-baudrillard-1981",
      }),
    ).toContain('Add a "[^cite-baudrillard-1981]:" definition');
    expect(
      articleReferenceDiagnosticMessage({
        code: "repeated-note-reference",
        label: "note-context",
      }),
    ).toContain("use a cite-* label");
  });
});
