/** Navigation component example metadata used by catalog coverage checks. */
interface NavigationCatalogExample {
  componentPath: string;
  description: string;
  title: string;
}

export const navigationCatalogExamples = [
  {
    componentPath: "src/components/navigation/BrandLink.astro",
    description: "Publication brand link with truncation behavior.",
    title: "BrandLink",
  },
  {
    componentPath: "src/components/navigation/PrimaryNav.astro",
    description: "Top-level document navigation with current-page state.",
    title: "PrimaryNav",
  },
  {
    componentPath: "src/components/navigation/DiscoveryMenu.astro",
    description:
      "Wide-viewport category discovery navigation with hover/focus previews.",
    title: "DiscoveryMenu",
  },
  {
    componentPath: "src/components/navigation/CategoryDropdown.astro",
    description: "Dropdown category link with hover/focus article preview.",
    title: "CategoryDropdown",
  },
  {
    componentPath: "src/components/navigation/CategoryPreviewList.astro",
    description: "Restrained list of category article preview links.",
    title: "CategoryPreviewList",
  },
  {
    componentPath: "src/components/navigation/SearchForm.astro",
    description: "Semantic search form shared by header and mobile menu.",
    title: "SearchForm",
  },
  {
    componentPath: "src/components/navigation/SearchReveal.astro",
    description: "Compact header search action that reveals the search form.",
    title: "SearchReveal",
  },
  {
    componentPath: "src/components/navigation/SupportLink.astro",
    description: "Reusable publication support call to action.",
    title: "SupportLink",
  },
  {
    componentPath: "src/components/navigation/ThemeToggle.astro",
    description: "Theme toggle button wired to the site theme controller.",
    title: "ThemeToggle",
  },
  {
    componentPath: "src/components/navigation/SectionNavItem.astro",
    description: "Native details disclosure for one category and its articles.",
    title: "SectionNavItem",
  },
  {
    componentPath: "src/components/navigation/CategoryGroup.astro",
    description: "Category-named wrapper around section navigation items.",
    title: "CategoryGroup",
  },
  {
    componentPath: "src/components/navigation/CategoryTree.astro",
    description: "Category discovery tree for sidebars and mobile menus.",
    title: "CategoryTree",
  },
  {
    componentPath: "src/components/navigation/SectionNav.astro",
    description: "Reusable section navigation block with heading and tree.",
    title: "SectionNav",
  },
  {
    componentPath: "src/components/navigation/MobileMenu.astro",
    description:
      "Viewport-constrained mobile menu disclosure with search, theme, nav, and category tree.",
    title: "MobileMenu",
  },
] as const satisfies NavigationCatalogExample[];
