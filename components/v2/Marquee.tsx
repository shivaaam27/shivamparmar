/**
 * Logos on rounded white tiles gliding past in two rows, in opposite directions (V2's take on V1's LogoRows).
 * Each row repeats until it is wider than any screen, holds that stretch twice, and moves by half, so it never
 * shows a seam. It pauses under the pointer.
 */
type Logo = { name: string; src: string | null };
const MIN_TILES = 10;
const SECONDS_PER_TILE = 3.4;

export default function Marquee({ logos, label }: { logos: Logo[]; label: string }) {
  const half = Math.ceil(logos.length / 2);
  const rows = [logos.slice(0, half), logos.slice(half)].filter((r) => r.length);
  return (
    <div className="v2-marquee" aria-label={label}>
      {rows.map((set, row) => {
        let stretch = set;
        while (stretch.length < MIN_TILES) stretch = stretch.concat(set);
        return (
          <div key={row} className={`v2-marquee__row${row ? ' v2-marquee__row--back' : ''}`}
            style={{ '--dur': `${(stretch.length * SECONDS_PER_TILE * (row ? 1.15 : 1)).toFixed(1)}s` } as React.CSSProperties}>
            <ul className="v2-marquee__track">
              {stretch.concat(stretch).map((l, i) => {
                const shown = i < set.length;
                return (
                  <li key={i} aria-hidden={!shown || undefined}>
                    {l.src ? <img src={l.src} alt={shown ? l.name : ''} loading="lazy" /> : <span>{l.name}</span>}
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
