# Shivam Parmar — portfolio

Built with **Next.js** (React), **GSAP** for motion and TypeScript. It deploys to Vercel as is:
import the repo at vercel.com and press Deploy, with no settings to change.

## Run it locally

```
npm install
npm run dev        # http://localhost:3000
```

## Where things live

```
lib/content.ts        ← ALL text, links and image paths. Edit this to change content.
public/               ← put photos here (e.g. public/hero.jpg → '/hero.jpg' in content.ts)
app/globals.css       design system: colours, fonts, spacing (tokens at the top)
app/layout.tsx        fonts (self-hosted via next/font) + page shell
app/page.tsx          section order: Hero → About → Work → Contact → Footer
components/Hero.tsx   jumble → SHIVAM intro (GSAP timeline)
components/Effects.tsx scroll reveals + label decoding (GSAP ScrollTrigger)
components/Work.tsx   hover-expand image strips
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
- `about.images[n].image` and `work.items[n].image`: set a path and the photo replaces the stand-in.
- `hero.replayOnReturn`: set to `true` to replay the intro when scrolling back to the top.

## Adding more

- **3D (Three.js):** `npm install three @react-three/fiber @react-three/drei`, then build a client
  component with a `<Canvas>`.
- **New pages:** add a folder, for example `app/work/page.tsx` for `/work`.
- **Smooth scrolling:** `npm install lenis` works well alongside GSAP ScrollTrigger.
