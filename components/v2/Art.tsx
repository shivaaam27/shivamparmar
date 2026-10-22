/**
 * Version 2's drawn shapes: leaves, the four-petal flower, a sun burst, a sparkle, loop lines and hills.
 * All plain SVG in currentColor (or a given fill), so they take any colour and stay sharp.
 */
type P = { className?: string; style?: React.CSSProperties };

/** A leaf with its middle vein, pointing up and right. */
export function Leaf({ className = '', style, vein = true }: P & { vein?: boolean }) {
  return (
    <svg className={`v2-leaf ${className}`} style={style} viewBox="0 0 100 100" aria-hidden="true">
      <path d="M8 92C6 46 36 8 94 6c2 56-34 88-86 86Z" fill="currentColor" />
      {vein && <path d="M10 90C34 64 56 40 82 18" fill="none" stroke="var(--vein, rgba(255,255,255,.35))" strokeWidth="2.4" strokeLinecap="round" />}
    </svg>
  );
}

/** A round, fat leaf like the nature museum card's (a blob with a stem cut). */
export function BigLeaf({ className = '', style }: P) {
  return (
    <svg className={`v2-leaf ${className}`} style={style} viewBox="0 0 200 200" aria-hidden="true">
      <path d="M100 190c-8-22-6-40 4-54C60 150 14 128 10 84 6 40 44 10 92 10c54 0 98 34 98 86 0 48-40 78-80 68-6 10-8 18-10 26Z" fill="currentColor" />
      <path d="M102 184c2-40 12-80 46-128" fill="none" stroke="var(--vein, rgba(255,255,255,.3))" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** The four-petal flower (Mercado Natú's pattern). */
export function Petals({ className = '', style }: P) {
  return (
    <svg className={`v2-leaf ${className}`} style={style} viewBox="0 0 100 100" aria-hidden="true">
      <g fill="currentColor">
        <path d="M50 50C38 38 38 18 50 4c12 14 12 34 0 46Z" />
        <path d="M50 50c12 12 12 32 0 46-12-14-12-34 0-46Z" />
        <path d="M50 50c12-12 32-12 46 0-14 12-34 12-46 0Z" />
        <path d="M50 50c-12 12-32 12-46 0 14-12 34-12 46 0Z" />
      </g>
    </svg>
  );
}

/** A sun burst / star with `points` rays (Verdure, Taioba). */
export function Burst({ className = '', style, points = 14, inner = 0.62 }: P & { points?: number; inner?: number }) {
  const d = Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 ? 50 * inner : 50;
    const a = (Math.PI * i) / points - Math.PI / 2;
    return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
  return (
    <svg className={`v2-leaf ${className}`} style={style} viewBox="0 0 100 100" aria-hidden="true">
      <polygon points={d} fill="currentColor" strokeLinejoin="round" />
    </svg>
  );
}

/** A four-point sparkle (Taioba's star). */
export function Sparkle({ className = '', style }: P) {
  return (
    <svg className={`v2-leaf ${className}`} style={style} viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 0c4 30 16 42 50 50-34 8-46 20-50 50-4-30-16-42-50-50 34-8 46-20 50-50Z" fill="currentColor" />
    </svg>
  );
}

/** A row of loops (a stretched cycloid) drawn as one smooth line, inside a w × h box. */
function springPath(loops: number, w: number, h: number) {
  const pad = 14, raw: [number, number][] = [];
  // x = t − 2.2·sin t makes a loop each turn; y follows the turn
  for (let t = 0; t <= loops * 2 * Math.PI + Math.PI; t += 0.1) raw.push([t - 2.2 * Math.sin(t), -Math.cos(t)]);
  const xs = raw.map((p) => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs);
  const sx = (w - 2 * pad) / (x1 - x0), sy = (h - 2 * pad) / 2;
  return `M${raw.map(([x, y]) => `${(pad + (x - x0) * sx).toFixed(1)} ${(h / 2 + y * sy).toFixed(1)}`).join('L')}`;
}

/** Loop lines: thick strokes with round ends that curl into loops (the loop tiles and the ribbon film). */
export const LOOPS = {
  /** a long line with three loops, left to right */
  long: 'M-20 150C60 150 90 60 150 70s40 90-10 92-40-70 20-96 110 40 150 70 80-10 70-50-60-40-60 10 70 110 150 110 120-60 210-60',
  /** one big curl */
  curl: 'M10 180C30 90 120 40 160 80s0 110-50 90-40-120 40-150 110 10 150 60',
  /** a spring of small loops (fits 0 0 560 160) */
  spring: springPath(5, 560, 160),
  /** a gentle wave */
  wave: 'M0 60c60-50 120-50 180 0s120 50 180 0 120-50 180 0',
};

export function Loop({ d = LOOPS.long, viewBox = '0 0 700 220', className = '', style, width = 18, color = 'currentColor', draw = true }:
  P & { d?: string; viewBox?: string; width?: number; color?: string; draw?: boolean }) {
  return (
    <svg className={`v2-loop ${className}`} style={style} viewBox={viewBox} fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid meet" data-reveal={draw ? '' : undefined}>
      <path className={draw ? 'v2-draw' : undefined} d={d} pathLength={1} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Layered hills with a sun, for the foot of the page (Verdure's third poster). */
export function Hills({ className = '' }: P) {
  return (
    <svg className={`v2-hills ${className}`} viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 210C160 120 300 110 470 170s320 70 480-10 300-90 490 0V300H0Z" fill="var(--leaf)" />
      <path d="M0 250c200-80 380-90 560-30s360 40 540-20 240-30 340 0V300H0Z" fill="var(--pine)" />
      <path d="M0 280c240-40 480-40 720-10s480 20 720-20V300H0Z" fill="var(--forest)" />
    </svg>
  );
}

/** An arrow pointing up and to the right; on hover of its link it slides out and a twin slides in. */
export function ArrowUR({ size }: { size?: number }) {
  const svg = (k: number) => (
    <svg key={k} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7M8.5 7H17v8.5" />
    </svg>
  );
  return <span className="v2-arw" style={size ? { fontSize: size } : undefined} aria-hidden="true">{svg(0)}{svg(1)}</span>;
}
