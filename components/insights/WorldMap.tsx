import { geoEqualEarth, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import countries from 'i18n-iso-countries';
import world from 'world-atlas/countries-110m.json';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, Geometry } from 'geojson';
import HoverTip from './HoverTip';
import { countryName } from '@/lib/insights-format';
import type { Row } from '@/lib/umami';

const W = 960;
const H = 440;

// land shapes, once per server process (Antarctica left out: no visitors, lots of ink)
const topo = world as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
const shapes = (feature(topo, topo.objects.countries).features as Feature<Geometry, { name: string }>[])
  .filter((f) => f.id !== '010');
const projection = geoEqualEarth().fitExtent([[4, 4], [W - 4, H - 4]], { type: 'FeatureCollection', features: shapes });
const path = geoPath(projection);
const drawn = shapes.map((f) => ({ id: String(f.id), d: path(f) ?? '' }));

/** Sequential blue: five steps from barely-there to deep, one hue. */
const STEPS = ['#d3e2ec', '#a4c3d8', '#6b9fbf', '#2f76a3', '#0e4f78'];

export default function WorldMap({ rows }: { rows: Row[] }) {
  const byNumeric = new Map<string, Row>();
  rows.forEach((r) => {
    const num = countries.alpha2ToNumeric(r.label.toUpperCase());
    if (num) byNumeric.set(String(num).padStart(3, '0'), r);
  });
  const max = Math.max(1, ...rows.map((r) => r.value));
  const step = (v: number) => STEPS[Math.min(STEPS.length - 1, Math.floor(Math.sqrt(v / max) * STEPS.length))];

  return (
    <div className="worldmap">
      <HoverTip>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="World map shaded by visitors per country. The same figures are listed beside it.">
          {drawn.map(({ id, d }) => {
            const r = byNumeric.get(id);
            return (
              <path
                key={id}
                d={d}
                fill={r ? step(r.value) : 'var(--viz-empty)'}
                stroke="var(--paper)"
                strokeWidth={0.6}
                data-tip={r ? `${countryName(r.label)} · ${r.value.toLocaleString('en')} visitors` : undefined}
                className={r ? 'worldmap__hit' : undefined}
              />
            );
          })}
        </svg>
      </HoverTip>
      <div className="worldmap__key mono" aria-hidden="true">
        <span>Fewer</span>
        {STEPS.map((c) => <i key={c} style={{ background: c }} />)}
        <span>More visitors</span>
      </div>
    </div>
  );
}
