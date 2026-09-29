/**
 * Placeholder illustration until a real portrait is chosen: a calm, geometric
 * bust in the site's stone tones (no black, no orange), lit from the top right.
 */
export default function Portrait({ className, id = 'pt', fit = 'slice' }: { className?: string; id?: string; fit?: 'slice' | 'meet' }) {
  return (
    <svg className={className} viewBox="0 0 400 500" role="img" aria-label="Illustrated portrait (placeholder)" preserveAspectRatio={`xMidYMax ${fit}`}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F3F0EB" />
          <stop offset="1" stopColor="#E2DBD1" />
        </linearGradient>
        <radialGradient id={`${id}-sun`} cx=".7" cy=".22" r=".5">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-fig`} x1=".2" y1="0" x2=".8" y2="1">
          <stop offset="0" stopColor="#B7A897" />
          <stop offset="1" stopColor="#8E7E6C" />
        </linearGradient>
      </defs>
      {/* in "meet" mode the frame behind paints the background, so no hard edge shows */}
      {fit === 'slice' && <rect width="400" height="500" fill={`url(#${id}-bg)`} />}
      {fit === 'slice' && <circle cx="280" cy="110" r="190" fill={`url(#${id}-sun)`} />}
      {/* shoulders */}
      <path d="M52 500 C 56 410, 118 370, 200 370 C 282 370, 344 410, 348 500 Z" fill={`url(#${id}-fig)`} />
      {/* neck */}
      <rect x="176" y="300" width="48" height="84" rx="22" fill="#9C8C79" />
      {/* head */}
      <ellipse cx="200" cy="232" rx="78" ry="92" fill={`url(#${id}-fig)`} />
      {/* hair */}
      <path d="M122 226 C 116 160, 156 132, 204 132 C 252 132, 286 160, 280 214 C 262 184, 232 172, 198 176 C 164 180, 138 196, 122 226 Z" fill="#7D6E5D" />
    </svg>
  );
}
