import type { ArticleListItem } from "../../lib/article-list";
import type { SectionNavItem } from "../../lib/navigation";

/** Deliberately awkward text used to exercise wrapping behavior. */
export const longUnbrokenWord =
  "metamemeticcountercounterinterpretationwithoutnaturalbreakpoints";

/** Tag set large enough to expose wrapping and density issues. */
export const catalogTags = [
  "metamemetics",
  "philosophy",
  "history",
  "platforms",
  "memeculture",
  longUnbrokenWord,
] as const;

/** Navigation data with long titles, current state, dense lists, and one-item lists. */
export const catalogNavigationItems = [
  {
    articles: [
      {
        description: "A compact article example for navigation previews.",
        href: "/articles/memes-are-not-jokes-they-are-diagram-games/",
        isCurrent: false,
        slug: "memes-are-not-jokes-they-are-diagram-games",
        title: "Memes Are Not Jokes: They Are Diagram Games",
      },
      {
        description: "A deliberately long title for wrapping behavior.",
        href: "/articles/wittgensteins-most-beloved-quote-was-real-but-its-fake-now/",
        isCurrent: true,
        slug: "wittgensteins-most-beloved-quote-was-real-but-its-fake-now",
        title: "Wittgenstein's Most Beloved Quote Was Real, But It's Fake Now",
      },
      {
        description: "A hostile long-word title example.",
        href: "/articles/hostile-title-example/",
        isCurrent: false,
        slug: "hostile-title-example",
        title: `One ${longUnbrokenWord} Example`,
      },
    ],
    description: "How memes move through culture and platforms.",
    href: "/categories/metamemetics/",
    isCurrent: false,
    isOpen: true,
    slug: "metamemetics",
    title: "Metamemetics",
  },
  {
    articles: [
      {
        description: "Game studies category article example.",
        href: "/articles/twitch-plays-pokemon/",
        isCurrent: false,
        slug: "twitch-plays-pokemon",
        title: "Twitch Plays Pokemon",
      },
    ],
    description: "Games and culture.",
    href: "/categories/game-studies/",
    isCurrent: false,
    isOpen: false,
    slug: "game-studies",
    title: "Game Studies",
  },
] as const satisfies readonly SectionNavItem[];

/** Article card/list data with compact, long-title, and long-word variants. */
export const catalogArticleItems = [
  {
    author: "Seong-Young Her",
    category: {
      href: "/categories/metamemetics/",
      title: "Metamemetics",
    },
    date: "April 6, 2022",
    description:
      "A compact article teaser with enough text to check wrapping and rhythm.",
    href: "/articles/wittgensteins-most-beloved-quote-was-real-but-its-fake-now/",
    title: "Wittgenstein's Most Beloved Quote Was Real, But It's Fake Now",
  },
  {
    author: "Seong-Young Her",
    category: {
      href: "/categories/game-studies/",
      title: "Game Studies",
    },
    date: "May 16, 2021",
    description:
      "A second card keeps list spacing and repeated-item styling visible.",
    href: "/articles/gamergate-as-metagaming/",
    title: "Gamergate as Metagaming",
  },
  {
    author: "Catalog Fixture",
    category: {
      href: "/categories/aesthetics/",
      title: "Aesthetics",
    },
    date: "January 1, 2026",
    description: `A hostile fixture with ${longUnbrokenWord} in ordinary prose.`,
    href: "/articles/hostile-article-card/",
    title: `A Very Long Article Title Containing ${longUnbrokenWord}`,
  },
] as const satisfies readonly ArticleListItem[];
