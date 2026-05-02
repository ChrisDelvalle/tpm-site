import { describe, expect, test } from "bun:test";

import {
  authorDisplayNameForArticle,
  authorEntriesForByline,
  authorProfiles,
  authorSummariesForArticle,
  normalizeAuthorAlias,
  unknownAuthorBylines,
} from "../../../src/lib/authors";
import { articleEntry, authorEntry } from "../../helpers/content";

describe("author helpers", () => {
  test("normalizes aliases for case-insensitive byline matching", () => {
    expect(normalizeAuthorAlias("  Seong-Young   Her ")).toBe(
      "seong-young her",
    );
  });

  test("resolves single and multi-author bylines in author order", () => {
    const seong = authorEntry({
      displayName: "Seong-Young Her",
      id: "seong-young-her",
    });
    const masha = authorEntry({
      displayName: "Masha Zharova",
      id: "masha-zharova",
    });

    expect(
      authorEntriesForByline("Seong-Young Her & Masha Zharova", [
        masha,
        seong,
      ]).map((author) => author.id),
    ).toEqual(["seong-young-her", "masha-zharova"]);
  });

  test("returns structured summaries and a structured display byline when known", () => {
    const article = articleEntry({
      data: { author: "Seong-Young Her & Masha Zharova" },
    });
    const authors = [
      authorEntry({
        displayName: "Seong-Young Her",
        id: "seong-young-her",
      }),
      authorEntry({
        displayName: "Masha Zharova",
        id: "masha-zharova",
      }),
    ];

    expect(
      authorSummariesForArticle(article, authors).map((author) => author.href),
    ).toEqual(["/authors/seong-young-her/", "/authors/masha-zharova/"]);
    expect(authorDisplayNameForArticle(article, authors)).toBe(
      "Seong-Young Her & Masha Zharova",
    );
  });

  test("falls back to the legacy byline when no author mapping exists", () => {
    const article = articleEntry({ data: { author: "Unknown Author" } });

    expect(authorSummariesForArticle(article, [])).toEqual([]);
    expect(authorDisplayNameForArticle(article, [])).toBe("Unknown Author");
    expect(unknownAuthorBylines([article], [])).toEqual(["Unknown Author"]);
  });

  test("builds profiles with sorted article relationships", () => {
    const author = authorEntry({
      displayName: "Seong-Young Her",
      id: "seong-young-her",
    });
    const older = articleEntry({
      data: {
        author: "Seong-Young Her",
        date: new Date("2020-01-01T00:00:00.000Z"),
      },
      id: "older",
    });
    const newer = articleEntry({
      data: {
        author: "Seong-Young Her",
        date: new Date("2022-01-01T00:00:00.000Z"),
      },
      id: "newer",
    });

    expect(authorProfiles([author], [older, newer])[0]?.articles).toEqual([
      newer,
      older,
    ]);
  });

  test("fails duplicate aliases across author profiles", () => {
    const first = authorEntry({
      aliases: ["Same"],
      displayName: "First",
      id: "first",
    });
    const second = authorEntry({
      aliases: ["same"],
      displayName: "Second",
      id: "second",
    });

    expect(() => authorProfiles([first, second], [])).toThrow(
      "Duplicate author aliases",
    );
  });
});
