// A quick look at who visited lately: people versus robots, where from, on what, from which link.
// Reads DATABASE_URL from .env.local; prints counts only (no IP addresses are stored or shown).
// Run: node scripts/visitor-check.mjs [days]
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split(/\r?\n/).filter((l) => /^\w+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).replace(/^"|"$/g, '')]));
const sql = neon(env.DATABASE_URL);
const days = Number(process.argv[2] || 7);

const cols = (await sql`select column_name from information_schema.columns where table_name = 'visits_events' order by ordinal_position`).map((r) => r.column_name);
console.log('columns:', cols.join(', '));
const has = (c) => cols.includes(c);
const since = sql`now() - make_interval(days => ${days})`;
const ts = has('created_at') ? 'created_at' : has('at') ? 'at' : has('ts') ? 'ts' : cols.find((c) => /time|date|_at$/.test(c));
console.log('time column:', ts);
const q = (text) => sql.query(text, [days]);
const where = `${ts} > now() - make_interval(days => $1)`;
const vis = has('visitor') ? 'visitor' : has('visitor_id') ? 'visitor_id' : has('session') ? 'session' : has('session_id') ? 'session_id' : null;

console.log(`\n--- last ${days} days`);
console.log(await q(`select robot, count(*) as views${vis ? `, count(distinct ${vis}) as visitors` : ''} from visits_events where ${where} group by robot`));
for (const c of ['country', 'city', 'network', 'device', 'os', 'browser', 'referrer', 'ref', 'source', 'screen', 'path']) {
  if (!has(c)) continue;
  console.log(`\n--- people by ${c}`);
  console.log(await q(`select ${c}, count(*) as views${vis ? `, count(distinct ${vis}) as visitors` : ''} from visits_events where ${where} and not robot group by ${c} order by 2 desc limit 12`));
}
if (has('country')) {
  console.log('\n--- robots by country / network');
  console.log(await q(`select country${has('network') ? ', network' : ''}, count(*) as views from visits_events where ${where} and robot group by 1${has('network') ? ', 2' : ''} order by views desc limit 10`));
}
