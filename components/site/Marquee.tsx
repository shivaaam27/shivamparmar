/**
 * Tiles gliding past in rows, each row in the opposite direction to the one above (the logo rows of the first site).
 * A short row repeats its own tiles until it is wider than any screen; each row then holds that stretch twice and
 * moves by half its width, so the loop never shows a seam. Hover rests them. `rows` are the tiles of each row (links);
 * the repeats are hidden from screen readers and the tab key.
 */
const MIN_TILES = 10;

export default function Marquee({ rows, secondsPerTile = 3.6, label }: { rows: React.ReactNode[][]; secondsPerTile?: number; label: string }) {
  return (
    <div className="v2-mq" aria-label={label}>
      {rows.filter((r) => r.length).map((set, row) => {
        let stretch = set;
        while (stretch.length < MIN_TILES) stretch = stretch.concat(set);
        return (
          <div key={row} className={`v2-mq__row${row % 2 ? ' v2-mq__row--back' : ''}`}
            style={{ '--dur': `${(stretch.length * secondsPerTile * (row % 2 ? 1.12 : 1)).toFixed(1)}s` } as React.CSSProperties}>
            <ul className="v2-mq__track">
              {stretch.concat(stretch).map((tile, i) => {
                const shown = i < set.length;
                return <li key={i} aria-hidden={!shown || undefined} {...(!shown ? { inert: true } : {})}>{tile}</li>;
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
