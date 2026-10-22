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

## Work pages (plan, 22 Oct 2026)

Research: stacked full-screen project panels are the common pattern on strong portfolio sites (each new one slides
over the last, which steps back); React 19.3's `<ViewTransition>` gives shared-element morphs between pages in the App
Router with no setup; Apple keeps the picture full screen with the words over it, then pulls back.

- **/v2/work** (components/v2/WorkIndex.tsx, lib/work-reel.ts wallEntries, changed 22 Oct on Shivam's word): "My Work"
  on the deep green with the lime loop line (it fades where it meets the words) over a wall of the work, drifting
  slowly to the right under the green. Scrolling (a long, calm hand-over) the title and line leave, the green turns to
  the paper and the wall comes forward: three rows of pictures at one height, **each at its own uploaded shape**
  (landscape stays landscape, 4:5 stays 4:5, tall stays tall: never cropped into another shape). Every row holds all
  the work in its own order and runs on endlessly (moved by a transform that wraps at the row's set width), staggered
  like bricks; drag, swipe, trackpad or the centred arrows move it with a little glide. On the main page
  a category with more than five projects (photography) is one tile that opens its own page; small ones show each
  project. Under the wall the filters, centred; they stick while the pictures scroll and pop to the front. Then every
  picture, as pictures only (no project cards, which would repeat the wall).
- **Scrolling (V2 only, components/SmoothScroll.tsx):** a softer glide and less movement per wheel step, so held
  scenes can't be skipped; a new page starts in place instead of gliding from the last page's position.
- **Viewer:** the small copy shows at once and the full picture fades in over it; the next pictures load ahead;
  thumbnails use the small copies.
- **Project pages**: the panel's picture morphs into the page's opening picture (`ViewTransition name="work-<slug>"`),
  which pulls back into a frame; the facts in the Apple style; the gallery; the next project full screen to step into.
- **Live sites in the site** (components/v2/LiveSite.tsx): a project link with `embed: true` opens in a Shivo Labs frame
  with a back button (Esc and the phone's back close it); otherwise in a new tab. Two things must allow it first:
  the project's own site must allow shivolabs.com to show it (`frame-ancestors https://shivolabs.com`), and its address
  must be added to `EMBED_ORIGINS` in lib/headers.ts. The Task Management site currently refuses (frame-ancestors 'none').

## Products page (22 Oct 2026)

/v2/products is one held scene (components/v2/ProductsScene.tsx, app/v2/styles/products.css), changed 22 Oct on
Shivam's word: the title and the loop line on the deep green; they leave and the paper rises over the green (no colour
fade); the logo builds itself, its six tiles coming in large from across the screen and locking together near the top,
SHIVO LABS with PRODUCTS beneath, and "All Shivo Labs Apps in One Place" with the devices. Scrolling on, only the small
word under the logo and the centred block beneath change: HUB, then each app (its number, its name, what it does,
where it runs). Soft lines run behind on the paper and fade where they meet the words. The same words are in a plain
list for screen readers, search and "reduce motion". Words come from content/products.json as before.

## Services and Journal (22 Oct 2026)

- **Services** (components/v2/ServicesPanels.tsx, app/v2/styles/services.css): the title on the green with the loop
  line, then the four services as tall panels over a picture of their work (`picture` in lib/services.ts); one is open
  at a time (pointer, tap or keyboard) with its words, what you get and Read more. Phones: stacked, tap to open.
- **Products** now loop on their own under the centred logo (arrows, dots that fill with the time left, rests under the
  pointer, swipe on phones); scrolling only brings them in.
- **Journal** (components/v2/JournalIndex.tsx, Article.tsx, app/v2/styles/journal.css): reading first. The list: the
  green opening, the newest post as a cover, the rest in rows, filters for language and topic. A post: the title on the
  green, then one steady column (about 66 characters a line) with "In this article" beside it on wide screens (marks
  the section being read; on phones it opens from a button), a text-size control remembered in the browser, headings
  and quotes rising in once, a progress line along the top, then the other language and newer / older / all posts.
  Section headings get ids in lib/journal.ts (`toc`).

- **Contact** (app/v2/contact, components/v2/ContactPage.tsx, app/v2/styles/contact.css): its own full page in V2
  (V1 keeps it on the home page; the V1/V2 switch sends /v2/contact to /#contact). Topics prefill the WhatsApp
  message and the email subject; the Call tile shows the time in Dar es Salaam. Contact and Start a project link here.
