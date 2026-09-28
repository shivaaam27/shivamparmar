import 'server-only';
import { dbConfigured } from './db';
import { fromDb } from './insights-db';
import { fromUmami, sample, umamiConnected, type Insights, type RangeKey } from './umami';

export type Source = 'own' | 'umami';
export const toSource = (v?: string | string[] | null): Source | undefined => (v === 'own' || v === 'umami' ? v : undefined);

/** Your own database is the default once it's connected; Umami otherwise. */
export const defaultSource = (): Source => (dbConfigured() ? 'own' : 'umami');

/**
 * The dashboard's data from the chosen source. If that source can't be read,
 * fall back to the other one (and say so), and only then to sample data.
 */
export async function getInsights(range: RangeKey, wanted: Source = defaultSource()): Promise<Insights> {
  const tryOwn = async () => (dbConfigured() ? fromDb(range) : Promise.reject(new Error('no database connected')));
  const tryUmami = async () => (umamiConnected() ? fromUmami(range) : Promise.reject(new Error('UMAMI_SHARE_ID is not set')));
  const [first, second, firstName, secondName] = wanted === 'own'
    ? [tryOwn, tryUmami, 'your database', 'Umami'] as const
    : [tryUmami, tryOwn, 'Umami', 'your database'] as const;

  let firstError: Error;
  try {
    return await first();
  } catch (e) {
    firstError = e as Error;
  }
  try {
    const data = await second();
    return { ...data, note: `Couldn't read ${firstName} (${firstError.message}), so this is from ${secondName}.` };
  } catch (e) {
    return sample(range, `Couldn't read ${firstName} (${firstError.message}) or ${secondName} (${(e as Error).message}), so this is sample data.`);
  }
}
