import 'server-only';
import { geoArea, geoEqualEarth, geoMercator, geoPath, type GeoProjection } from 'd3-geo';
import { feature } from 'topojson-client';
import countries from 'i18n-iso-countries';
import iso3166 from 'iso-3166-2';
import type { Feature, Geometry, MultiPolygon, Polygon } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import world110 from 'world-atlas/countries-110m.json';
import world50 from 'world-atlas/countries-50m.json';
import type { Row } from './umami';

/**
 * Turns Umami's country / region / city lists into flat 2D shapes and points
 * for the 3D map. The browser tilts the plane and raises the bars; here we
 * only project, place and name things. Umami gives cities without a country,
 * so each city is placed at the most populous place of that name, preferring
 * countries the site actually has visitors from.
 */

export const VIEW = { w: 1000, h: 560 } as const;

export type Shape = { id: string; d: string; value: number; name: string };
export type Bar = { id: string; name: string; value: number; x: number; y: number };
export type Place = { name: string; value: number };

export type CountryDetail = {
  code: string;
  name: string;
  value: number;
  land: Shape[];          // the country itself (value > 0) and its neighbours (value 0) for context
  bars: Bar[];            // one per placed city
  regions: Place[];
  cities: Place[];
};

export type GeoModel = {
  world: { land: Shape[]; bars: Bar[] };
  countries: CountryDetail[];   // countries with visitors, most first
  unplaced: Place[];            // cities we couldn't place on the map
  totals: { countries: number; regions: number; cities: number };
};

type F = Feature<Geometry, { name: string }>;
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
export const countryName = (a2: string) => { try { return regionNames.of(a2.toUpperCase()) ?? a2; } catch { return a2; } };

const toA2 = (numeric: unknown) => (numeric == null ? '' : countries.numericToAlpha2(String(numeric).padStart(3, '0')) ?? '');
const load = (topo: unknown) => {
  const t = topo as Topology<{ countries: GeometryCollection<{ name: string }> }>;
  return (feature(t, t.objects.countries).features as F[]).filter((f) => f.id !== '010'); // no Antarctica
};

let cache: { w110: F[]; w50: F[]; world: GeoProjection; worldLand: { a2: string; d: string; name: string }[] } | null = null;
function base() {
  if (cache) return cache;
  const w110 = load(world110);
  const w50 = load(world50);
  const world = geoEqualEarth().fitExtent([[8, 8], [VIEW.w - 8, VIEW.h - 8]], { type: 'FeatureCollection', features: w110 });
  const path = geoPath(world).digits(1);
  const worldLand = w110.map((f) => ({ a2: toA2(f.id), d: path(f) ?? '', name: f.properties.name })).filter((s) => s.d);
  cache = { w110, w50, world, worldLand };
  return cache;
}

/** The main landmass of a country, so France's bar sits in France and not in the Atlantic. */
function mainland(f: F): F {
  if (f.geometry.type !== 'MultiPolygon') return f;
  const polys = (f.geometry as MultiPolygon).coordinates;
  let best = polys[0];
  let area = -1;
  for (const p of polys) {
    const a = geoArea({ type: 'Polygon', coordinates: p } as Polygon);
    if (a > area) { area = a; best = p; }
  }
  return { ...f, geometry: { type: 'Polygon', coordinates: best } };
}

const detailCache = new Map<string, { land: { a2: string; d: string; name: string }[]; projection: GeoProjection }>();
function countryShapes(a2: string) {
  const hit = detailCache.get(a2);
  if (hit) return hit;
  const { w50 } = base();
  const self = w50.find((f) => toA2(f.id) === a2);
  if (!self) return null;
  const pad = 70;
  const projection = geoMercator().fitExtent([[pad, pad], [VIEW.w - pad, VIEW.h - pad]], mainland(self));
  projection.clipExtent([[-40, -40], [VIEW.w + 40, VIEW.h + 40]]);
  const path = geoPath(projection).digits(1);
  const land = w50
    .map((f) => ({ a2: toA2(f.id), d: path(f) ?? '', name: f.properties.name }))
    .filter((s) => s.d && s.d.length > 20);
  const out = { land, projection };
  detailCache.set(a2, out);
  return out;
}

/* ---------- cities: name → [lng, lat], most populous first ---------- */
type City = { name: string; country: string; population: number; loc: { coordinates: [number, number] } };
let cityIndex: Map<string, City[]> | null = null;
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
function cities() {
  if (cityIndex) return cityIndex;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const all = require('all-the-cities') as City[];
  cityIndex = new Map();
  for (const c of all) {
    const k = norm(c.name);
    const list = cityIndex.get(k);
    if (list) list.push(c); else cityIndex.set(k, [c]);
  }
  cityIndex.forEach((list) => list.sort((a, b) => b.population - a.population));
  return cityIndex;
}

function regionName(code: string) {
  const sub = iso3166.subdivision(code);
  return (sub && 'name' in sub && sub.name) || code.split('-')[1] || code;
}

export function buildGeo(countryRows: Row[], regionRows: Row[], cityRows: Row[], detailFor = 6): GeoModel {
  const { w110, world, worldLand } = base();
  const visited = new Map(countryRows.filter((r) => r.label).map((r) => [r.label.toUpperCase(), r.value]));

  // world: countries shaded, one bar per country at its mainland's centre
  const worldPath = geoPath(world);
  const land: Shape[] = worldLand.map((s) => ({ id: s.a2 || s.name, d: s.d, value: visited.get(s.a2) ?? 0, name: s.a2 ? countryName(s.a2) : s.name }));
  const worldBars: Bar[] = [];
  visited.forEach((value, a2) => {
    const f = w110.find((x) => toA2(x.id) === a2);
    let xy: [number, number] | null = null;
    if (f) xy = worldPath.centroid(mainland(f)) as [number, number];
    else {
      // too small for the 110m map (Singapore, Bahrain…): use its biggest city
      const c = [...cities().values()].flat().find((c) => c.country === a2);
      if (c) xy = world(c.loc.coordinates) as [number, number];
    }
    if (xy && Number.isFinite(xy[0])) worldBars.push({ id: a2, name: countryName(a2), value, x: xy[0], y: xy[1] });
  });

  // cities: pick a country for each, preferring ones with visitors
  const index = cities();
  const placedCities: { name: string; value: number; country: string; lnglat: [number, number] }[] = [];
  const unplaced: Place[] = [];
  cityRows.filter((r) => r.label).forEach((r) => {
    const options = index.get(norm(r.label)) ?? [];
    const pick = options.find((c) => visited.has(c.country)) ?? options[0];
    if (pick) placedCities.push({ name: r.label, value: r.value, country: pick.country, lnglat: pick.loc.coordinates });
    else unplaced.push({ name: r.label, value: r.value });
  });

  // detail for the busiest countries
  const detail: CountryDetail[] = [];
  [...visited.entries()].sort((a, b) => b[1] - a[1]).slice(0, detailFor).forEach(([a2, value]) => {
    const shapes = countryShapes(a2);
    const regions = regionRows.filter((r) => r.label.toUpperCase().startsWith(`${a2}-`)).map((r) => ({ name: regionName(r.label.toUpperCase()), value: r.value }));
    const own = placedCities.filter((c) => c.country === a2);
    const bars: Bar[] = shapes
      ? own.map((c) => {
          const [x, y] = shapes.projection(c.lnglat) ?? [NaN, NaN];
          return { id: `${a2}:${c.name}`, name: c.name, value: c.value, x, y };
        }).filter((b) => Number.isFinite(b.x) && b.x > -20 && b.x < VIEW.w + 20 && b.y > -20 && b.y < VIEW.h + 20)
      : [];
    detail.push({
      code: a2,
      name: countryName(a2),
      value,
      land: shapes ? shapes.land.map((s) => ({ id: s.a2 || s.name, d: s.d, value: s.a2 === a2 ? value : 0, name: s.a2 ? countryName(s.a2) : s.name })) : [],
      bars,
      regions,
      cities: own.map((c) => ({ name: c.name, value: c.value })),
    });
  });

  return {
    world: { land, bars: worldBars },
    countries: detail,
    unplaced,
    totals: { countries: visited.size, regions: regionRows.filter((r) => r.label).length, cities: cityRows.filter((r) => r.label).length },
  };
}
