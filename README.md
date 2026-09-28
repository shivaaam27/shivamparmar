# Shivam Parmar — portfolio

Built with **Next.js** (React), **GSAP** for motion, **Three.js** (via React Three Fiber) for 3D,
**Lenis** for smooth scrolling, and TypeScript. It deploys to Vercel as is:
import the repo at vercel.com and press Deploy, with no settings to change.

## Run it locally

```
npm install
npm run dev        # http://localhost:3000
```

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

## Visitor insights (private)

The site counts visits with [Umami](https://umami.is): no cookies, Do Not Track respected,
live site only. You see the numbers at **/insights**, which only your GitHub account can open;
everyone else gets a 404, and search engines are told not to index it.

Setup (all in Vercel → Project → Settings → Environment Variables; see `.env.example`):

1. `UMAMI_API_KEY`: Umami → Settings → API keys. Without it /insights shows sample data.
2. A GitHub OAuth app (GitHub → Settings → Developer settings → OAuth Apps → New):
   homepage `https://<your-domain>`, callback `https://<your-domain>/api/auth/github/callback`.
   Put its ID and secret in `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`.
3. `INSIGHTS_GITHUB_USER`: your GitHub username. `AUTH_SECRET`: any long random string.
4. Redeploy. Opening /insights on a device also stops that device's visits being counted.

Tracked actions: work filters, project opens, contact clicks, and reading the About intro to the end
(see `lib/track.ts`). Charts and lists read Umami's API in `lib/umami.ts`, refreshed every minute.
