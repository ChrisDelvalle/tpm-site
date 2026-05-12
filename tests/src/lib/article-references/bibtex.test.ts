import { describe, expect, test } from "bun:test";

import { parseBibtexEntries } from "../../../../src/lib/article-references/bibtex";

describe("BibTeX parser", () => {
  test("parses citation-manager-shaped entries with nested braces and quotes", () => {
    const result = parseBibtexEntries(`
@book{baudrillard-1981,
  author = {Baudrillard, Jean},
  title = {Simulacra and {Simulation}},
  year = "1981",
  unknown_field = {Preserved}
}

@online(web-source,
  title = {Web Source},
  url = {https://example.com/source}
)
`);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error("Expected parsed BibTeX entries.");
    }

    expect(result.entries).toHaveLength(2);
    expect(result.entries[0]).toMatchObject({
      entryType: "book",
      key: "baudrillard-1981",
      normalizedKey: "baudrillard-1981",
    });
    expect(result.entries[0]?.fields).toMatchObject({
      author: "Baudrillard, Jean",
      title: "Simulacra and {Simulation}",
      unknown_field: "Preserved",
      year: "1981",
    });
    expect(result.entries[0]?.raw).toContain("@book{baudrillard-1981");
    expect(result.entries[1]?.entryType).toBe("online");
    expect(result.entries[1]?.key).toBe("web-source");
  });

  test("ignores BibTeX comments and reports malformed entries precisely", () => {
    const ignored = parseBibtexEntries(`
% exported from a citation manager
@comment{not a bibliography item}
@article{real-source, title = {Real Source}}
`);

    expect(ignored.ok).toBe(true);

    if (!ignored.ok) {
      throw new Error("Expected comments to be ignored.");
    }

    expect(ignored.entries.map((entry) => entry.key)).toEqual(["real-source"]);

    const malformed = parseBibtexEntries(
      "@book{missing-comma title = {Broken}}",
    );

    expect(malformed.ok).toBe(false);

    if (malformed.ok) {
      throw new Error("Expected malformed BibTeX diagnostics.");
    }

    expect(malformed.diagnostics[0]?.message).toContain(
      "Expected ',' after BibTeX key",
    );
    expect(malformed.diagnostics[0]?.offset).toBeGreaterThan(0);
  });
});
