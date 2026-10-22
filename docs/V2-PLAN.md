# Version 2 of the site (green redesign)

Branch `claude/redesign-v2`. Started 21 Oct 2026. Nothing here is live until it is merged and deployed.

## What it is

A second look for the whole site, built next to the current one so both can be compared, and the old one deleted
later in one step. Same words, links, images and logo; new layout, colours, type and motion.

- **Switch:** a small V1 / V2 pill in the bottom-right corner of every page (`components/VersionSwitch.tsx`,
  shown from `app/layout.tsx`). It opens the same page in the other version: `/about` ↔ `/v2/about`.
- **Where V2 lives:** everything is under its own names, nothing of V1 is changed:
  - pages: `app/v2/**` (one folder per page, same addresses as V1 with `/v2` in front)
  - parts: `components/v2/**`
  - look: `app/v2/v2.css` (every class starts with `v2-`)
  - links: `lib/v2.ts` (`v2('/work')` → `/v2/work`)
- **Search engines:** V2 pages say `noindex` until V2 becomes the site.
- **Words and data:** shared with V1 (`lib/content.ts`, `lib/work.ts`, `lib/services.ts`, `content/products.json`,
  `content/journal`). Change them once, both versions follow.

## Status (22 Oct 2026)

Built: home, about, work (all categories, collections, viewer), project pages, products, services (+ Kiswahili),
FAQ (+ Kiswahili), journal and posts. Checked in a desktop browser at 1440 × 900 and 1280 × 720, tablet both ways,
and phone sizes 390 × 844 and 375 × 667 (headless Chrome). Not yet checked on a real iPhone or Android.

Still to do: generated images and videos for the hero and sections; a V2 not-found page; the logo animation itself
(kept from V1 on purpose for now).

## Make V2 the site (later)

1. Delete V1: `components/` except `components/v2`, `ImageGuard.tsx`, `Analytics.tsx`, `SmoothScroll.tsx`,
   `VersionSwitch.tsx`; V1 pages in `app/` (keep `api/`, `sitemap.ts`, `robots.ts`, `llms.txt`, icons); V1 CSS.
2. Move `app/v2/*` up to `app/`, set `v2()` in `lib/v2.ts` to return the path unchanged, drop `noindex`.
   `lib/work-data.ts` imports its `Cat` type from V1's `components/WorkBrowser.tsx`: point it at
   `components/v2/WorkBrowser.tsx` (same shape).
3. Remove the switch.

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
- **Section labels:** a number in italic, the name in small capitals and a fine rule to the edge (components/v2/Ui.tsx),
  in place of the dark pills.
- **Moving lines (ribbons):** components/v2/Ribbons.tsx holds every set: the hero (lime on lime), page tops, the AI card,
  and the eight About highlights, each moving its own way (run, breathe, draw, sway, beads).
- **Shapes:** rounded cards, leaves, a sun burst, loop lines; the four-petal pattern only in the footer and menu, faintly.
- **Motion:** the About text fills in word by word as you read; What I do is an index whose photo follows the pointer;
  filter tabs have a gliding marker; arrows slide out and back in on hover. Everything stops for "reduce motion".

## Pages

| Page | V2 idea |
|---|---|
| Home hero | One full lime screen: the logo intro (unchanged) in the middle, lime-on-lime ribbons and a fine green line moving behind it, a quiet bottom row (services, scroll, local time). The next section rises over it. No avatar. |
| Home | About in big condensed type with words in pills → what we do (coloured cards) → work rail → products bento → logos → contact card → hills footer. |
| About | Coloured intro, number tiles, discipline cards with photos, highlights grid, logos, experience on a loop-line timeline, contact. |
| Work | Big title, category and collection pills, rounded photo grid, screens in frames, a full-screen viewer. Project pages with detail pills and next / previous cards. |
| Products, Services, FAQ, Journal | One page kit: coloured hero band with pill crumbs, cards, accordion, reading layout, the contact card. Kiswahili pages too. |

## Checks before showing

Desktop 1440 × 900, laptop 1280 × 720, tablet 768, phone 375 (and 390 × 844): spacing, alignment, sizes, no
sideways scroll, reduce motion, keyboard focus. Not tested on a real iPhone unless said.
