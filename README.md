# Shivam Parmar — portfolio

Built with **Next.js** (React), **GSAP** for motion, **Three.js** (via React Three Fiber) for 3D,
**Lenis** for smooth scrolling, and TypeScript. It runs on **Cloudflare Workers** at https://shivolabs.com (Shivo Labs account), built with the OpenNext adapter:
`npm run cf:deploy` builds it and sends it live. See "Hosting on Cloudflare" below.

## Run it locally

```
git clone https://github.com/shivaaam27/shivamparmar.git
cd shivamparmar
npm run setup      # installs packages, creates .env.local
npm run dev        # http://localhost:3210
```

Moving between your computer and the cloud: see [docs/LOCAL-AND-CLOUD.md](docs/LOCAL-AND-CLOUD.md).

## Where things live

```
lib/content.ts        ← text, links and image paths. Edit this to change content.
lib/work.ts           ← all work: Category → Sub-category → Project → images.
public/               ← put photos here (e.g. public/hero.jpg → '/hero.jpg' in content.ts)
app/globals.css       design system: colours, fonts, spacing (tokens at the top)
app/layout.tsx        fonts (self-hosted via next/font) + page shell
app/page.tsx          section order: Hero → About → Work → Contact → Footer
components/Hero.tsx   jumble → SHIVAM intro (GSAP timeline)
components/Effects.tsx scroll reveals + label decoding (GSAP ScrollTrigger)
components/HeroAtmosphere.tsx  Three.js warm light behind the hero (shader; follows the pointer)
components/SmoothScroll.tsx    Lenis smooth scroll, synced to GSAP ScrollTrigger
components/Work.tsx   work strips, category / sub-category filter (kept in the URL)
app/work/[slug]/      one page per project that has images
lib/motion.ts         shared GSAP setup and the scramble helper
```

## Version 2 (green redesign, being compared)

A second look for the whole site lives at `/v2` (`app/v2`, `components/v2`, `app/v2/styles`), with a V1 / V2 switch
in the corner of every page. Same words and images, new design. How it is built, and how to make it the site and
delete V1 later: [docs/V2-PLAN.md](docs/V2-PLAN.md).

## The system

| Token   | Value                                        | From the reference                              |
|---------|----------------------------------------------|-------------------------------------------------|
| Paper   | `#EEEAE3` + fine grain overlay               | VOIR: warm off-white "paper" surface            |
| Ink     | `#151412`                                    | All: near-black instead of pure black           |
| Accent  | taupe `#756452` (text) / `#BDB1A2` (marks)   | VOIR: the `■ ABOUT` tag and "Founded in…" line  |
| Display | **Instrument Serif**, often uppercase         | VOIR: condensed, French editorial serif         |
| Reading | **Inter Tight**, lead text ~18–22px           | VOIR description paragraph, sized up on purpose |
| Labels  | **IBM Plex Mono**, uppercase                 | Rowan: "LOS ANGELES BASED" and the bottom row   |

- **Big and small, with little in between.** Headlines are very large, body text is comfortable to
  read, and labels are small mono. Nothing is tiny.
- **Space does the work.** Sections are separated by generous padding, not by lines or boxes.
- **One marker.** Every section opens with the same `■ TAG`.
- **One motion idea.** Letters jumble and then resolve: at full scale in the hero, and briefly on
  section tags and the footer name.

## Placeholders

All copy is *lorem ipsum*. Images are tonal stand-ins. In `lib/content.ts`:

- `hero.image`: set to e.g. `'/hero.jpg'` and the hero switches to light text on the photo.
- Work lives in `lib/work.ts`. Add a project to a sub-category; give it `images` and it gets its own page at `/work/<slug>`. A project without images shows as "Coming soon".
- `hero.replayOnReturn`: set to `true` to replay the intro when scrolling back to the top.

## Motion notes

- **Hero light (Three.js):** it loads after the page, only renders while the hero is on screen,
  holds still for reduced-motion users and is replaced by the photo once `hero.image` is set. Its
  colours are the `uPaper` / `uWarm` / `uDeep` values in `HeroAtmosphere.tsx`.
- **Smooth scroll (Lenis):** `lerp` in `SmoothScroll.tsx` sets how floaty it feels (lower is
  smoother). It pauses while the menu is open. Reduced-motion users get normal scrolling.
- More 3D helpers: `npm install @react-three/drei`.

## Adding pages

Add a folder, for example `app/work/page.tsx` for `/work`.

## Hosting on Cloudflare

| Piece | Where |
|---|---|
| The site | Cloudflare Worker `shivo-labs-site` (`wrangler.jsonc`, `worker.ts`), address https://shivolabs.com |
| Build | `npm run cf:build` (OpenNext turns the Next.js build into a Worker). `npm run cf:preview` runs it locally on the Workers runtime. |
| Send live | `npm run cf:deploy` (signed in with `npx wrangler login`; account Shivo Labs) |
| Nightly jobs | Cloudflare cron triggers (01:30 and 03:15 UTC) call `/api/cron/umami-backup` and `/api/cron/indexnow`; they need the `CRON_SECRET` secret |
| Secrets | `DATABASE_URL`, `AUTH_SECRET` (salt for the anonymous visitor ids), `CRON_SECRET`, `INSIGHTS_APP_TOKEN`, `UMAMI_SHARE_ID`: set with `npx wrangler secret put NAME`, never in git |
| Visitor location | `lib/location.ts` reads Cloudflare's country, region and city |
| Free-plan speed | Ready-made pages are served as plain files by `worker.ts` (copied by `scripts/static-pages.mjs`), so they use no computer time. `/insights` is drawn in the browser (`components/insights/Dashboard.tsx`); the server only checks the sign-in and returns numbers (`/api/insights/data`). The map's shapes and city places are made once at build time (`scripts/build-geo.mjs` → `public/geo`, not in git). |
| Insights sign-in | Cloudflare Access (Zero Trust, free): an emailed code, only for `INSIGHTS_EMAIL`. `lib/auth.ts` checks Access's signed token. Local preview: `INSIGHTS_DEV_USER` in `.env.local` (only works in `next dev`). |

Notes: the free Workers plan allows about 3 MB (compressed) per Worker and 10 ms of computer time per request. The Worker is about
1.6 MB. Keep heavy work out of requests: do it at build time or in the browser, and check with `npx wrangler tail` (cpuTime).

## Visitor insights (private)

Visits are recorded twice, so no single service can lose them:

- **Your own database** (Neon Postgres; its address is the `DATABASE_URL` secret in Cloudflare): the site sends each page view and
  action to `/api/collect`, which saves it with the country/region/city Cloudflare provides. No cookies and no IP
  addresses are stored; a visitor is an anonymous id that changes every day. This is the dashboard's default source.
- **Umami**, as an independent second copy with its own dashboard. Every night `/api/cron/umami-backup`
  (scheduled in `wrangler.jsonc`, run by `worker.ts`) also copies Umami's daily numbers into your database.

How it counts: a **visitor** is one person per day (reloading doesn't add visitors); a **visit** is one browser tab's
session (a new one after 30 idle minutes); a **page view** is each page opened, except that your own database ignores
reloads of the same page within the same visit for 30 minutes. Umami counts reloads, so its page views can be higher.

On /insights you can switch between the two sources; if one can't be read, the page falls back to the other and says so.

The site counts visits with [Umami](https://umami.is): no cookies, Do Not Track respected,
live site only. You see the numbers at **/insights**, which only `INSIGHTS_EMAIL` can open (Cloudflare Access);
everyone else is asked to sign in, and search engines are told not to index it.

Setup (all in Cloudflare → Workers & Pages → shivo-labs-site → Settings → Variables and Secrets, or `npx wrangler secret put NAME`; see `.env.example`):

1. `UMAMI_SHARE_ID`: in Umami, Websites → your site → Edit → Share URL → on, and paste the id at the end
   of that URL (paid plans can use `UMAMI_API_KEY` instead). Without either, /insights shows sample data.
2. Cloudflare Access (Zero Trust → Access → Applications) guarding `shivolabs.com/insights` and `/api/insights`,
   allowing one email. Its team domain, audience tag and the email go in the `ACCESS_*` / `INSIGHTS_EMAIL` vars (`wrangler.jsonc`).
3. `AUTH_SECRET`: any long random string (salt for the anonymous visitor ids).
4. Redeploy (`npm run cf:deploy`). Opening /insights on a device also stops that device's visits being counted.
5. Signed in, open `/api/insights/status` to check each setting and whether Umami answers.

Tracked actions: work filters, project opens, contact clicks, and reading the About intro to the end
(see `lib/track.ts`). Charts and lists read Umami's API in `lib/umami.ts`, refreshed every minute.
