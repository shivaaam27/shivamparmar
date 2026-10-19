// Builds the insights map's data once, as plain files in public/geo, so the live site never does this work
// (Cloudflare's free plan allows about 10 ms of computer time per page view; drawing the world and indexing
// 135,000 cities takes about 400 ms). Run by `npm run build` and `npm run cf:build`; the files are not in git.
//
//   public/geo/world.json        every country's shape (SVG path), its point and its box, in one map projection
//   public/geo/outline/XX.json   a country's detailed outline, for when the map zooms in
//   public/geo/cities/ab.json    city name -> [country, x, y], most populous first, split by the name's first letters
//   public/geo/regions.json      region code (TZ-02) -> name (Dar es Salaam)
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { geoArea, geoEqualEarth, geoPath } = require('d3-geo');
const { feature } = require('topojson-client');
const countries = require('i18n-iso-countries');
const iso3166 = require('iso-3166-2');
const world110 = require('world-atlas/countries-110m.json');
const world50 = require('world-atlas/countries-50m.json');
const allCities = require('all-the-cities');

const VIEW = { w: 1000, h: 520 };
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'geo');
const started = Date.now();

const toA2 = (numeric) => (numeric == null ? '' : countries.numericToAlpha2(String(numeric).padStart(3, '0')) ?? '');
const load = (topo) => feature(topo, topo.objects.countries).features.filter((f) => f.id !== '010'); // no Antarctica
const round = (n) => Math.round(n * 10) / 10;
export const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
export const shard = (name) => (norm(name).replace(/[^a-z0-9]/g, '').slice(0, 2) || '__').padEnd(2, '_');

/** The main landmass of a country, so France's point sits in France and not in the Atlantic. */
function mainland(f) {
  if (f.geometry.type !== 'MultiPolygon') return f;
  let best = f.geometry.coordinates[0], area = -1;
  for (const p of f.geometry.coordinates) {
    const a = geoArea({ type: 'Polygon', coordinates: p });
    if (a > area) { area = a; best = p; }
  }
  return { ...f, geometry: { type: 'Polygon', coordinates: best } };
}

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'outline'), { recursive: true });
mkdirSync(join(out, 'cities'), { recursive: true });

// ---------- the world, in the same projection the map has always used
const w110 = load(world110);
const projection = geoEqualEarth().fitExtent([[4, 4], [VIEW.w - 4, VIEW.h - 4]], { type: 'FeatureCollection', features: w110 });
const path = geoPath(projection).digits(1);
const land = [];
const points = {};   // code -> [x, y, x0, y0, x1, y1]
for (const f of w110) {
  const a2 = toA2(f.id), d = path(f);
  if (!d) continue;
  land.push({ id: a2 || f.properties.name, name: f.properties.name, d });
  if (!a2) continue;
  const main = mainland(f);
  const [x, y] = path.centroid(main), [[x0, y0], [x1, y1]] = path.bounds(main);
  if (Number.isFinite(x)) points[a2] = [x, y, x0, y0, x1, y1].map(round);
}

// countries too small for the world map (Singapore, Bahrain…): their biggest city
const biggest = {};
for (const c of allCities) if (!biggest[c.country] || c.population > biggest[c.country].population) biggest[c.country] = c;
for (const [code, c] of Object.entries(biggest)) {
  if (points[code]) continue;
  const p = projection(c.loc.coordinates);
  if (p) points[code] = [p[0], p[1], p[0] - 4, p[1] - 3, p[0] + 4, p[1] + 3].map(round);
}
writeFileSync(join(out, 'world.json'), JSON.stringify({ view: VIEW, land, points }));

// ---------- detailed outlines, one small file per country
const detailed = geoPath(projection).digits(2);
let outlines = 0;
for (const f of load(world50)) {
  const a2 = toA2(f.id), d = a2 && detailed(f);
  if (d) { writeFileSync(join(out, 'outline', `${a2}.json`), JSON.stringify({ d })); outlines++; }
}

// ---------- cities: name -> places, most populous first (the three biggest of each name)
const byName = new Map();
for (const c of allCities) {
  const k = norm(c.name);
  (byName.get(k) ?? byName.set(k, []).get(k)).push(c);
}
const shards = {};
for (const [k, list] of byName) {
  list.sort((a, b) => b.population - a.population);
  const places = [];
  for (const c of list.slice(0, 3)) {
    const p = projection(c.loc.coordinates);
    if (p) places.push([c.country, round(p[0]), round(p[1])]);
  }
  if (places.length) (shards[shard(k)] ??= {})[k] = places;
}
for (const [s, names] of Object.entries(shards)) writeFileSync(join(out, 'cities', `${s}.json`), JSON.stringify(names));

// ---------- region names
const regions = {};
for (const [cc, country] of Object.entries(iso3166.data)) for (const [code, sub] of Object.entries(country.sub ?? {})) if (sub?.name) regions[code] = sub.name;
writeFileSync(join(out, 'regions.json'), JSON.stringify(regions));

console.log(`geo: ${land.length} countries, ${outlines} outlines, ${byName.size} city names in ${Object.keys(shards).length} files, ${Object.keys(regions).length} regions (${Date.now() - started} ms)`);
