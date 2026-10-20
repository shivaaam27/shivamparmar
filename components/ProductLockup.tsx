/**
 * A product's logo, as the Shivo Labs app shows it: the mark, SHIVO LABS, and the product's name in small
 * spaced capitals beneath. Drawn in HTML (not a picture), so it stays sharp and follows dark mode.
 * The tiles are the same as shared/mark.js in the app: tails first, the sage tip last.
 */
const TILES: [number, number, boolean][] = [[18, 64, false], [64, 18, false], [18, 41, false], [41, 18, false], [41, 41, false], [18, 18, true]];

export default function ProductLockup({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span className={`plock ${className}`} role="img" aria-label={`Shivo Labs ${name}`}>
      <svg className="plock__mark" viewBox="0 0 100 100" aria-hidden="true">
        <g transform="rotate(15 50 50)">
          {TILES.map(([x, y, lit], i) => <rect key={i} className={lit ? 'is-lit' : undefined} x={x} y={y} width="18" height="18" rx="4.5" />)}
        </g>
      </svg>
      <span className="plock__words" aria-hidden="true">
        <span className="plock__wm">SHIVO<span>LABS</span></span>
        <span className="plock__sub">{name}</span>
      </span>
    </span>
  );
}
