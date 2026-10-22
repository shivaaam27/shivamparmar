/**
 * The Shivo Labs logo: six tiles leaning 15° like an arrow with a sage tip, and SHIVO LABS
 * in Sora (SemiBold / Light). `tone` only picks the colours for a light or a dark background.
 * `loader` runs the slow sage shimmer through the tiles, from the tails towards the tip.
 */
const TILES: [number, number][] = [[0, 0], [46, 0], [0, 46], [23, 23], [23, 0], [0, 23]];

export function Mark({ className = '', loader = false }: { className?: string; loader?: boolean }) {
  return (
    <svg className={`v2-mark${loader ? ' v2-mark--loader' : ''} ${className}`} viewBox="0 0 64 64" aria-hidden="true">
      <g transform="rotate(15 32 32)">
        {TILES.map(([x, y], i) => (
          <rect key={i} className={i === 0 ? 'is-lit' : undefined} style={{ '--i': i } as React.CSSProperties} x={x} y={y} width="18" height="18" rx="4.5" />
        ))}
      </g>
    </svg>
  );
}

export default function Logo({ tone = 'light', loader = false, className = '' }: { tone?: 'light' | 'dark'; loader?: boolean; className?: string }) {
  return (
    <span className={`v2-logo v2-logo--${tone} ${className}`}>
      <Mark loader={loader} />
      <span className="v2-logo__text">SHIVO<span>LABS</span></span>
    </span>
  );
}
