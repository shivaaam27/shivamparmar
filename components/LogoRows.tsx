/**
 * Logos on white tiles gliding past in two rows, in opposite directions (home page and About).
 * The list is split in half, so a logo shows in one row only: the first half on top, the rest below.
 * A short row repeats its own logos until it is wider than the screen; each row then holds that
 * stretch twice and moves by half its width, so the loop never shows a seam. Speed stays the same
 * however many logos a row has.
 */
type Logo = { name: string; src: string | null };
const MIN_TILES = 10;        // a stretch of at least this many tiles is wider than any screen
const SECONDS_PER_TILE = 3.3;

export default function LogoRows({ logos, label }: { logos: Logo[]; label: string }) {
  const half = Math.ceil(logos.length / 2);
  const rows = [logos.slice(0, half), logos.slice(half)].filter((r) => r.length);
  return (
    <div className="ab-logos" aria-label={label}>
      {rows.map((set, row) => {
        let stretch = set;
        while (stretch.length < MIN_TILES) stretch = stretch.concat(set);
        return (
          <div key={row} className={`ab-marquee${row ? ' ab-marquee--back' : ''}`}
            style={{ '--dur': `${(stretch.length * SECONDS_PER_TILE * (row ? 1.15 : 1)).toFixed(1)}s` } as React.CSSProperties}>
            <ul className="ab-marquee__track">
              {stretch.concat(stretch).map((l, i) => {
                const shown = i < set.length;
                return (
                  <li key={i} aria-hidden={!shown || undefined}>
                    {l.src ? <img src={l.src} alt={shown ? l.name : ''} loading="lazy" /> : <span className="ab-logo-ph">{l.name}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
