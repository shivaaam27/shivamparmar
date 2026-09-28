import 'server-only';
import { geoArea, geoEqualEarth, geoPath, type GeoProjection } from 'd3-geo';
import { feature } from 'topojson-client';
import countries from 'i18n-iso-countries';
import iso3166 from 'iso-3166-2';
import type { Feature, Geometry, MultiPolygon, Polygon } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import world110 from 'world-atlas/countries-110m.json';
import world50 from 'world-atlas/countries-50m.json';
import type { Row } from './umami';

/**
 * Everything the flat map needs, in one world projection so zooming is just
 * scaling: country shapes, a point per visited country and city, and the
 * lists beside the map. Umami and the site's own database both report cities
 * without a country, so each city is placed at the most populous place of
 * that name, preferring countries the site has visitors from.
 */

export const VIEW = { w: 1000, h: 520 } as const;

type Box = [[number, number], [number, number]];
export type Land = { id: string; d: string; value: number };
export type CountryPoint = { code: string; name: string; value: number; live: number; x: number; y: number; box: Box };
export type CityPoint = { id: string; name: string; country: string; value: number; x: number; y: number };
export type Place = { name: string; value: number };

export type GeoModel = {
  land: Land[];
  countries: CountryPoint[];            // visited countries, most first
  cities: CityPoint[];                  // placed cities, most first
  regions: Record<string, Place[]>;     // by country code
  unplaced: Place[];
  totals: { countries: number; regions: number; cities: number; visitors: number };
};

type F = Feature<Geometry, { name: string }>;
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
export const countryName = (a2: string) => { try { return regionNames.of(a2.toUpperCase()) ?? a2; } catch { return a2; } };
const toA2 = (numeric: unknown) => (numeric == null ? '' : countries.numericToAlpha2(String(numeric).padStart(3, '0')) ?? '');
const load = (topo: unknown) => {
  const t = topo as Topology<{ countries: GeometryCollection<{ name: string }> }>;
  return (feature(t, t.objects.countries).features as F[]).filter((f) => f.id !== '010'); // no Antarctica
};

/** The main landmass of a country, so France's point sits in France and not in the Atlantic. */
function mainland(f: F): F {
  if (f.geometry.type !== 'MultiPolygon') return f;
  let best = (f.geometry as MultiPolygon).coordinates[0];
  let area = -1;
  for (const p of (f.geometry as MultiPolygon).coordinates) {
    const a = geoArea({ type: 'Polygon', coordinates: p } as Polygon);
    if (a > area) { area = a; best = p; }
  }
  return { ...f, geometry: { type: 'Polygon', coordinates: best } };
}

let base: { w110: F[]; projection: GeoProjection; land: { a2: string; name: string; d: string }[] } | null = null;
function world() {
  if (base) return base;
  const w110 = load(world110);
  const projection = geoEqualEarth().fitExtent([[4, 4], [VIEW.w - 4, VIEW.h - 4]], { type: 'FeatureCollection', features: w110 });
  const path = geoPath(projection).digits(1);
  base = { w110, projection, land: w110.map((f) => ({ a2: toA2(f.id), name: f.properties.name, d: path(f) ?? '' })).filter((s) => s.d) };
  return base;
}

/** A country's detailed (1:50m) outline in the same projection, for when the map zooms in. */
const outlineCache = new Map<string, string>();
export function countryOutline(a2: string) {
  if (outlineCache.has(a2)) return outlineCache.get(a2)!;
  const f = load(world50).find((x) => toA2(x.id) === a2);
  const d = f ? geoPath(world().projection).digits(2)(f) ?? '' : '';
  outlineCache.set(a2, d);
  return d;
}

/* ---------- cities: name → places, most populous first ---------- */
type City = { name: string; country: string; population: number; loc: { coordinates: [number, number] } };
let cityIndex: Map<string, City[]> | null = null;
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
function cityList() {
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

export function regionName(code: string) {
  const sub = iso3166.subdivision(code.toUpperCase());
  return (sub && 'name' in sub && sub.name) || code.split('-')[1] || code;
}

export function buildGeo(countryRows: Row[], regionRows: Row[], cityRows: Row[], liveRows: Row[] = []): GeoModel {
  const { w110, projection, land } = world();
  const path = geoPath(projection);
  const visited = new Map(countryRows.filter((r) => r.label).map((r) => [r.label.toUpperCase(), r.value]));
  const live = new Map(liveRows.filter((r) => r.label).map((r) => [r.label.toUpperCase(), r.value]));
  const index = cityList();

  const points: CountryPoint[] = [];
  visited.forEach((value, code) => {
    const f = w110.find((x) => toA2(x.id) === code);
    let xy: [number, number] | null = null;
    let box: Box | null = null;
    if (f) {
      const main = mainland(f);
      xy = path.centroid(main) as [number, number];
      box = path.bounds(main) as Box;
    } else {
      // too small for the world map (Singapore, Bahrain…): use its biggest city
      let best: City | null = null;
      index.forEach((list) => list.forEach((c) => { if (c.country === code && (!best || c.population > best.population)) best = c; }));
      const found = best as City | null;
      const p = found ? projection(found.loc.coordinates) : null;
      if (p) { xy = [p[0], p[1]]; box = [[p[0] - 4, p[1] - 3], [p[0] + 4, p[1] + 3]]; }
    }
    if (xy && box && Number.isFinite(xy[0])) points.push({ code, name: countryName(code), value, live: live.get(code) ?? 0, x: xy[0], y: xy[1], box });
  });
  points.sort((a, b) => b.value - a.value);

  const cities: CityPoint[] = [];
  const unplaced: Place[] = [];
  cityRows.filter((r) => r.label).forEach((r) => {
    const options = index.get(norm(r.label)) ?? [];
    const pick = options.find((c) => visited.has(c.country)) ?? options[0];
    const p = pick ? projection(pick.loc.coordinates) : null;
    if (pick && p) cities.push({ id: `${pick.country}:${r.label}`, name: r.label, country: pick.country, value: r.value, x: p[0], y: p[1] });
    else unplaced.push({ name: r.label, value: r.value });
  });
  cities.sort((a, b) => b.value - a.value);

  const regions: Record<string, Place[]> = {};
  regionRows.filter((r) => r.label.includes('-')).forEach((r) => {
    const code = r.label.split('-')[0].toUpperCase();
    (regions[code] ??= []).push({ name: regionName(r.label), value: r.value });
  });

  return {
    land: land.map((s) => ({ id: s.a2 || s.name, d: s.d, value: visited.get(s.a2) ?? 0 })),
    countries: points,
    cities,
    regions,
    unplaced,
    totals: {
      countries: visited.size,
      regions: regionRows.filter((r) => r.label).length,
      cities: cityRows.filter((r) => r.label).length,
      visitors: countryRows.reduce((s, r) => s + r.value, 0),
    },
  };
}
