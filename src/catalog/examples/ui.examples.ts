/** Component example metadata used by catalog coverage checks. */
interface UiCatalogExample {
  componentPath: string;
  description: string;
  title: string;
}

export const uiCatalogExamples = [
  {
    componentPath: "src/components/ui/ActionCluster.astro",
    description: "One-line action grouping primitive with alignment variants.",
    title: "ActionCluster",
  },
  {
    componentPath: "src/components/ui/AnchoredPanel.astro",
    description:
      "Fixed floating surface that consumes shared anchor CSS variables.",
    title: "AnchoredPanel",
  },
  {
    componentPath: "src/components/ui/AnchoredRoot.astro",
    description: "Data-attribute boundary for one anchored relationship.",
    title: "AnchoredRoot",
  },
  {
    componentPath: "src/components/ui/AnchoredTrigger.astro",
    description: "Semantic trigger marker for anchored positioning.",
    title: "AnchoredTrigger",
  },
  {
    componentPath: "src/components/ui/Badge.astro",
    description: "Compact metadata label for categories, tags, and states.",
    title: "Badge",
  },
  {
    componentPath: "src/components/ui/Button.astro",
    description: "Native button action with tokenized variants.",
    title: "Button",
  },
  {
    componentPath: "src/components/ui/Card.astro",
    description: "Repeated item surface for cards and list items.",
    title: "Card",
  },
  {
    componentPath: "src/components/ui/Container.astro",
    description: "Constrained responsive page and block container.",
    title: "Container",
  },
  {
    componentPath: "src/components/ui/DiscordButton.astro",
    description: "Discord-branded link button using the official white asset.",
    title: "DiscordButton",
  },
  {
    componentPath: "src/components/ui/IconButton.astro",
    description: "Icon-only native button with required accessible label.",
    title: "IconButton",
  },
  {
    componentPath: "src/components/ui/Input.astro",
    description: "Shared native input styling and invalid state.",
    title: "Input",
  },
  {
    componentPath: "src/components/ui/LinkButton.astro",
    description: "Link-shaped call to action for navigation and support.",
    title: "LinkButton",
  },
  {
    componentPath: "src/components/ui/PatreonButton.astro",
    description: "Patreon-branded support link using a white lockup asset.",
    title: "PatreonButton",
  },
  {
    componentPath: "src/components/ui/Section.astro",
    description: "Full-width content band with spacing and tone variants.",
    title: "Section",
  },
  {
    componentPath: "src/components/ui/Separator.astro",
    description: "Decorative or semantic divider.",
    title: "Separator",
  },
  {
    componentPath: "src/components/ui/TextLink.astro",
    description: "Shared inline and navigation text-link treatment.",
    title: "TextLink",
  },
  {
    componentPath: "src/components/media/EmbedFrame.astro",
    description: "Stable external embed frame with fallback source link.",
    title: "EmbedFrame",
  },
  {
    componentPath: "src/components/media/ResponsiveIframe.astro",
    description: "Accessible iframe with responsive aspect-ratio frame.",
    title: "ResponsiveIframe",
  },
  {
    componentPath: "src/components/media/ThemedImage.astro",
    description: "Theme-aware optimized image pair for equivalent artwork.",
    title: "ThemedImage",
  },
] as const satisfies UiCatalogExample[];
