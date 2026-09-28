import { smoothPath } from '@/lib/chart';

/** A tiny area trend: no axes, the line and a soft wash, last point marked. */
export default function Sparkline({ values, color = 'var(--viz-1)', height = 44 }: { values: number[]; color?: string; height?: number }) {
  const W = 200, H = height, pad = 4;
  if (values.length < 2) return <svg className="spark" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" />;
  const max = Math.max(1, ...values), min = Math.min(...values);
  const pts = values.map((v, i) => [pad + (i / (values.length - 1)) * (W - pad * 2), H - pad - ((v - min) / Math.max(1, max - min)) * (H - pad * 2)] as [number, number]);
  const line = smoothPath(pts);
  const last = pts[pts.length - 1];
  const id = `sg${Math.round(values.reduce((a, b) => a * 31 + b, 7) % 1e6)}`;
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity=".22" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line}L${last[0]},${H}L${pts[0][0]},${H}Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.75} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
    </svg>
  );
}
