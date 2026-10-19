import type { Row } from './insights-shared';
import { countryName, regionName, setRegionNames } from './insights-format';

/**
 * Everything the flat map needs, built in the browser from small files made once at build time
 * (scripts/build-geo.mjs → public/geo): country shapes, a point per visited country and city, and
 * the lists beside the map. Umami and the site's own database report cities without a country, so
 * each city is placed at the most populous place of that name, preferring countries with visitors.
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

type World = { view: typeof VIEW; land: { id: string; name: string; d: string }[]; points: Record<string, number[]> };
type CityFile = Record<string, [string, number, number][]>;

const cache = new Map<string, Promise<unknown>>();
function get<T>(url: string): Promise<T> {
  if (!cache.has(url)) cache.set(url, fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${url}: ${r.status}`)))).catch((e) => { cache.delete(url); throw e; }));
  return cache.get(url) as Promise<T>;
}
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const shard = (name: string) => (norm(name).replace(/[^a-z0-9]/g, '').slice(0, 2) || '__').padEnd(2, '_');

/** Loads region names once, so labels like "Dar es Salaam · Tanzania" work everywhere on the page. */
export async function loadRegionNames() {
  setRegionNames(await get<Record<string, string>>('/geo/regions.json'));
}

/** A country's detailed outline, for the zoomed-in map. */
export async function countryOutline(code: string) {
  return (await get<{ d: string }>(`/geo/outline/${code.toUpperCase()}.json`)).d;
}

export async function buildGeo(countryRows: Row[], regionRows: Row[], cityRows: Row[], liveRows: Row[] = []): Promise<GeoModel> {
  const named = cityRows.filter((r) => r.label);
  const [world, files] = await Promise.all([
    get<World>('/geo/world.json'),
    Promise.all([...new Set(named.map((r) => shard(r.label)))].map((s) => get<CityFile>(`/geo/cities/${s}.json`).catch(() => ({}) as CityFile))),
    loadRegionNames().catch(() => undefined),
  ]);
  const index: CityFile = Object.assign({}, ...files);

  const visited = new Map(countryRows.filter((r) => r.label).map((r) => [r.label.toUpperCase(), r.value]));
  const live = new Map(liveRows.filter((r) => r.label).map((r) => [r.label.toUpperCase(), r.value]));

  const countries: CountryPoint[] = [];
  visited.forEach((value, code) => {
    const p = world.points[code];
    if (p) countries.push({ code, name: countryName(code), value, live: live.get(code) ?? 0, x: p[0], y: p[1], box: [[p[2], p[3]], [p[4], p[5]]] });
  });
  countries.sort((a, b) => b.value - a.value);

  const cities: CityPoint[] = [];
  const unplaced: Place[] = [];
  named.forEach((r) => {
    const options = index[norm(r.label)] ?? [];
    const pick = options.find(([cc]) => visited.has(cc)) ?? options[0];
    if (pick) cities.push({ id: `${pick[0]}:${r.label}`, name: r.label, country: pick[0], value: r.value, x: pick[1], y: pick[2] });
    else unplaced.push({ name: r.label, value: r.value });
  });
  cities.sort((a, b) => b.value - a.value);

  const regions: Record<string, Place[]> = {};
  regionRows.filter((r) => r.label.includes('-')).forEach((r) => {
    const code = r.label.split('-')[0].toUpperCase();
    (regions[code] ??= []).push({ name: regionName(r.label), value: r.value });
  });

  return {
    land: world.land.map((s) => ({ id: s.id, d: s.d, value: visited.get(s.id) ?? 0 })),
    countries,
    cities,
    regions,
    unplaced,
    totals: {
      countries: visited.size,
      regions: regionRows.filter((r) => r.label).length,
      cities: named.length,
      visitors: countryRows.reduce((s, r) => s + r.value, 0),
    },
  };
}
