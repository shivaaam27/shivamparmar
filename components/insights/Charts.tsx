import HoverTip from './HoverTip';

/*
 * Small, quiet charts for the insights cards. All static SVG / HTML (no
 * client code), with hover read-outs through HoverTip; the numbers they show
 * are also written out on the card or in a list, so nothing depends on hovering.
 */

const fmt = (n: number) => n.toLocaleString('en');

/** Thin vertical lines, one per bucket, like a conversion chart on a coloured card. */
export function NeedleBars({ values, labels, tips, height = 190 }: { values: number[]; labels: [string, string, string]; tips: string[]; height?: number }) {
  const n = values.length;
  const max = Math.max(1, ...values);
  const W = 600, H = height, top = 8, bottom = 22;
  const ih = H - top - bottom;
  const step = W / Math.max(1, n);
  const bw = Math.max(2, Math.min(7, step * 0.38));
  return (
    <HoverTip className="needles">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Visitors per period">
        {[0, 0.5, 1].map((f) => (
          <line key={f} x1={0} x2={W} y1={top + ih * (1 - f)} y2={top + ih * (1 - f)} className="needles__grid" vectorEffect="non-scaling-stroke" />
        ))}
        {values.map((v, i) => {
          const h = Math.max(v ? 3 : 1, (v / max) * ih);
          const x = step * i + step / 2;
          return (
            <g key={i} data-tip={tips[i]}>
              <rect x={x - step / 2} y={top} width={step} height={ih} fill="transparent" />
              <rect x={x - bw / 2} y={top + ih - h} width={bw} height={h} rx={bw / 2} className={i === n - 1 ? 'needles__bar is-last' : 'needles__bar'} />
            </g>
          );
        })}
      </svg>
      <div className="needles__axis mono" aria-hidden="true"><span>{labels[0]}</span><span>{labels[1]}</span><span>{labels[2]}</span></div>
    </HoverTip>
  );
}

/** Capsule bars: a full-height track with the value filled from the bottom. */
export function PillBars({ items, unit }: { items: { label: string; value: number }[]; unit: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  const top = items.reduce((b, i) => (i.value > b.value ? i : b), items[0] ?? { label: '', value: 0 });
  return (
    <HoverTip className="pills">
      <div className="pills__row" role="img" aria-label={items.map((i) => `${i.label} ${fmt(i.value)} ${unit}`).join(', ')}>
        {items.map((i) => (
          <div key={i.label} className="pills__col" data-tip={`${fmt(i.value)} ${unit} · ${i.label}`}>
            <div className="pills__track"><i className={i === top && i.value ? 'is-top' : ''} style={{ height: `${Math.max(i.value ? 8 : 0, (i.value / max) * 100)}%` }} /></div>
            <span className="mono">{i.label}</span>
          </div>
        ))}
      </div>
    </HoverTip>
  );
}

/** A ring of ticks, lit up to the value (0–1). */
export function TickRing({ value, label, size = 170 }: { value: number; label: string; size?: number }) {
  const ticks = 54, r = 72, inner = 60;
  const start = Math.PI * 0.75, sweep = Math.PI * 1.5;
  const lit = Math.round(Math.max(0, Math.min(1, value)) * ticks);
  return (
    <div className="ring" style={{ width: size }}>
      <svg viewBox="-90 -90 180 180" role="img" aria-label={`${Math.round(value * 100)}% ${label}`}>
        {Array.from({ length: ticks + 1 }, (_, i) => {
          const a = start + (i / ticks) * sweep;
          return (
            <line key={i} x1={Math.cos(a) * inner} y1={Math.sin(a) * inner} x2={Math.cos(a) * r} y2={Math.sin(a) * r}
              className={i <= lit && lit > 0 ? 'ring__tick is-lit' : 'ring__tick'} strokeLinecap="round" />
          );
        })}
      </svg>
      <p className="ring__value"><span>{Math.round(value * 100)}<small>%</small></span></p>
    </div>
  );
}

/** One bar split into parts, with a legend: how a whole divides up. */
export function Segments({ parts }: { parts: { label: string; value: number }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  if (!total) return <p className="empty">Nothing yet.</p>;
  return (
    <div className="segs">
      <div className="segs__bar" role="img" aria-label={parts.map((p) => `${p.label} ${Math.round((p.value / total) * 100)}%`).join(', ')}>
        {parts.map((p, i) => <i key={p.label} className={`segs__part segs__part--${i}`} style={{ flexGrow: p.value }} />)}
      </div>
      <ul className="segs__legend">
        {parts.map((p, i) => (
          <li key={p.label}><i className={`segs__part--${i}`} aria-hidden="true" /><span>{p.label}</span><b>{Math.round((p.value / total) * 100)}%</b></li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Hour by hour as a strip of thin lines, brighter where it was busier: the
 * whole month's rhythm at a glance. Midnights are marked underneath.
 */
export function Spectrum({ points, timeZone }: { points: { t: number; visitors: number }[]; timeZone: string }) {
  const max = Math.max(1, ...points.map((p) => p.visitors));
  const ramp = ['#22262a', '#1d4461', '#23699a', '#3f94cc', '#8cc8ef', '#e3f3ff'];
  const color = (v: number) => (v ? ramp[1 + Math.min(ramp.length - 2, Math.floor(Math.sqrt(v / max) * (ramp.length - 1)))] : ramp[0]);
  const dayHour = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone });
  const hh = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone });
  const hourFmt = { format: (t: number) => `${dayHour.format(t)}, ${hh.format(t)}:00` };
  const dayFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone });
  const hourOf = (t: number) => Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone }).format(t));
  const peak = points.reduce((b, p) => (p.visitors > b.visitors ? p : b), points[0] ?? { t: 0, visitors: 0 });
  const peakAt = points.indexOf(peak);
  const n = points.length;
  return (
    <HoverTip className="spectrum">
      {peak.visitors > 0 && (
        <p className="spectrum__peak mono" style={{ left: `${((peakAt + 0.5) / n) * 100}%` }}>
          <b>{fmt(peak.visitors)}</b> · {hourFmt.format(peak.t)}
        </p>
      )}
      <div className="spectrum__lines" role="img" aria-label={`Visitors hour by hour. Busiest: ${fmt(peak.visitors)} at ${peak.t ? hourFmt.format(peak.t) : '—'}`}>
        {points.map((p, i) => (
          <i key={p.t} style={{ background: color(p.visitors) }} className={i === peakAt && peak.visitors ? 'is-peak' : undefined}
            data-tip={`${fmt(p.visitors)} visitors · ${hourFmt.format(p.t)}`} />
        ))}
      </div>
      <div className="spectrum__days mono" aria-hidden="true">
        {points.map((p, i) => (hourOf(p.t) === 0 && i % 168 < 24 ? <span key={p.t} style={{ left: `${(i / n) * 100}%` }}>{dayFmt.format(p.t)}</span> : null))}
      </div>
    </HoverTip>
  );
}

/** "17 / 100" with a progress bar underneath. */
export function Progress({ label, value, of, note }: { label: string; value: number; of: number; note?: string }) {
  const f = of ? Math.min(1, value / of) : 0;
  return (
    <div className="prog">
      <p className="prog__top"><span>{label}</span><b>{fmt(value)}<small>/{fmt(of)}</small></b></p>
      <div className="prog__bar"><i style={{ width: `${f * 100}%` }} /></div>
      {note && <p className="prog__note mono">{note}</p>}
    </div>
  );
}
