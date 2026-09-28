import HoverTip from './HoverTip';
import type { Day } from '@/lib/umami';

/* Daily visitors for a year, as GitHub's isometric contribution skyline plus the flat calendar. */

const RAMP = ['#cfdfea', '#9fc0d7', '#6a9cc0', '#2f78a8', '#0e5585'];
const EMPTY = '#e4ded4';
const C = 11;                                   // plane size of one day
const A = Math.PI / 6;                          // true isometric: 30°
const iso = (x: number, y: number): [number, number] => [(x - y) * Math.cos(A), (x + y) * Math.sin(A)];
const shade = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * f)).join(',')})`;
};
const pts = (p: [number, number][]) => p.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ');

export default function Skyline({ days, timeZone }: { days: Day[]; timeZone: string }) {
  const dayFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone });
  const longFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone });
  const monthFmt = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone });
  const weekdayOf = (t: number) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone }).format(t));

  // lay days into week columns, Monday on top
  const lead = days.length ? weekdayOf(days[0].t) : 0;
  const cells = days.map((d, i) => ({ ...d, col: Math.floor((i + lead) / 7), row: (i + lead) % 7 }));
  const cols = cells.length ? cells[cells.length - 1].col + 1 : 0;
  const max = Math.max(1, ...days.map((d) => d.visitors));
  const step = (v: number) => (v ? RAMP[Math.min(RAMP.length - 1, Math.floor((v / max) * RAMP.length))] : EMPTY);

  // the stats GitHub shows beside it
  const total = days.reduce((s, d) => s + d.visitors, 0);
  const busiest = days.reduce((b, d) => (d.visitors > b.visitors ? d : b), days[0] ?? { t: 0, visitors: 0 });
  let best = { len: 0, from: 0, to: 0 }, run = 0, runFrom = 0;
  days.forEach((d, i) => {
    if (d.visitors > 0) { if (!run) runFrom = i; run++; if (run > best.len) best = { len: run, from: runFrom, to: i }; } else run = 0;
  });
  let cur = 0;
  for (let i = days.length - 1; i >= 0 && days[i].visitors > 0; i--) cur++;
  const span = (a: number, b: number) => (days[a] && days[b] ? `${dayFmt.format(days[a].t)} – ${dayFmt.format(days[b].t)}` : '');

  // isometric columns, drawn back to front
  const HMAX = 70;
  const corners = [iso(0, 0), iso(cols * C, 0), iso(cols * C, 7 * C), iso(0, 7 * C)];
  const minX = Math.min(...corners.map((c) => c[0])) - 4, maxX = Math.max(...corners.map((c) => c[0])) + 4;
  const tops = cells.map((d) => iso(d.col * C, d.row * C)[1] - (d.visitors ? 3 + (d.visitors / max) * HMAX : 1.2));
  const minY = Math.min(...corners.map((c) => c[1]), ...tops) - 8, maxY = Math.max(...corners.map((c) => c[1])) + 8;
  const g = 1.4; // gap between columns
  const columns = [...cells].sort((a, b) => (a.col + a.row) - (b.col + b.row)).map((d) => {
    const x0 = d.col * C + g / 2, y0 = d.row * C + g / 2, s = C - g;
    const h = d.visitors ? 3 + (d.visitors / max) * HMAX : 1.2;
    const b = [iso(x0, y0), iso(x0 + s, y0), iso(x0 + s, y0 + s), iso(x0, y0 + s)];
    const t = b.map(([x, y]) => [x, y - h] as [number, number]);
    const c = step(d.visitors);
    return (
      <g key={d.t} data-tip={`${d.visitors.toLocaleString('en')} visitors · ${longFmt.format(d.t)}`} className="sky__col">
        <polygon points={pts([b[3], b[2], t[2], t[3]])} fill={shade(c, 0.72)} />
        <polygon points={pts([b[1], b[2], t[2], t[1]])} fill={shade(c, 0.86)} />
        <polygon points={pts(t)} fill={c} />
      </g>
    );
  });

  // the flat calendar, with month labels
  const months: { col: number; label: string }[] = [];
  cells.forEach((d) => { if (d.row === 0 || d === cells[0]) { const m = monthFmt.format(d.t); if (!months.length || months[months.length - 1].label !== m) months.push({ col: d.col, label: m }); } });

  return (
    <div className="sky">
      <div className="sky__stats">
        <Stat label="12-month total" value={total.toLocaleString('en')} unit="visitors" sub={span(0, days.length - 1)} big />
        <Stat label="Busiest day" value={busiest.visitors.toLocaleString('en')} unit="visitors" sub={busiest.t ? longFmt.format(busiest.t) : ''} />
        <Stat label="Longest streak" value={String(best.len)} unit={best.len === 1 ? 'day' : 'days'} sub={best.len ? span(best.from, best.to) : 'No visits yet'} />
        <Stat label="Current streak" value={String(cur)} unit={cur === 1 ? 'day' : 'days'} sub={cur ? span(days.length - cur, days.length - 1) : 'No visitors today yet'} />
      </div>

      <HoverTip className="sky__iso">
        <svg viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} role="img" aria-label="Daily visitors over the last 12 months as a skyline. The calendar below shows the same days.">
          {columns}
        </svg>
      </HoverTip>

      <HoverTip className="sky__cal">
        <svg viewBox={`-26 -16 ${cols * 12 + 28} ${7 * 12 + 18}`} role="img" aria-label="Calendar of daily visitors">
          {months.map((m, i) => (i === 0 && months[1] && months[1].col - m.col < 3 ? null :
            <text key={m.col} x={m.col * 12} y={-5} className="sky__label">{m.label}</text>))}
          {['Mon', 'Wed', 'Fri'].map((d, i) => <text key={d} x={-4} y={(i * 2) * 12 + 8.5} textAnchor="end" className="sky__label">{d}</text>)}
          {cells.map((d) => (
            <rect key={d.t} x={d.col * 12} y={d.row * 12} width={10} height={10} rx={2} fill={step(d.visitors)}
              data-tip={`${d.visitors.toLocaleString('en')} visitors · ${longFmt.format(d.t)}`} />
          ))}
        </svg>
        <div className="sky__key mono" aria-hidden="true"><span>Less</span>{[EMPTY, ...RAMP].map((c) => <i key={c} style={{ background: c }} />)}<span>More</span></div>
      </HoverTip>
    </div>
  );
}

function Stat({ label, value, unit, sub, big }: { label: string; value: string; unit: string; sub: string; big?: boolean }) {
  return (
    <div className={`sky__stat${big ? ' is-big' : ''}`}>
      <p className="sky__stat-label">{label}</p>
      <p className="sky__stat-value"><b>{value}</b><span>{unit}<small>{sub}</small></span></p>
    </div>
  );
}
