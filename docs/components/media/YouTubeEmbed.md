# YouTubeEmbed

Source: `src/components/media/YouTubeEmbed.astro`

`YouTubeEmbed` is a provider-specific wrapper around `ResponsiveIframe` for
responsive YouTube video embeds.

## Public Contract

- `src: string`
- `title: string`
- `class?: string`
- `iframeClass?: string`

The component sets `layout="video"` so video embeds reserve `aspect-video`
space before load. It exists so MDX authors can use a semantic provider wrapper
instead of remembering iframe layout details.

## Testable Invariants

- reserves responsive video space before load;
- renders a meaningful iframe `title`;
- keeps provider-specific behavior in the shared embed layout model.
