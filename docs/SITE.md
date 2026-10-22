# The site (green design)

Started 21 Oct 2026 as a second version next to the old site, tried out under `/v2`; it became the whole site on
22 Oct 2026 and the old version was deleted. Old `/v2/...` links redirect to the same page (`lib/redirects.ts`,
`next.config.ts`).

## Where it lives

- pages: `app/(site)/**` (a route group: the folder name is not in the address); `/insights` stays outside it
- parts: `components/site/**`
- look: `app/(site)/styles/*.css`, loaded by `app/(site)/layout.tsx` (every class starts with `v2-`, kept from the trial)
- words and data: `lib/content.ts`, `lib/work.ts`, `lib/services.ts`, `content/products.json`, `content/journal`

Still to do: generated images and videos for the hero and sections; a not-found page. Not yet checked on a real iPhone
or Android.

## Scroll pace (22 Oct 2026)

Every held scene moves at the same pace (`lib/motion.ts`, `PACE`). A scene is as tall as its timeline, so one unit
of animation always takes half a screen of scrolling (`screensPerUnit: 0.5`), plus a short rest at the end where
nothing moves. Every scrubbed animation trails the scroll by the same 0.8 s (`scrub`). Smooth scrolling
(`components/SmoothScroll.tsx`, Lenis) glides with `lerp 0.075` and moves 0.85 of a normal wheel step, so held
scenes can't be skipped. Measured on every page in headless Chrome: a typical change takes 0.4 to 0.7 of a screen
everywhere (before: 0.2 on the home opening, up to 1.5 elsewhere). To make the whole site faster or slower, change
`screensPerUnit` only.

## The look

Taken from the reference boards (nature museum cards, Taioba box, Mercado Natú, Foodie cards, Verdure posters,
loop-line tiles, "Together" values, ribbon video, Veggies kit): nature, green, community, playful, alive.

| Token | Value | Use |
|---|---|---|
| Forest | `#0A2E20` | deep sections, text on light |
| Pine | `#11533A` | cards, second deep tone |
| Leaf | `#22A35A` | accents, links on light |
| Lime | `#C8F169` | buttons, highlights, loop lines |
| Paper | `#F3F0E4` | light sections |
| Mint | `#E3F2DA` | soft cards |
| Teal | `#14A394` | ribbons, AI |
| Sun | `#F5B82E` | stickers, warmth |
| Clay | `#EE6B33` | small pops |
| Sky | `#7C8CF4` | the surprise colour (nature museum blue) |

- **Type (round 2, 22 Oct):** Fraunces (an organic editorial serif) for headlines, leads and reading, with italic green
  words for emphasis; Instrument Sans for the interface; Archivo condensed capitals only for the contact poster;
  Caveat for the one hand-written pill in About. The logo keeps Sora and stays exactly as it is.
- **Section labels:** a number in italic, the name in small capitals and a fine rule to the edge (components/site/Ui.tsx),
  in place of the dark pills.
- **Moving lines (ribbons):** components/site/Ribbons.tsx holds every set: the hero (lime on lime), page tops, the AI card,
  and the eight About highlights, each moving its own way (run, breathe, draw, sway, beads).
- **Shapes:** rounded cards, leaves, a sun burst, loop lines; the four-petal pattern only in the footer and menu, faintly.
- **Motion:** the About text fills in word by word as you read; What I do is an index whose photo follows the pointer;
  filter tabs have a gliding marker; arrows slide out and back in on hover. Everything stops for "reduce motion".

## Pages

| Page | Idea |
|---|---|
| Home hero | One full lime screen: the logo intro (unchanged) in the middle, lime-on-lime ribbons and a fine green line moving behind it, a quiet bottom row (services, scroll, local time). The next section rises over it. No avatar. |
| Home | About in big condensed type with words in pills → what we do (coloured cards) → work rail → products bento → logos → contact card → hills footer. |
| About | Coloured intro, number tiles, discipline cards with photos, highlights grid, logos, experience on a loop-line timeline, contact. |
| Work | Big title, category and collection pills, rounded photo grid, screens in frames, a full-screen viewer. Project pages with detail pills and next / previous cards. |
| Products, Services, FAQ, Journal | One page kit: coloured hero band with pill crumbs, cards, accordion, reading layout, the contact card. Kiswahili pages too. |

## Checks before showing

Desktop 1440 × 900, laptop 1280 × 720, tablet 768, phone 375 (and 390 × 844): spacing, alignment, sizes, no
sideways scroll, reduce motion, keyboard focus. Not tested on a real iPhone unless said.

## Work pages (plan, 22 Oct 2026)

Research: stacked full-screen project panels are the common pattern on strong portfolio sites (each new one slides
over the last, which steps back); React 19.3's `<ViewTransition>` gives shared-element morphs between pages in the App
Router with no setup; Apple keeps the picture full screen with the words over it, then pulls back.

- **/work** (components/site/WorkIndex.tsx, lib/work-reel.ts wallEntries, changed 22 Oct on Shivam's word): "My Work"
  on the deep green with the lime loop line (it fades where it meets the words) over a wall of the work, drifting
  slowly to the right under the green. Scrolling (a long, calm hand-over) the title and line leave, the green turns to
  the paper and the wall comes forward: three rows of pictures at one height, **each at its own uploaded shape**
  (landscape stays landscape, 4:5 stays 4:5, tall stays tall: never cropped into another shape). Every row holds all
  the work in its own order and runs on endlessly (moved by a transform that wraps at the row's set width), staggered
  like bricks; drag, swipe, trackpad or the centred arrows move it with a little glide. On the main page
  a category with more than five projects (photography) is one tile that opens its own page; small ones show each
  project. Under the wall the filters, centred; they stick while the pictures scroll and pop to the front. Then every
  picture, as pictures only (no project cards, which would repeat the wall).
- **Viewer:** the small copy shows at once and the full picture fades in over it; the next pictures load ahead;
  thumbnails use the small copies.
- **Project pages**: the panel's picture morphs into the page's opening picture (`ViewTransition name="work-<slug>"`),
  which pulls back into a frame; the facts in the Apple style; the gallery; the next project full screen to step into.
- **Live sites in the site** (components/site/LiveSite.tsx): a project link with `embed: true` opens in a Shivo Labs frame
  with a back button (Esc and the phone's back close it); otherwise in a new tab. Two things must allow it first:
  the project's own site must allow shivolabs.com to show it (`frame-ancestors https://shivolabs.com`), and its address
  must be added to `EMBED_ORIGINS` in lib/headers.ts. The Task Management site currently refuses (frame-ancestors 'none').

## About: products and services (23 Oct 2026, on Shivam's word)

The Products and Services pages are gone; both are part of About now (/products and /services redirect to
/about#products and /about#services). About runs: hello → the belief and the figures → highlights (cards) → the
products → the services → contact.

- **Products** (components/site/ProductsScene.tsx, products.css): one held green screen. SHIVO LABS on top; the word
  under it starts as PRODUCTS and turns into each product's name as you scroll (one at a time, never two at once),
  with what it does, the description and Works on beneath, all at the one description size. Names and words come from
  content/products.json (X Tools is listed as iPhone App Signing).
- **Services** (components/site/ServicesPanels.tsx, services.css): the title card on the green, then each service in
  plain words (name, what it is, Read more), no picture cards; then where we work. The Kiswahili page /sw/huduma uses
  the same block.

## Colours, descriptions, footer (23 Oct 2026)

- The deep sections use a softer green (`--forest: #2B6444`), so the lime lines still show; the old deep green is
  `--forest-ink`, for text on light and lime.
- Every main description on the site is one size: `--fs-lead` in base.css.
- The footer is the same on every page, compact, and nothing in it moves; it no longer slides over the contact screen.
- The work wall gives each piece of work one row only; a row loops only when it is wider than the screen by a tile,
  otherwise it stays still in the middle, so the same picture is never on screen twice.

## Journal (22 Oct 2026)

- **Journal** (components/site/JournalIndex.tsx, Article.tsx, app/(site)/styles/journal.css): reading first. The list: the
  green opening, the newest post as a cover, the rest in rows, filters for language and topic. A post: the title on the
  green, then one steady column (about 66 characters a line) with "In this article" beside it on wide screens (marks
  the section being read; on phones it opens from a button), a text-size control remembered in the browser, headings
  and quotes rising in once, a progress line along the top, then the other language and newer / older / all posts.
  Section headings get ids in lib/journal.ts (`toc`).

- **Contact** (app/(site)/contact, components/site/ContactPage.tsx, app/(site)/styles/contact.css): its own full page. Topics prefill the WhatsApp
  message and the email subject; the Call tile shows the time in Dar es Salaam. Contact and Start a project link here.
