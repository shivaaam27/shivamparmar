import HoverTip from './HoverTip';

/* Page views by weekday × hour: when people actually look. */
const RAMP = ['#e4ded4', '#cfdfea', '#9fc0d7', '#6a9cc0', '#2f78a8', '#0e5585'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hh = (h: number) => `${String(h).padStart(2, '0')}:00`;

export default function Rhythm({ grid }: { grid: number[][] }) {
  const max = Math.max(1, ...grid.flat());
  const step = (v: number) => (v ? RAMP[1 + Math.min(RAMP.length - 2, Math.floor((v / max) * (RAMP.length - 1)))] : RAMP[0]);
  let peak = { d: 0, h: 0, v: -1 };
  grid.forEach((row, d) => row.forEach((v, h) => { if (v > peak.v) peak = { d, h, v }; }));
  const byDay = grid.map((r) => r.reduce((a, b) => a + b, 0));
  const topDay = byDay.indexOf(Math.max(...byDay));
  const total = byDay.reduce((a, b) => a + b, 0);

  return (
    <div className="rhythm">
      <div className="rhythm__facts">
        <p><span className="mono">Busiest hour</span><b>{peak.v > 0 ? `${DAYS[peak.d]} ${hh(peak.h)}` : '—'}</b></p>
        <p><span className="mono">Busiest day</span><b>{total ? ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'][topDay] : '—'}</b></p>
      </div>
      <HoverTip>
        <div className="rhythm__grid" role="img" aria-label="Page views by weekday and hour over the last four weeks">
          {grid.map((row, d) => (
            <div key={d} className="rhythm__row">
              <span className="rhythm__day mono">{DAYS[d]}</span>
              {row.map((v, h) => (
                <i key={h} style={{ background: step(v) }} data-tip={`${v.toLocaleString('en')} page views · ${DAYS[d]} ${hh(h)}–${hh((h + 1) % 24)}`} />
              ))}
            </div>
          ))}
          <div className="rhythm__row rhythm__hours mono" aria-hidden="true">
            <span className="rhythm__day" />
            {Array.from({ length: 24 }, (_, h) => <span key={h}>{h % 6 === 0 ? hh(h) : ''}</span>)}
          </div>
        </div>
      </HoverTip>
    </div>
  );
}
