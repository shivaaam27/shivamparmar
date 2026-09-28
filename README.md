# Shivam — landing page

Plain HTML, CSS and JS, with no build step. Open `index.html` in a browser, or run any static server
(`npx serve .`).

```
index.html      the page: hero → about → work → contact → footer
css/style.css   the design system (tokens at the top) and every section
js/main.js      hero intro, scroll reveals, menu, image strips
```

## The system

The seven reference images use seven different design languages. This page combines them into one:

| Token   | Value                                        | From the reference                              |
|---------|----------------------------------------------|-------------------------------------------------|
| Paper   | `#EEEAE3` + fine grain overlay               | VOIR: warm off-white "paper" surface            |
| Ink     | `#151412`                                    | All: near-black instead of pure black           |
| Accent  | taupe `#756452` (text) / `#BDB1A2` (marks)   | VOIR: the `■ ABOUT` tag and "Founded in…" line  |
| Display | **Instrument Serif**, often uppercase         | VOIR: condensed, French editorial serif         |
| Reading | **Inter Tight**, lead text ~18–22px           | VOIR description paragraph, sized up on purpose |
| Labels  | **IBM Plex Mono**, uppercase                 | Rowan: "LOS ANGELES BASED" and the bottom row   |

The rules are:

- **Big and small, with little in between.** Headlines and the "Work" title are very large, body
  text is large enough to read comfortably, and labels are small mono. Nothing is tiny.
- **Space does the work.** Sections are separated by generous vertical padding (`--section`), not
  by lines or boxes.
- **One marker.** Every section opens with the same `■ TAG`.
- **One motion idea.** Letters jumble and then resolve. The hero does this at full scale, and the
  section tags and the footer name repeat it briefly when they scroll into view.

## Sections

1. **Hero** uses the Rowan layout: wordmark at top left, menu at top right, centre title with a
   mono descriptor beside it, and four labels along the bottom. The centre is a 6×5 grid of
   S‑H‑I‑V‑A‑M letters that keep rolling. The middle row then locks into **SHIVAM** from left to
   right, and the rest fade out. It plays once per page load and does not loop.
2. **About** uses the VOIR layout: centred uppercase serif headline with the tag inline, two
   offset images, and the description with a serif sign-off.
3. **Work** follows the minimalism reference (a huge title, two readable meta columns, lots of
   air), then the hover-expand strips. Hovering or focusing a strip expands it and collapses the
   previous one. On phones the strips stack vertically and expand on tap.
4. **Contact** has a large headline, an email link and three info columns. The footer shows the
   name at full width.

## Placeholders

All copy is *lorem ipsum* so the layout can be judged without real content. Only the name and the
section and nav labels are real. Replace the text in `index.html`.

- **Hero photo**: put `<img src="assets/hero.jpg" alt="">` inside `.hero__media`. The hero switches
  to light text on a darkened photo automatically.
- **Images**: each `<span class="ph" data-tone="…">` (and `<figure class="ph …">` in About) is a
  tonal stand-in. Replace it with an `<img>`. Strip images get `object-fit: cover` automatically.
- **Replay intro when scrolling back up**: set `REPLAY_ON_RETURN = true` in `js/main.js`.

Users who ask their system for reduced motion see the resolved name immediately, with no
animation.
