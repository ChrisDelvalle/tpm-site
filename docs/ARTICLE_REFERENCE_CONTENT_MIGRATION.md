# Article Reference Content Migration Catalog

Generated from repository content on May 5, 2026.

This catalog tracks every article before manual reference normalization.
It is intentionally conservative: ordinary prose links stay ordinary prose
unless an article is explicitly edited to cite them.

## Status Legend

- `clean`: no reference-like content detected by the catalog.
- `prose-links-only`: only ordinary Markdown links, raw URLs, or archive
  links were detected; these are not bibliography entries by default.
- `mechanical-safe`: the article has simple HTML links that can be converted
  to Markdown without classifying them as citations.
- `manual-required`: the article has footnotes, reference sections, source
  credits, structural HTML anchors, or bibliography-shaped content that
  needs human review.

## Mechanical Pass Scope

Mechanical migration may convert only simple HTML `<a href>` links and
simple HTML paragraph wrappers into normal Markdown. It must not convert
footnotes, reference sections, media credits, glossary named anchors, or
ordinary prose links into structured bibliography entries.

## Summary

- Clean articles: 12
- Prose-links-only articles: 41
- Mechanical-safe articles: 0
- Manual-required articles: 8

## Article Inventory

| Article                                                                                                 | Status             | One-line inventory                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/content/articles/aesthetics/a-short-note-on-gondola.md`                                            | `clean`            | No reference-like content detected.                                                                                                                         |
| `src/content/articles/aesthetics/gondola-shrine.md`                                                     | `prose-links-only` | markdown links: 1; raw URLs: 2                                                                                                                              |
| `src/content/articles/aesthetics/kandinsky-and-loss.md`                                                 | `prose-links-only` | markdown links: 2; raw URLs: 2                                                                                                                              |
| `src/content/articles/aesthetics/memes-jokes-and-visual-puns.md`                                        | `prose-links-only` | markdown links: 4; raw URLs: 4                                                                                                                              |
| `src/content/articles/aesthetics/platform-content-design.md`                                            | `prose-links-only` | markdown links: 1; raw URLs: 1                                                                                                                              |
| `src/content/articles/aesthetics/structure-and-content-in-drake-style-templates.md`                     | `prose-links-only` | markdown links: 1; raw URLs: 1                                                                                                                              |
| `src/content/articles/aesthetics/the-interpretation-of-memes.md`                                        | `clean`            | No reference-like content detected.                                                                                                                         |
| `src/content/articles/aesthetics/tmnh.md`                                                               | `clean`            | No reference-like content detected.                                                                                                                         |
| `src/content/articles/aesthetics/we-can-have-retrieval-inference-synthesis.md`                          | `clean`            | No reference-like content detected.                                                                                                                         |
| `src/content/articles/game-studies/gamergate-as-metagaming.md`                                          | `manual-required`  | reference-section headings: 1                                                                                                                               |
| `src/content/articles/game-studies/hotline-miami-and-player-complicity.md`                              | `clean`            | No reference-like content detected.                                                                                                                         |
| `src/content/articles/game-studies/memes-are-not-jokes-they-are-diagram-games.md`                       | `prose-links-only` | markdown links: 1; raw URLs: 1                                                                                                                              |
| `src/content/articles/game-studies/the-memetic-bottleneck.md`                                           | `prose-links-only` | markdown links: 14; raw URLs: 15                                                                                                                            |
| `src/content/articles/game-studies/twitch-plays-pokemon.mdx`                                            | `prose-links-only` | markdown links: 5; raw URLs: 5                                                                                                                              |
| `src/content/articles/game-studies/undertale-review.md`                                                 | `prose-links-only` | markdown links: 2; raw URLs: 2                                                                                                                              |
| `src/content/articles/history/2010-decade-review-part-1.md`                                             | `prose-links-only` | markdown links: 6; raw URLs: 6                                                                                                                              |
| `src/content/articles/history/2010-decade-review-part-2.md`                                             | `prose-links-only` | markdown links: 18; raw URLs: 18                                                                                                                            |
| `src/content/articles/history/a-golden-age-of-meme-pages-and-the-microcosm-of-art-history.md`           | `prose-links-only` | markdown links: 4                                                                                                                                           |
| `src/content/articles/history/concept-jjalbang.md`                                                      | `prose-links-only` | markdown links: 4; raw URLs: 5                                                                                                                              |
| `src/content/articles/history/death-of-a-meme-or-how-leo-learned-to-stop-worrying-and-love-the-bear.md` | `prose-links-only` | markdown links: 6; raw URLs: 5                                                                                                                              |
| `src/content/articles/history/facebook-groups.md`                                                       | `clean`            | No reference-like content detected.                                                                                                                         |
| `src/content/articles/history/jeremy-cahill-metamer-dismissed-for-serious-misconduct.md`                | `clean`            | No reference-like content detected.                                                                                                                         |
| `src/content/articles/history/kym-magibon.md`                                                           | `prose-links-only` | markdown links: 2; raw URLs: 2                                                                                                                              |
| `src/content/articles/history/long-boys-never-grow-up.md`                                               | `prose-links-only` | markdown links: 19; raw URLs: 19                                                                                                                            |
| `src/content/articles/history/misattributed-plato-quote-is-real-now.md`                                 | `prose-links-only` | markdown links: 1; raw URLs: 1                                                                                                                              |
| `src/content/articles/history/the-meta-ironic-era.md`                                                   | `prose-links-only` | markdown links: 1; raw URLs: 1                                                                                                                              |
| `src/content/articles/history/what-we-talk-about-harambe.md`                                            | `prose-links-only` | markdown links: 14; raw URLs: 12                                                                                                                            |
| `src/content/articles/history/wittgensteins-most-beloved-quote-was-real-but-its-fake-now.md`            | `prose-links-only` | markdown links: 2; raw URLs: 1                                                                                                                              |
| `src/content/articles/irony/bane-loss-and-phylogeny.md`                                                 | `prose-links-only` | markdown links: 3; raw URLs: 3                                                                                                                              |
| `src/content/articles/irony/defining-normie-casual-ironist-and-autist-in-internet-subcultures.md`       | `prose-links-only` | markdown links: 6; raw URLs: 6                                                                                                                              |
| `src/content/articles/irony/post-irony-against-meta-irony.md`                                           | `prose-links-only` | markdown links: 10; archive links: 2; raw URLs: 10                                                                                                          |
| `src/content/articles/irony/the-ironic-normie.md`                                                       | `prose-links-only` | markdown links: 2; raw URLs: 2                                                                                                                              |
| `src/content/articles/irony/the-quadrant-system-for-the-categorization-of-internet-memes.md`            | `prose-links-only` | markdown links: 1                                                                                                                                           |
| `src/content/articles/irony/the-revised-quadrant-model.md`                                              | `prose-links-only` | markdown links: 1; raw URLs: 1                                                                                                                              |
| `src/content/articles/irony/when-you-drink-water.md`                                                    | `prose-links-only` | markdown links: 1; raw URLs: 1                                                                                                                              |
| `src/content/articles/memeculture/a-short-note-on-the-death-of-pepe.md`                                 | `prose-links-only` | markdown links: 2; raw URLs: 1                                                                                                                              |
| `src/content/articles/memeculture/all-memes-are-from-the-future.md`                                     | `prose-links-only` | markdown links: 1; raw URLs: 1                                                                                                                              |
| `src/content/articles/memeculture/early-trash-dove.md`                                                  | `manual-required`  | markdown links: 15; archive links: 5; raw URLs: 16; media/source credit lines: 2                                                                            |
| `src/content/articles/memeculture/gme-frenzy-hints-at-the-new-stage-of-memecultures.md`                 | `prose-links-only` | markdown links: 2; raw URLs: 2                                                                                                                              |
| `src/content/articles/memeculture/homesteading-the-memeosphere.md`                                      | `prose-links-only` | markdown links: 6; raw URLs: 6                                                                                                                              |
| `src/content/articles/memeculture/moe-to-memes-otaku-to-autist.md`                                      | `prose-links-only` | markdown links: 1; raw URLs: 1                                                                                                                              |
| `src/content/articles/memeculture/newfriends-and-the-generation-gap.md`                                 | `clean`            | No reference-like content detected.                                                                                                                         |
| `src/content/articles/memeculture/the-new-years-memes.md`                                               | `clean`            | No reference-like content detected.                                                                                                                         |
| `src/content/articles/metamemetics/glossary-1-dot-0.md`                                                 | `manual-required`  | raw HTML links: 20; markdown links: 19                                                                                                                      |
| `src/content/articles/metamemetics/internetmemetics.md`                                                 | `manual-required`  | reference-section headings: 1; markdown links: 54; archive links: 10; raw URLs: 54                                                                          |
| `src/content/articles/metamemetics/the-memeticists-challenge-remains-open.md`                           | `manual-required`  | reference-section headings: 1; markdown links: 26; raw URLs: 26                                                                                             |
| `src/content/articles/metamemetics/vulliamy-response.md`                                                | `prose-links-only` | markdown links: 4; raw URLs: 4                                                                                                                              |
| `src/content/articles/metamemetics/what-is-a-meme.md`                                                   | `manual-required`  | noncanonical footnote definitions: 7; noncanonical footnote markers: 7; reference-section headings: 1; markdown links: 10; raw URLs: 10                     |
| `src/content/articles/philosophy/a-school-of-internet-philosophy.md`                                    | `prose-links-only` | markdown links: 1; raw URLs: 1                                                                                                                              |
| `src/content/articles/philosophy/an-internet-koan.md`                                                   | `prose-links-only` | markdown links: 2; raw URLs: 2                                                                                                                              |
| `src/content/articles/philosophy/how-to-digitally-coauthor-articles-in-philosophy-class.md`             | `manual-required`  | reference-section headings: 1; markdown links: 1; raw URLs: 1                                                                                               |
| `src/content/articles/philosophy/postnaturalism.md`                                                     | `manual-required`  | noncanonical footnote definitions: 33; noncanonical footnote markers: 35; reference-section headings: 1; markdown links: 17; archive links: 3; raw URLs: 17 |
| `src/content/articles/politics/a-tale-of-two-healthcare-narratives.md`                                  | `prose-links-only` | markdown links: 3; archive links: 2; raw URLs: 3                                                                                                            |
| `src/content/articles/politics/joshua-citarella-astroturfing.md`                                        | `prose-links-only` | markdown links: 3; raw URLs: 2                                                                                                                              |
| `src/content/articles/politics/on-circlejerk-part-1.md`                                                 | `clean`            | No reference-like content detected.                                                                                                                         |
| `src/content/articles/politics/on-vectoralism-and-the-meme-alliance.mdx`                                | `prose-links-only` | markdown links: 24; raw URLs: 24                                                                                                                            |
| `src/content/articles/politics/president-parks-corruption-cult.md`                                      | `prose-links-only` | markdown links: 1; raw URLs: 1                                                                                                                              |
| `src/content/articles/politics/see-the-problem.md`                                                      | `clean`            | No reference-like content detected.                                                                                                                         |
| `src/content/articles/politics/social-media-freedom.mdx`                                                | `prose-links-only` | markdown links: 30; raw URLs: 30                                                                                                                            |
| `src/content/articles/politics/the-post-pepe-manifesto.md`                                              | `clean`            | No reference-like content detected.                                                                                                                         |
| `src/content/articles/politics/the-structure-of-hyperspatial-politics.md`                               | `prose-links-only` | markdown links: 15; archive links: 2; raw URLs: 16                                                                                                          |

## Article Details

### `src/content/articles/aesthetics/a-short-note-on-gondola.md`

Status: `clean`

Inventory: No reference-like content detected.

### `src/content/articles/aesthetics/gondola-shrine.md`

Status: `prose-links-only`

Inventory: markdown links: 1; raw URLs: 2

### `src/content/articles/aesthetics/kandinsky-and-loss.md`

Status: `prose-links-only`

Inventory: markdown links: 2; raw URLs: 2

### `src/content/articles/aesthetics/memes-jokes-and-visual-puns.md`

Status: `prose-links-only`

Inventory: markdown links: 4; raw URLs: 4

### `src/content/articles/aesthetics/platform-content-design.md`

Status: `prose-links-only`

Inventory: markdown links: 1; raw URLs: 1

### `src/content/articles/aesthetics/structure-and-content-in-drake-style-templates.md`

Status: `prose-links-only`

Inventory: markdown links: 1; raw URLs: 1

### `src/content/articles/aesthetics/the-interpretation-of-memes.md`

Status: `clean`

Inventory: No reference-like content detected.

### `src/content/articles/aesthetics/tmnh.md`

Status: `clean`

Inventory: No reference-like content detected.

### `src/content/articles/aesthetics/we-can-have-retrieval-inference-synthesis.md`

Status: `clean`

Inventory: No reference-like content detected.

### `src/content/articles/game-studies/gamergate-as-metagaming.md`

Status: `manual-required`

Inventory: reference-section headings: 1

Reference headings:

- Line 14: `## References`

### `src/content/articles/game-studies/hotline-miami-and-player-complicity.md`

Status: `clean`

Inventory: No reference-like content detected.

### `src/content/articles/game-studies/memes-are-not-jokes-they-are-diagram-games.md`

Status: `prose-links-only`

Inventory: markdown links: 1; raw URLs: 1

### `src/content/articles/game-studies/the-memetic-bottleneck.md`

Status: `prose-links-only`

Inventory: markdown links: 14; raw URLs: 15

### `src/content/articles/game-studies/twitch-plays-pokemon.mdx`

Status: `prose-links-only`

Inventory: markdown links: 5; raw URLs: 5

### `src/content/articles/game-studies/undertale-review.md`

Status: `prose-links-only`

Inventory: markdown links: 2; raw URLs: 2

### `src/content/articles/history/2010-decade-review-part-1.md`

Status: `prose-links-only`

Inventory: markdown links: 6; raw URLs: 6

### `src/content/articles/history/2010-decade-review-part-2.md`

Status: `prose-links-only`

Inventory: markdown links: 18; raw URLs: 18

### `src/content/articles/history/a-golden-age-of-meme-pages-and-the-microcosm-of-art-history.md`

Status: `prose-links-only`

Inventory: markdown links: 4

### `src/content/articles/history/concept-jjalbang.md`

Status: `prose-links-only`

Inventory: markdown links: 4; raw URLs: 5

### `src/content/articles/history/death-of-a-meme-or-how-leo-learned-to-stop-worrying-and-love-the-bear.md`

Status: `prose-links-only`

Inventory: markdown links: 6; raw URLs: 5

### `src/content/articles/history/facebook-groups.md`

Status: `clean`

Inventory: No reference-like content detected.

### `src/content/articles/history/jeremy-cahill-metamer-dismissed-for-serious-misconduct.md`

Status: `clean`

Inventory: No reference-like content detected.

### `src/content/articles/history/kym-magibon.md`

Status: `prose-links-only`

Inventory: markdown links: 2; raw URLs: 2

### `src/content/articles/history/long-boys-never-grow-up.md`

Status: `prose-links-only`

Inventory: markdown links: 19; raw URLs: 19

### `src/content/articles/history/misattributed-plato-quote-is-real-now.md`

Status: `prose-links-only`

Inventory: markdown links: 1; raw URLs: 1

### `src/content/articles/history/the-meta-ironic-era.md`

Status: `prose-links-only`

Inventory: markdown links: 1; raw URLs: 1

### `src/content/articles/history/what-we-talk-about-harambe.md`

Status: `prose-links-only`

Inventory: markdown links: 14; raw URLs: 12

### `src/content/articles/history/wittgensteins-most-beloved-quote-was-real-but-its-fake-now.md`

Status: `prose-links-only`

Inventory: markdown links: 2; raw URLs: 1

### `src/content/articles/irony/bane-loss-and-phylogeny.md`

Status: `prose-links-only`

Inventory: markdown links: 3; raw URLs: 3

### `src/content/articles/irony/defining-normie-casual-ironist-and-autist-in-internet-subcultures.md`

Status: `prose-links-only`

Inventory: markdown links: 6; raw URLs: 6

### `src/content/articles/irony/post-irony-against-meta-irony.md`

Status: `prose-links-only`

Inventory: markdown links: 10; archive links: 2; raw URLs: 10

### `src/content/articles/irony/the-ironic-normie.md`

Status: `prose-links-only`

Inventory: markdown links: 2; raw URLs: 2

### `src/content/articles/irony/the-quadrant-system-for-the-categorization-of-internet-memes.md`

Status: `prose-links-only`

Inventory: markdown links: 1

### `src/content/articles/irony/the-revised-quadrant-model.md`

Status: `prose-links-only`

Inventory: markdown links: 1; raw URLs: 1

### `src/content/articles/irony/when-you-drink-water.md`

Status: `prose-links-only`

Inventory: markdown links: 1; raw URLs: 1

### `src/content/articles/memeculture/a-short-note-on-the-death-of-pepe.md`

Status: `prose-links-only`

Inventory: markdown links: 2; raw URLs: 1

### `src/content/articles/memeculture/all-memes-are-from-the-future.md`

Status: `prose-links-only`

Inventory: markdown links: 1; raw URLs: 1

### `src/content/articles/memeculture/early-trash-dove.md`

Status: `manual-required`

Inventory: markdown links: 15; archive links: 5; raw URLs: 16; media/source credit lines: 2

Media/source credit lines:

- Line 6: `Image source: 4chan /pol/`
- Line 20: `Image source: [Everipedia](https://www.everipedia.com/trash-doves/) (archive: [http://archive.is/vvAPJ](http://archive.is/vvAPJ) )`

### `src/content/articles/memeculture/gme-frenzy-hints-at-the-new-stage-of-memecultures.md`

Status: `prose-links-only`

Inventory: markdown links: 2; raw URLs: 2

### `src/content/articles/memeculture/homesteading-the-memeosphere.md`

Status: `prose-links-only`

Inventory: markdown links: 6; raw URLs: 6

### `src/content/articles/memeculture/moe-to-memes-otaku-to-autist.md`

Status: `prose-links-only`

Inventory: markdown links: 1; raw URLs: 1

### `src/content/articles/memeculture/newfriends-and-the-generation-gap.md`

Status: `clean`

Inventory: No reference-like content detected.

### `src/content/articles/memeculture/the-new-years-memes.md`

Status: `clean`

Inventory: No reference-like content detected.

### `src/content/articles/metamemetics/glossary-1-dot-0.md`

Status: `manual-required`

Inventory: raw HTML links: 20; markdown links: 19

Raw HTML links:

- Line 4: `<a name="Top"></a>`
- Line 30: `<a name="Autist"></a>`
- Line 42: `<a name="IronicMemes"></a>`
- Line 53: `<a name="Ironist"></a>`
- Line 65: `<a name="MetaIronicMemes"></a>`
- Line 77: `<a name="Mutation"></a>`
- Line 88: `<a name="NarratologicalSubversion"></a>`
- Line 95: `<a name="NeoTraditionalistMemes"></a>`
- Line 110: `<a name="Normalization"></a>`
- Line 122: `<a name="Normie"></a>`
- Line 134: `<a name="Normification"></a>`
- Line 147: `<a name="PostIronicMemes"></a>`
- Line 170: `<a name="PreIronicMemes"></a>`
- Line 180: `<a name="ProtoIronicMemes"></a>`
- Line 190: `<a name="SimplicityComplexity"></a>`
- Line 205: `<a name="StructuralSubversion"></a>`
- Line 225: `<a name="StylisticSubversion"></a>`
- Line 233: `<a name="ThePhylomemeticTree"></a>`
- Line 244: `<a name="TheQuadrantofIronicMemes"></a>`
- Line 254: `<a name="TraditionalistMemes"></a>`

### `src/content/articles/metamemetics/internetmemetics.md`

Status: `manual-required`

Inventory: reference-section headings: 1; markdown links: 54; archive links: 10; raw URLs: 54

Reference headings:

- Line 179: `## Bibliography`

### `src/content/articles/metamemetics/the-memeticists-challenge-remains-open.md`

Status: `manual-required`

Inventory: reference-section headings: 1; markdown links: 26; raw URLs: 26

Reference headings:

- Line 146: `## References`

### `src/content/articles/metamemetics/vulliamy-response.md`

Status: `prose-links-only`

Inventory: markdown links: 4; raw URLs: 4

### `src/content/articles/metamemetics/what-is-a-meme.md`

Status: `manual-required`

Inventory: noncanonical footnote definitions: 7; noncanonical footnote markers: 7; reference-section headings: 1; markdown links: 10; raw URLs: 10

Reference headings:

- Line 190: `## Bibliography`

Footnote definitions:

- Line 48: `[^1]: Evnine's primary examples are _Socially Awkward Penguin_ and _Batman Slapping Robin_, which both became popular in the 2000s. While these examples are helpful in laying down the basics, I find it necessary to consider more recent examples when exploring the concept of a meme, just as it is necessary to consider postmodern art when exploring the concept of art.`
- Line 56: `[^2]: One of the defining features of what I am calling 'avant-garde' memes is that they self-consciously deconstruct and upturn the norms of meme-making. Many avant-garde memes do not contain a _joke_ per se, but exist for the sake of direct anti-aesthetic appreciation; such memes often have a comedic effect that may be impossible to explain to an unappreciative viewer. Example: 'Memes Without Bottom Text' (Facebook page and meme genre) \[8\]`
- Line 58: `[^3]: Warning: both of these pages contain violent or disturbing images and insensitive humour.`
- Line 80: `[^4]: See 'Memes: A Microcosm of Art History', a lecture series by YouTube channel 'The Philosopher's Meme', for an expansion on this comparison\[9\]. For something more concise and digestible, see (in Bibliography) this slideshow shared via a Reddit account. \[10\]`
- Line 86: `[^5]: Most academic theorists on memes have provided an account of memes that is at least as broad as Evnine's. But in providing a descriptive account, rather than a prescriptive definition, I consider it crucial to consider, above anything, the opinions of those most involved in meme-making and memographic practice. On analytical meme discussion pages such as the Facebook group _/tpmg/ - TPM Meme Research and Development_, the artifacts discussed fall into a narrow category that would not include the likes of _Planking_ or _\#scalebackabook_. Colloquially, too, the word is applied in the narrower sense, although it appears to be used more loosely by the general public than by those deeply involved in memographic practice and analysis. On a survey conducted via the anonymous university confession platform Bristruths, 78% of the 382 who responded believed that _Planking_ is not a meme but merely a trend, since a meme is something more specific.`
- Line 128: `[^6]: See Shifman and Milner`
- Line 152: `[^7]: E.g., <https://www.youtube.com/watch?v=SBI6uwUiGHE> \[16\]`

Footnote markers:

- Line 46: `The memes that Evnine uses for examples are relatively traditional in style[^1] , but the importance of memographic practice in the essence of memes has become increasingly apparent in recent years as the norms of format and style have been flouted. For example, there is the meme genre of 'cursed images', which are found photographs, often poor quality and flash-lit with subtly disturbing or mysterious content, taken out of their original context and collected in a memographic one. The subject matter tends to be one step away from the banal, such as a child surrounded by people in creepily inaccurate cartoon character costumes at a birthday party, or a photocopier covered in spaghetti, and they make the nauseated viewer wonder how the depicted situation came about. These narrow requirements make the collection of cursed images a respected discipline on Facebook pages and subreddits. But in terms of format, they are simply photos, unmanipulated; they have only become memes by being shared in this way. There are many similar examples of found memes which, like other found artworks, are memes only by virtue of being taken up into memographic practice.`
- Line 54: `In fact, many avant-garde memes pages today play on the fact that the memes<sub>I</sub> are so dependent on their context[^2]. The meme page or area of meme-subculture can serve as a gallery space in which pieces of media are granted memes<sub>I</sub> status, and in many cases the humour and affect are far better understood through the collection as a whole than through the individual memes<sub>I</sub>. For example, the Facebook pages ' 神は部屋を出ました' ('God Has Left the Room') and 'Pains of Hell Wellness Clinic'[^3] share surreal memes<sub>I</sub> that fit into an implied overarching narrative that we -- the viewers and the page creators -- are living in a quasi-supernatural schizophrenic hellscape. Some of these memes<sub>I</sub>, which would be fairly nonsensical to the uninformed viewer, contain highly distorted or pixelated images of demonic-looking faces with contrastingly banal or colloquial captions. Others are uncaptioned images, often with a 'cursed' aesthetic or relating to hell.`
- Line 68: `But other memes<sub>I</sub> on these pages challenge the norms further, such as a video on 'God Has Left the Room' depicting black dots moving haphazardly and trailing compression artefacts on a jarring glitch-like background (Figure 6), with a piercing high-pitched buzzing throughout. The content is devoid of concrete meaning, but the video's tone is somehow consistent with that of the other memes<sub>I</sub> on the page; perhaps there is an implicit invitation for the users to pretend, as characters in this dystopian digital plane, that we are witnessing ordinary media content or a representation of our daily reality. The video received many ironic heart-reacts and laughter-reacts as well as ironic comments such as 'Haha funny video'. Memes<sub>I</sub> such as this are a challenge to the viewer, daring one to accept them as memes<sub>I</sub>, much like early 20<sup>th</sup>-century Dadaist art challenged viewers to accept it as art.[^4] Such cases demonstrate that no particular form or content is necessary for a meme, but memographic practice -- the maker's memographic intention -- is necessary; it is as essential to a meme as a listener's auditory experience is to a musical work.`
- Line 84: `It is implicit in Evnine's definitions, and explicit in his paper as a whole, that his definition of memes is a relatively broad one. He has provided apt restrictions on the concept, requiring that a meme arise from memographic practice. He acknowledges that a meme<sub>CC</sub> cannot be reduced to any specific image or instance, but to an abstract object made up of a set of norms to which its instances adhere. However, Evnine acknowledges as memes cases that many people who are deeply engaged in memographic practice would dispute. For example, _Planking_, the trend in which a person extends herself in a rigid horizontal position in an unexpected place (e.g. across a public bannister) and uploads a photo of it online, is a meme<sub>CC</sub> for Evnine. So is _\#scalebackabook_, a hashtag associated with Twitter users writing imaginary book titles that are considered milder versions of real ones (e.g. Pride and Slight Bias instead of Pride and Prejudice). These examples would normally, from all my experience of discussing social media with those who are most engaged with it and gathering opinions online[^5], be considered mere online trends, not memes. Furthermore, Evnine theorises a scenario in which people develop a self-aware practice of handshaking in which each handshake is a riff on, development of or response to a previous one, and imagines that these handshakes could be considered memes. This raises the question of whether something must be online in order to be a meme, and also whether a joke or trend being online is sufficient for its status as a meme. A trend such as _\#scalebackabook_ resembles memes in that it is spread online, but one could imagine a similar trend occurring in a conversation between friends, in which case there is reason to doubt that even Evnine would consider it a meme. By allowing any comedic online trend to be called a meme<sub>CC</sub>, and simultaneously discounting digitality as a necessary condition, Evnine risks allowing all running jokes or trends -- even ones shared between friends in oral conversation -- to be memes, which could lead the definition to fall apart into a drastically broader concept like a Dawkinsian meme. I will explore in the section titled 'Other Central Properties of Memes' the issue of digitality and further hypothetical scenarios that highlight issues in defining a meme, but for now I will lay out some immediate problems that arise from Evnine's definitions.`
- Line 126: `It seems generally agreed among theorists[^6] that collectivism of some sort is a necessary part of meme-making. Giselinde Kuipers argues that 'Like the jokes and stories of oral culture, Internet jokes have no authors (unless everyone is an author)' \[13\]. Memes, unlike most art forms, have a detachment from personal gain or credit. For a meme to flourish, it is ideally not bound to any name; anyone should be able to take a meme<sub>I</sub> and, with simple editing, turn it into another. For this reason, watermarked memes<sub>I</sub> are criticised in meme-sharing communities; the sense of public ownership, and thereby quality, is compromised by the watermark. The factor of anonymity is one of the things that make _\#scalebackabook_ a borderline case -- or, in my opinion, not a case at all. When an individual writes her own words on Twitter,`
- Line 148: `There do not appear to be any online memes that do not use images and/or text. But seeing as memes span the media of text, photos, drawings and videos, no particular media format seems tied to the essence of memes. The use of images and/or text appears to be a practical limitation; memes would simply not be able to spread or be consumed and replicated as easily and anonymously if they existed in non-visual forms. There is an auditory trend in surreal, kitsch video memes of extreme bass boosting[^7]. In these videos, which often involve intentionally tasteless and incoherent graphics, the bass boost provides a level of distortion that makes the sound quality far enough from reality and everyday voice communication for the anonymity factor to be maintained. In theory, memes in this style could exist only in sound format. However, there would probably be less room for stylistic variation and evolution in purely auditory memes.`

### `src/content/articles/philosophy/a-school-of-internet-philosophy.md`

Status: `prose-links-only`

Inventory: markdown links: 1; raw URLs: 1

### `src/content/articles/philosophy/an-internet-koan.md`

Status: `prose-links-only`

Inventory: markdown links: 2; raw URLs: 2

### `src/content/articles/philosophy/how-to-digitally-coauthor-articles-in-philosophy-class.md`

Status: `manual-required`

Inventory: reference-section headings: 1; markdown links: 1; raw URLs: 1

Reference headings:

- Line 131: `## References`

### `src/content/articles/philosophy/postnaturalism.md`

Status: `manual-required`

Inventory: noncanonical footnote definitions: 33; noncanonical footnote markers: 35; reference-section headings: 1; markdown links: 17; archive links: 3; raw URLs: 17

Reference headings:

- Line 167: `## References`

Footnote definitions:

- Line 169: `[^1]: [https://www.nsf.gov/pubs/2007/nsf0728/nsf0728.pdf](https://www.nsf.gov/pubs/2007/nsf0728/nsf0728.pdf)`
- Line 171: `[^2]: [http://schwitzsplinters.blogspot.com/2009/06/alternatives-to-burning-armchair.html](http://schwitzsplinters.blogspot.com/2009/06/alternatives-to-burning-armchair.html) (archive: [http://archive.is/uEeR0](http://archive.is/uEeR0))`
- Line 173: `[^3]: [https://www.tandfonline.com/doi/abs/10.1080/09515089.2018.1512705](https://www.tandfonline.com/doi/abs/10.1080/09515089.2018.1512705)`
- Line 175: `[^4]: [https://ndpr.nd.edu/news/experimental-philosophy-rationalism-and-naturalism-rethinking-philosophical-method/](https://ndpr.nd.edu/news/experimental-philosophy-rationalism-and-naturalism-rethinking-philosophical-method/)`
- Line 177: `[^5]: [https://plato.stanford.edu/entries/reasoning-automated/](https://plato.stanford.edu/entries/reasoning-automated/)`
- Line 179: `[^6]: Bundy, A., 2011, "Automated theorem proving: a practical tool for the working mathematician?", Annals of Mathematics and Artificial Intelligence, 61 (1): 3–14.`
- Line 181: `[^7]: Matson, W. I. (1984). III. Metametaphilosophy. Inquiry, 27(1-4), 326–333. doi:10.1080/00201748408602042`
- Line 183: `[^8]: Clark, A., Chalmers, D. (1998). The extended mind. [https://www.jstor.org/stable/3328150](https://www.jstor.org/stable/3328150)`
- Line 185: `[^9]: Allen‐Collinson, J. Sporting embodiment: sports studies and the (continuing) promise of phenomenology [https://doi.org/10.1080/19398440903192340](https://doi.org/10.1080/19398440903192340)`
- Line 187: `[^10]: cf. Uidhir, C. The Epistemic Misuse & Abuse of Pictorial Caricature. American Philosophical Quarterly 50 (2):137-152 (2013)`
- Line 189: `[^11]: Consigny, S. (1994). Nietzsche’s reading of the sophists. Rhetoric Review, Vol. 13, No. 1.`
- Line 191: `[^12]: Mann, J. E. (2003). Nietzsche’s Interest and Enthusiasm for the Greek Sophists. Nietzsche-Studien, 32(1). doi:10.1515/9783110179200.406`
- Line 193: `[^13]: Schiller, F. C. S. (Ferdinand Canning Scott). (1908). Plato or Protagoras?: Being a critical examination of the Protagoras speech in the Theætetus with some remarks upon error. Oxford: B. H. Blackwell.`
- Line 195: `[^14]: Plato. Republic, Book IX.`
- Line 197: `[^15]: Tipton, Jason A. (2014). Philosophical Biology in Aristotle’s Parts of Animals, p. 50.`
- Line 199: `[^16]: Cummins, R. (2010). Neo-Teleology. Philosophy of Biology: An Anthology. Rosenberg, A., Arp, R. (eds.)`
- Line 201: `[^17]: [https://link.springer.com/article/10.1007/s10739-006-9118-0](https://link.springer.com/article/10.1007/s10739-006-9118-0)`
- Line 203: `[^18]: Tipton, Jason A. (2014). Philosophical Biology in Aristotle’s Parts of Animals, p. 62.`
- Line 205: `[^19]: Plato, Republic, Book I.`
- Line 207: `[^20]: Steinberger, P. (1996). Who is Cephalus? Political Theory, Vol. 24, No. 2 (May, 1996), pp. 172-199`
- Line 209: `[^21]: [https://plato.stanford.edu/entries/mohism](https://plato.stanford.edu/entries/mohism)`
- Line 211: `[^22]: Hintikka, J. (1998). What is abduction? The fundamental problem of contemporary epistemology. Transactions of the Charles S. Peirce Society, 34, 503–533 (Reprinted in Hintikka, 2007, Ch. 2, with additions).`
- Line 213: `[^23]: Pages 93–95. Haack, S. (1998). Manifesto of a Passionate Moderate.`
- Line 215: `[^24]: [https://plato.stanford.edu/entries/dewey-political/#DemoIdeaReal](https://plato.stanford.edu/entries/dewey-political/#DemoIdeaReal)`
- Line 217: `[^25]: [https://www.iep.utm.edu/rorty/](https://www.iep.utm.edu/rorty/)`
- Line 219: `[^26]: [https://plato.stanford.edu/entries/deleuze/](https://plato.stanford.edu/entries/deleuze/)`
- Line 221: `[^27]: Rorty, R. (1989). Contingency, Irony, and Solidarity. p. 78.`
- Line 223: `[^28]: Berry, D. (2011) The computational turn: thinking about the digital humanities. Culture Machine. Vol. 12.`
- Line 225: `[^29]: [http://codev2.cc/](http://codev2.cc/)`
- Line 227: `[^30]: [http://www.ietf.org/tao.html](http://www.ietf.org/tao.html)`
- Line 229: `[^31]: Page 154. Heilbron, J. (1990). Auguste Comte and Modern Epistemology. Sociological Theory, 8(2), 153. doi:10.2307/202202`
- Line 231: `[^32]: [https://writings.stephenwolfram.com/2012/05/its-been-10-years-whats-happened-with-a-new-kind-of-science/](https://writings.stephenwolfram.com/2012/05/its-been-10-years-whats-happened-with-a-new-kind-of-science/)`
- Line 233: `[^33]: [https://link.springer.com/chapter/10.1007/978-3-642-30870-3_35](https://link.springer.com/chapter/10.1007/978-3-642-30870-3_35)`

Footnote markers:

- Line 17: `In 2007, National Science Foundation called for what was nothing short of an industrial revolution for education. This "Cyberinfrastructure Vision for 21st Century Discovery" [^1] is being realised all around us: the online is the dominant operating mode for most students, and pervasive cyberinfrastructures have indeed extended our awareness of the physical and social environment. Philosophers are still fighting over armchairs [^2][^3][^4].`
- Line 21: `Automated reasoning has developed to the point of surpassing human researchers at certain tasks and has been adopted by a significant number of specialised researchers including philosophers as well as mathematicians. It has not yet been widely accepted by mathematicians partly due to scepticism about bugs, the length and excess of detail of automated proofs, and the fact that mathematics is an enjoyable activity that mathematicians are hesitant to automate away [^5]. Bugs can be minimised, independent verification can be provided, and "as important theorems requiring larger and larger proofs emerge, mathematics faces a dilemma: either these theorems must be ignored or computers must be used to assist with their proofs."[^6]`
- Line 25: `For all the tradition of methodological naturalism and the availability of digital technologies that philosophers already make use of in everyday life, philosophers outside of logic are peculiarly neglectful about the concept of digital methods in philosophical research. This is probably due to a different kind of scepticism than those of mathematicians regarding automated reasoning. The most obvious formulation of this criticism is that philosophers love the armchair too much, favouring a priori knowledge over a posteriori knowledge. This disregard for a posteriori knowledge, the criticism suggests, is the cause of their "metametaphilosophical" reluctance to take on an impure or eclectic methodology that takes advantage of both reason and technology. "And why do philosophers think they have to start from scratch?"[^7]`
- Line 41: `This challenge is available to every philosopher. All philosophers already deal with it in an informal capacity in their decisions about how to organise their digital "extended mind" [^8]. On the face of it, philosophers behave as though they agree that we should digitise philosophy in order to improve philosophical productivity. This behaviouralist interpretation of their beliefs is unsound as a statement about the actual beliefs of the philosophers, in light of the popular resentment towards the negative effects of technology on contemplative and deep thought. This is not an issue, because I am not addressing a normative dimension here.`
- Line 51: `The right conceptual frameworks improve the effectiveness of a tool that is paired with them. Philosophers will make better use of existing and novel digital methods if they also adopt a metametaphilosophical position that takes a methodology-first view of metaphilosophy, epistemically prioritising the tools that they use over particular frameworks that they are operating under. What I mean by this is that philosophers should take on whichever conceptual framework is best suited for the use of a particular tool, rather than universally applying their epistemology in disparate contexts. An analogy is that of a 21st century physics student lifting a barbell over their head. They would be forgiven for using a Newtonian framework while calculating the amount of weight to add to the barbell before beginning the exercise, and for using phenomenological[^9] cues during the exercise about the prioperceptive position of their chest in relation to their chin that does not agree with the true physical coordinates of their body parts, and so on. They would probably hurt themselves if they tried to apply the same framework to their physical exercise as their physics exercises.`
- Line 57: `This is an empirically verifiable hypothesis for which I have no data. Instead, I present a caricature of three classical philosophers in order to make an indirect argument based on the apparent causal links between postnaturalism, rough analogical equivalents for digital methods, and philosophical productivity. Although caricatures are generally epistemically defective[^10], they can be illuminating in the correct contexts, as I have shown in the exercising physicist example above.`
- Line 61: `The Sophists were variously "rehabilitated" by Hegel, Grote, and Nietzsche[^11][^12]. Schiller also attempted a similar rehabilitation for the purposes of integrating Protagoras into his pragmatic ("Humanist") philosophy[^13]. In the same way that the pioneers of new philosophical lineages recruited the Sophists, I will recruit Plato, Aristotle, and Mozi as the ancestors of postnaturalism.`
- Line 65: `In _Republic_, Plato introduces the most influential definition of philosophy in history. He characterises philosophy as a special kind of science, concerned with absolute truths, to which the philosopher holds exclusive access using reason as his instrument[^14]. _The Republic_ itself serves as a detailed example of what Plato’s philosophical method consists of: a synthesis of Socrates’ dialectic and the technique of dichotomous division, heavily borrowed from geometry, based on Plato’s metaphysics which justifies an epistemology based on representational accuracy about an ideal world of pure truth. By dividing knowledge into the contingent and the absolute in this way, Plato established the antinaturalist programme in philosophy.`
- Line 71: `The same is also evident in Aristotle’s zoology, which is driven first and foremost by his application of the same binary technology as Plato to the spectra of contingent entities. According to Plato, each physical entity has many traits, such as being a certain shape or having a certain number of legs, which makes them contingent unlike absolute entities, which are only one thing respectively and not others. Only absolute entities vary from one another as a matter of perfect dichotomy, since they each possess only one trait which they themselves represent, by casting a shadow onto the contingent world. It follows therefore that contingent entities differ from other contingent entities by virtue of possessing multiple divergent traits, and together exist on spectra of differences and similarities[^15].`
- Line 75: `Aristotle developed countless other tools, namely his logic, which he applied across the board to the rest of his philosophical research. His logic was so powerful and effective a technology that it was not displaced until the beginning of analytic philosophy with Frege, Russell and Peirce. Teleology, although largely eliminated from the sciences, remains popular in both colloquial and conceptual use by biologists and philosophers of biology. Teleological explanations are favoured by a substantial number of philosophers of biology to capture the idea of natural selection as a process of design without a designer, particularly in adaptationist characterisations of traits[^16].`
- Line 77: `At the same time, he notes the consistent failure of Aristotle to ever fully grasp at other contemporary insights, the clear evidence for which were painstakingly observed and detailed by Aristotle himself. As a matter of pure speculation, it seems entirely possible that Aristotle could have developed an evolutionary account of biology had he held a pluralistic, relativistic or naturalistic view of the function of philosophy as did some of his rivals. As Darwin notes in the preface to _The Origin of Species_ (inserted some time after the publication of the first edition [^17]) "the principle of natural selection shadowed forth" already in Aristotle. Aristotle was aware of the issues arising with domestication, an art performed by the city. Aristotle recognises the issue of artificial selection through his consideration of the dichotomy between dogs and wild dogs, and even suggests that there can be wild or tame human beings[^18]. Given that Darwin himself begins _Origin_ with a discussion of selective breeding, it is plausible that Aristotle could have developed a theory of natural selection millennia in advance had he modified his metaphilosophy according to the domain of his study.`
- Line 79: `Mozi, or at least the writings of the anonymous Mohist authors attributed to Mozi, shares some similarities with Plato in his ethics. The main competitor to Mozi and the Mohists were the Confucians. Mozi was critical of the Confucian preoccupation with the correct rites and virtue as the foundation of ethics. In this regard, Confucius is most closely aligned with Cephalus of the _Republic_, who defines justice as making offerings to the gods and repaying one’s debts [^19]. Cephalus represents the man who is guided not by a morality based on moral facts but the appropriate rites and the cultivation of private virtue, referred to as _li_ and _ren_ respectively by Confucius. For Plato, Cephalus’ definition of justice poses the problem of an ethical outlook destined for eventual corruption, a criticism that Plato levies against democracy in general[^20]. His response is to substitute rituals and virtue with objective morality. The Mohists likewise respond to Confucius with moral objectivism[^21].`
- Line 81: `Although Plato responds to the ritual and virtue ethics of Cephalus in the same way as Mozi does to Confucius, Plato fails to cleanly repudiate Thrasymachus, who argues that morality is simply the interest of the victor. Thrasymachus’ radical reductionism about justice as synonymous with interest renders the two thinkers incommensurate, and leaves the discussion in deadlock[^20]. On the other hand, Mozi and the Mohists operated during a period of incessant war as stronger states waged invasive warfare on weaker states. The worst consequences of the Thrasymachian immoralism was already a fact of life to Mozi, and this forced him to opt for an alternative metaphilosophy which prioritised technological development over moral epistemology. Namely, Mozi attempted to make offensive warfare impossible.`
- Line 85: `Unfortunately, Confucianism won out over Mohism in China as the preferred ideology of the ruling classes. As an ideological framework used to justify rigid hierarchies and absolutism, Confucianism was far more useful to the rulers than the protosocialism that Mohism offered. Considering that the majority of the Mohists’ efforts were concentrated on practical matters, their success in the theoretical spheres is impressive enough as a favourable example of postnaturalist tendencies. Confucians adopted a considerable number of Mohist ideas, and the two groups were considered on equal footing as theorists in their time. Mozi’s egalitarian epistemology, which did not privilege a priori knowledge over a posteriori knowledge, included abductive reasoning and social knowledge[^21].`
- Line 91: `"The fundamental problem of contemporary epistemology", according to Hintikka, is abduction[^22]. He was writing in 1998, during when the aftermath of the so-called _linguistic turn_ and the (then ongoing) Science Wars saw scientific realists feud against poststructuralists; the classical pragmatists against the neopragmatists; and the absolutists against the relativists. A common caricature of the era, approximately between the 90s and 2000s, goes as follows:`
- Line 92: `Both deduction and induction were placed at the centre of unprecedented controversy and scepticism, as poststructuralists launched an attack on positivism and structuralism. The attack addressed both academic and applied scientism. The social and political impact of metaphysics and epistemology was therefore apparent to both the participants within the humanities as well as those within the sciences. Philosophy of science eventually became so polarised, and so reliably controversial, that every pundit and activist took it upon themselves to adopt one partisan position or another. They did so often for the express purpose of weaponising disagreement and controversy rather than as the consequence of deliberation. Terms such as _positivistic_, _relativistic_, _rationalistic_, all became slurs, shibboleths and dogmatic emblems depending on the camp one pledged allegiance to. The only choice that was left afterwards is between joining the scientismic _Old Deferentialists_ or the relativistic _New Cynics_ (Haack’s coinage) [^23]. This is not because other positions have been discredited, but because territorial conflict supplanted constructive philosophical dialogues.`
- Line 98: `This is not cause for cyberoptimism or a purely technological solution. The visible results of the digitally mediated, participatory philosophy are underwhelming. In fact, the Internet as the primary site of philosophical engagement has led to the siloing and proliferation of purportedly incommensurate worldviews, amplified the narcissism of small differences to the point where bikeshedding and splintering have become staple components in the life cycle of communities. The typical structure of self-organising digital communities are reminiscent of Plato’s criticism of the Sophists peddling lessons in rhetoric as wisdom, and of the naive democratic citizens who support them. Lippmann’s criticism of democracy as founded on an illusion of an "omnicompetent" citizenry, as well as Dewey’s response that the experts are themselves biased and must be kept in check, both ring true[^24].`
- Line 112: `In other words, a postnaturalist is at face value indistinguishable from any other philosopher when they philosophise. This is a problem common to a reflexive, sociological vision of metaphilosophies. Whereas Rorty’s ironism[^25] and Deleuze’s deterritorialisation[^26] can be described and used distinctively, their practitioners may not be recognisable as philosophers[^27].`
- Line 116: `Digital methods could make postnaturalism efficient enough to be useful. Berry[^28] characterises digital humanities as consisting of the first wave, in which the requisite infrastructures were constructed; the second wave, in which the "notional limits" of the humanities were correspondingly expanded to include born-digital materials; the tentative third wave, in which the focus of digital humanities shifts from the "humanities" to the "digital", "thinking about how medial changes produce epistemic changes."`
- Line 118: `One promise of philosophising digitally is that there is already a shared technological foundation. As Lessig says, code is law[^29]. As much as this law can exert hierarchical, antidemocratic control over users, it has the potential to provide a de facto metalanguage for a "rough consensus and running code"[^30] approach to participatory philosophy. When people philosophise online, the raw data of their interactions are collected and analysed. Unfortunately, most of it gets fed into advertisement algorithms.`
- Line 120: `Digital methods from digital humanities could be used to automate the reflexive analysis that has been the work of a minority of radical philosophers in the past. This automated reflexive analysis, based on information like emergent patterns in a philosopher’s arguments based on metadata, can provide the foundations for a positive postnaturalist programme. The resulting positive programme would resemble Haack’s crossword puzzle[^31]. Foundations would come in the form of shared technologies, and coherence would guide the process of collective inquiry.`
- Line 124: `Stephen Wolfram argues that the universe comprises of simple rules whose equivalents appear repetitively[^32]. For instance, the growth pattern of slime moulds can solve problems about using the lowest amount of energy to get from one point to another through a continuous network of cells[^33]. Postnaturalist digital methods will make entire worlds accessible to philosophers as a source of useful knowledge, and reduce waste by making each exchange count for more. Philosophical incommensurability would no longer be an issue. In effect, we would be creating an automatic translation engine for philosophies.`

### `src/content/articles/politics/a-tale-of-two-healthcare-narratives.md`

Status: `prose-links-only`

Inventory: markdown links: 3; archive links: 2; raw URLs: 3

### `src/content/articles/politics/joshua-citarella-astroturfing.md`

Status: `prose-links-only`

Inventory: markdown links: 3; raw URLs: 2

### `src/content/articles/politics/on-circlejerk-part-1.md`

Status: `clean`

Inventory: No reference-like content detected.

### `src/content/articles/politics/on-vectoralism-and-the-meme-alliance.mdx`

Status: `prose-links-only`

Inventory: markdown links: 24; raw URLs: 24

### `src/content/articles/politics/president-parks-corruption-cult.md`

Status: `prose-links-only`

Inventory: markdown links: 1; raw URLs: 1

### `src/content/articles/politics/see-the-problem.md`

Status: `clean`

Inventory: No reference-like content detected.

### `src/content/articles/politics/social-media-freedom.mdx`

Status: `prose-links-only`

Inventory: markdown links: 30; raw URLs: 30

### `src/content/articles/politics/the-post-pepe-manifesto.md`

Status: `clean`

Inventory: No reference-like content detected.

### `src/content/articles/politics/the-structure-of-hyperspatial-politics.md`

Status: `prose-links-only`

Inventory: markdown links: 15; archive links: 2; raw URLs: 16
