import { describe, expect, test } from "bun:test";

import {
  activeEditorialCollections,
  collectionDirectoryListItems,
  collectionItemReferences,
  editorialCollectionById,
  type EditorialCollectionEntry,
  resolvePublishableCollection,
} from "../../../src/lib/collections";
import {
  defaultPublishableVisibility,
  type PublishableEntry,
  type PublishableVisibility,
} from "../../../src/lib/publishable";

describe("editorial collections", () => {
  test("filters draft collections and sorts active collections by id", () => {
    const entries = [
      collectionEntry("start-here"),
      collectionEntry("draft", { draft: true }),
      collectionEntry("featured"),
    ];

    expect(
      activeEditorialCollections(entries).map((entry) => entry.id),
    ).toEqual(["featured", "start-here"]);
    expect(editorialCollectionById(entries, "featured")?.id).toBe("featured");
    expect(editorialCollectionById(entries, "draft")).toBeUndefined();
  });

  test("normalizes string and object item references", () => {
    expect(
      collectionItemReferences(
        collectionEntry("featured", {
          items: [
            "what-is-a-meme",
            {
              note: "Start here.",
              slug: "homesteading-the-memeosphere",
            },
          ],
        }),
      ),
    ).toEqual([
      { slug: "what-is-a-meme" },
      { note: "Start here.", slug: "homesteading-the-memeosphere" },
    ]);
  });

  test("resolves collection items in manual order with notes", () => {
    const collection = collectionEntry("featured", {
      items: [
        {
          note: "Read this first.",
          slug: "article",
        },
        "announcement",
      ],
    });
    const resolved = resolvePublishableCollection(
      collection,
      new Map([
        ["announcement", publishable("announcement", "announcement")],
        ["article", publishable("article", "article")],
      ]),
      { requiredVisibility: "homepage" },
    );

    expect(resolved).toMatchObject({
      id: "featured",
      title: "Featured",
    });
    expect(resolved.items.map((item) => item.entry.slug)).toEqual([
      "article",
      "announcement",
    ]);
    expect(resolved.items[0]?.note).toBe("Read this first.");
  });

  test("rejects duplicate, missing, and homepage-hidden items", () => {
    const duplicate = collectionEntry("featured", {
      items: ["article", "article"],
    });
    expect(() =>
      resolvePublishableCollection(
        duplicate,
        new Map([["article", publishable("article")]]),
      ),
    ).toThrow('Collection "featured" contains duplicate item slugs: article.');

    expect(() =>
      resolvePublishableCollection(
        collectionEntry("featured", { items: ["missing"] }),
        new Map(),
      ),
    ).toThrow(
      'Collection "featured" references unknown publishable slug "missing".',
    );

    expect(() =>
      resolvePublishableCollection(
        collectionEntry("featured", { items: ["hidden"] }),
        new Map([
          [
            "hidden",
            publishable("hidden", "article", {
              ...defaultPublishableVisibility,
              homepage: false,
            }),
          ],
        ]),
        { requiredVisibility: "homepage" },
      ),
    ).toThrow(
      'Collection "featured" references "hidden", but that entry is hidden from homepage.',
    );
  });

  test("maps directory-visible collection entries into compact list items", () => {
    const items = collectionDirectoryListItems(
      collectionEntry("start-here", {
        items: [
          { note: "Use this note in the directory.", slug: "visible" },
          "hidden",
        ],
      }),
      new Map([
        [
          "hidden",
          publishable("hidden", "article", {
            ...defaultPublishableVisibility,
            directory: false,
          }),
        ],
        ["visible", publishable("visible")],
      ]),
    );

    expect(items).toEqual([
      {
        author: "Author",
        date: "May 5, 2026",
        description: "Use this note in the directory.",
        href: "/articles/visible/",
        kind: "article",
        title: "visible",
      },
    ]);
  });
});

function collectionEntry(
  id: string,
  data: Partial<EditorialCollectionEntry["data"]> = {},
): EditorialCollectionEntry {
  return {
    body: "",
    collection: "collections",
    data: {
      draft: false,
      items: [],
      title: "Featured",
      ...data,
    },
    id,
  };
}

function publishable(
  slug: string,
  kind: PublishableEntry["kind"] = "article",
  visibility: PublishableVisibility = defaultPublishableVisibility,
): PublishableEntry {
  return {
    author: "Author",
    date: "May 5, 2026",
    description: "Description",
    href: `/${kind}s/${slug}/`,
    kind,
    slug,
    title: slug,
    visibility,
  };
}
