# SoundCloudEmbed

Source: `src/components/media/SoundCloudEmbed.astro`

`SoundCloudEmbed` is a provider-specific wrapper around `ResponsiveIframe` for
compact SoundCloud audio players.

## Public Contract

- `sourceUrl?: string`
- `src?: string`
- `title: string`
- `class?: string`
- `iframeClass?: string`

Provide either a direct SoundCloud player `src` or a public SoundCloud
`sourceUrl`. The component sets `layout="audio"`, `scrolling="no"`,
`allow="autoplay"`, and disables fullscreen because SoundCloud players are
compact audio controls rather than video canvases.

## Testable Invariants

- reserves compact audio-player height rather than video aspect-ratio space;
- renders a meaningful iframe `title`;
- accepts a public source URL without requiring authors to hand-build the
  player URL.
