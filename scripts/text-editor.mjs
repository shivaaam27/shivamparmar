// The text editor: a small page on this computer for changing the words typed on the site (titles, descriptions,
// small lines). It reads and saves content/site-text.json; nothing else is touched.
// Start it with `npm run text:edit`, then open http://localhost:8794. Plain Node, no packages.
// (The Products have their own editor: `npm run products:edit`. The Journal posts are files in content/journal.)
import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const FILE = fileURLToPath(new URL('../content/site-text.json', import.meta.url));
const PORT = Number(process.env.PORT || 8794);
const SITE = process.env.SITE || 'http://localhost:3210';

const page = /* html */ `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Text editor</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600&family=Hanken+Grotesk:wght@400;500;600&display=swap">
<style>
  :root { --ink:#141517; --soft:#5E6064; --paper:#FFFFFF; --card:#F4F4F1; --line:rgba(20,21,23,.12); --sage:#4F7A5A; --mint:#E3ECE5; --bad:#B9483C; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 15px/1.5 'Hanken Grotesk', system-ui, sans-serif; }
  header { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 14px 20px; background: rgba(255,255,255,.92); backdrop-filter: blur(14px); border-bottom: 1px solid var(--line); flex-wrap: wrap; }
  header h1 { margin: 0; font: 600 18px/1.2 Sora, sans-serif; }
  header .bar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .state { color: var(--soft); font-size: 13px; }
  .state.ok { color: var(--sage); } .state.bad { color: var(--bad); }
  button, .btn { border: 0; border-radius: 10px; padding: 10px 18px; font: 600 14px/1 'Hanken Grotesk', sans-serif; cursor: pointer; background: var(--ink); color: #fff; text-decoration: none; display: inline-block; }
  .btn.line, button.line { background: #fff; color: var(--ink); box-shadow: inset 0 0 0 1px var(--line); }
  button:disabled { opacity: .45; cursor: default; }
  main { max-width: 980px; margin: 0 auto; padding: 24px 20px 80px; display: grid; gap: 18px; }
  .hint { color: var(--soft); font-size: 14px; margin: 0; max-width: 46rem; }
  .hint code { background: var(--card); padding: 1px 6px; border-radius: 6px; }
  .search { width: 100%; max-width: 340px; border: 1px solid var(--line); border-radius: 10px; padding: 9px 12px; font: 15px 'Hanken Grotesk', sans-serif; }
  .card { background: var(--card); border-radius: 18px; padding: 20px; display: grid; gap: 16px; }
  .card > .top { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
  .card h2 { margin: 0; font: 600 20px/1.2 Sora, sans-serif; }
  .item { display: grid; gap: 6px; }
  .item[hidden] { display: none; }
  label { font-size: 13px; font-weight: 600; color: var(--soft); }
  input, textarea { width: 100%; border: 1px solid var(--line); border-radius: 12px; padding: 11px 12px; font: 16px/1.5 'Hanken Grotesk', sans-serif; color: var(--ink); background: #fff; }
  textarea { min-height: 78px; resize: vertical; }
  textarea.lines { min-height: 0; }
  input:focus, textarea:focus { outline: none; border-color: var(--sage); box-shadow: 0 0 0 3px var(--mint); }
  .note { font-size: 12px; color: var(--soft); }
  .empty { color: var(--soft); }
</style></head>
<body>
<header>
  <h1>Text editor</h1>
  <div class="bar">
    <input class="search" id="q" type="search" placeholder="Search the text…">
    <span class="state" id="state">Loading…</span>
    <button id="save" disabled>Save</button>
  </div>
</header>
<main id="main"></main>
<script>
let data, dirty = false;
const SITE = ${JSON.stringify(SITE)};
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const state = (t, cls = '') => { const s = $('#state'); s.textContent = t; s.className = 'state ' + cls; };
const touch = () => { dirty = true; $('#save').disabled = false; state('Not saved yet'); };

function field(i, gi, ii) {
  const id = 'f-' + gi + '-' + ii;
  const hint = i.kind === 'lines' ? '<span class="note">One line per row.</span>' : i.kind === 'text' ? '<span class="note">Put [[double brackets]] around words that should stand out (bold).</span>' : '';
  if (i.kind === 'line') return '<div class="item" data-find="' + esc((i.label + ' ' + i.value).toLowerCase()) + '"><label for="' + id + '">' + esc(i.label) + '</label><input id="' + id + '" data-g="' + gi + '" data-i="' + ii + '" value="' + esc(i.value) + '"></div>';
  const v = i.kind === 'lines' ? i.value.join('\\n') : i.value;
  const rows = i.kind === 'lines' ? Math.max(2, i.value.length) : Math.max(3, Math.ceil(v.length / 80));
  return '<div class="item" data-find="' + esc((i.label + ' ' + v).toLowerCase()) + '"><label for="' + id + '">' + esc(i.label) + '</label><textarea class="' + (i.kind === 'lines' ? 'lines' : '') + '" id="' + id + '" rows="' + rows + '" data-g="' + gi + '" data-i="' + ii + '">' + esc(v) + '</textarea>' + hint + '</div>';
}
function render() {
  $('#main').innerHTML =
    '<p class="hint">Each box is one piece of text on the site, named by what it is. Change the words, press <b>Save</b> (or Ctrl+S), and refresh the page to see it. Words in <code>[[double brackets]]</code> stand out in bold. The Products have their own editor and the Journal posts are files in the content/journal folder.</p>' +
    data.groups.map((g, gi) =>
      '<section class="card" data-group="' + gi + '"><div class="top"><h2>' + esc(g.title) + '</h2><a class="btn line" href="' + SITE + g.page + '" target="_blank" rel="noopener">Open the page</a></div>' +
      g.items.map((i, ii) => field(i, gi, ii)).join('') + '</section>').join('');
}
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'q') { filter(t.value); return; }
  if (t.dataset.g === undefined) return;
  const item = data.groups[+t.dataset.g].items[+t.dataset.i];
  item.value = item.kind === 'lines' ? t.value.split('\\n').map((x) => x.trim()).filter(Boolean) : t.value;
  touch();
});
function filter(q) {
  q = q.trim().toLowerCase();
  document.querySelectorAll('.card').forEach((c) => {
    let any = false;
    c.querySelectorAll('.item').forEach((it) => { const hit = !q || it.dataset.find.includes(q); it.hidden = !hit; if (hit) any = true; });
    c.hidden = !any;
  });
}
$('#save').addEventListener('click', async () => {
  $('#save').disabled = true; state('Saving…');
  try {
    const r = await fetch('/save', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'Could not save');
    dirty = false; state('Saved. Refresh the page to see it.', 'ok');
  } catch (err) { state(err.message, 'bad'); $('#save').disabled = false; }
});
document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); if (dirty) $('#save').click(); } });
window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
fetch('/data').then((r) => r.json()).then((d) => { data = d; render(); state('All saved'); });
</script>
</body></html>`;

function check(d) {
  if (!d || !Array.isArray(d.groups)) return 'The data is not in the right shape.';
  for (const g of d.groups) {
    for (const i of g.items) {
      if (i.kind === 'lines') { if (!Array.isArray(i.value) || !i.value.length) return `"${i.label}" needs at least one line.`; }
      else if (typeof i.value !== 'string' || !i.value.trim()) return `"${i.label}" is empty.`;
      if (typeof i.value === 'string' && (i.value.split('[[').length !== i.value.split(']]').length)) return `"${i.label}": the [[double brackets]] do not match.`;
    }
  }
  return '';
}

createServer((req, res) => {
  const send = (code, body, type = 'application/json') => { res.writeHead(code, { 'content-type': `${type}; charset=utf-8`, 'cache-control': 'no-store' }); res.end(body); };
  if (req.method === 'GET' && req.url === '/') return send(200, page, 'text/html');
  if (req.method === 'GET' && req.url === '/data') return send(200, readFileSync(FILE, 'utf8'));
  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 2e6) req.destroy(); });
    req.on('end', () => {
      try {
        const d = JSON.parse(body); const bad = check(d);
        if (bad) return send(400, JSON.stringify({ error: bad }));
        writeFileSync(FILE, JSON.stringify(d, null, 2) + '\n');
        send(200, JSON.stringify({ ok: true }));
      } catch { send(400, JSON.stringify({ error: 'Could not read what was sent.' })); }
    });
    return;
  }
  send(404, JSON.stringify({ error: 'Not found' }));
}).listen(PORT, '127.0.0.1', () => console.log(`Text editor: http://localhost:${PORT}`));
