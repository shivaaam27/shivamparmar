// The product editor: a small page on this computer for changing the words on the Products page and the
// home page's Hub & Products screen. It reads and saves content/products.json; nothing else is touched.
// Start it with `npm run products:edit`, then open http://localhost:8793. Plain Node, no packages.
import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const FILE = fileURLToPath(new URL('../content/products.json', import.meta.url));
const PORT = Number(process.env.PORT || 8793);

const page = /* html */ `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Product editor</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600&family=Hanken+Grotesk:wght@400;500;600&display=swap">
<style>
  :root { --ink:#141517; --soft:#5E6064; --paper:#FFFFFF; --card:#F4F4F1; --line:rgba(20,21,23,.12); --sage:#4F7A5A; --mint:#E3ECE5; --bad:#B9483C; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 15px/1.5 'Hanken Grotesk', system-ui, sans-serif; }
  header { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 14px 20px; background: rgba(255,255,255,.92); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
  header h1 { margin: 0; font: 600 18px/1.2 Sora, sans-serif; }
  header .bar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .state { color: var(--soft); font-size: 13px; }
  .state.ok { color: var(--sage); } .state.bad { color: var(--bad); }
  button, .btn { border: 0; border-radius: 99px; padding: 10px 18px; font: 600 14px/1 'Hanken Grotesk', sans-serif; cursor: pointer; background: var(--ink); color: #fff; text-decoration: none; }
  .btn.line, button.line { background: #fff; color: var(--ink); box-shadow: inset 0 0 0 1px var(--line); }
  button:disabled { opacity: .45; cursor: default; }
  main { max-width: 980px; margin: 0 auto; padding: 24px 20px 80px; display: grid; gap: 16px; }
  .card { background: var(--card); border-radius: 20px; padding: 18px; display: grid; gap: 12px; }
  .card h2 { margin: 0; font: 600 13px/1.2 'Hanken Grotesk'; letter-spacing: .04em; text-transform: uppercase; color: var(--soft); }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  label { display: grid; gap: 5px; font-size: 12px; font-weight: 600; color: var(--soft); text-transform: uppercase; letter-spacing: .03em; }
  input, textarea { width: 100%; border: 1px solid var(--line); border-radius: 12px; padding: 11px 12px; font: 16px/1.45 'Hanken Grotesk', sans-serif; color: var(--ink); background: #fff; text-transform: none; letter-spacing: 0; }
  textarea { min-height: 76px; resize: vertical; }
  input:focus, textarea:focus { outline: none; border-color: var(--sage); box-shadow: 0 0 0 3px var(--mint); }
  .lock { display: flex; align-items: center; gap: 10px; }
  .lock svg { width: 34px; height: 34px; flex: none; }
  .lock .wm { font: 600 19px/1 Sora, sans-serif; letter-spacing: .12em; }
  .lock .wm span { font-weight: 300; color: #7E8082; margin-left: .22em; }
  .lock .sub { font: 600 10px/1 Sora, sans-serif; letter-spacing: .3em; color: var(--sage); text-transform: uppercase; margin-top: 6px; }
  .top { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  .count { font-size: 12px; color: var(--soft); }
  .tools { display: flex; gap: 6px; }
  .tools button { padding: 7px 11px; font-size: 12px; }
  .hint { color: var(--soft); font-size: 13px; margin: 0; }
  @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }
</style></head>
<body>
<header>
  <h1>Product editor</h1>
  <div class="bar">
    <span class="state" id="state">Loading…</span>
    <a class="btn line" href="http://localhost:3212/products" target="_blank" rel="noopener">See Products page</a>
    <button id="save" disabled>Save</button>
  </div>
</header>
<main id="main"></main>
<script>
const MARK = '<svg viewBox="0 0 100 100"><g transform="rotate(15 50 50)">' + [[18,64],[64,18],[18,41],[41,18],[41,41],[18,18,1]].map(([x,y,l]) => '<rect x="'+x+'" y="'+y+'" width="18" height="18" rx="4.5" fill="'+(l?'#4F7A5A':'#141517')+'"/>').join('') + '</g></svg>';
let data, dirty = false;
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const state = (t, cls = '') => { const s = $('#state'); s.textContent = t; s.className = 'state ' + cls; };
const touch = () => { dirty = true; $('#save').disabled = false; state('Not saved yet'); };

function render() {
  const c = data.copy;
  $('#main').innerHTML = \`
    <section class="card"><h2>Page and home screen</h2>
      <div class="grid">
        <label>Title, first line<input data-k="copy.title.0" value="\${esc(c.title[0])}"></label>
        <label>Title, second line<input data-k="copy.title.1" value="\${esc(c.title[1])}"></label>
      </div>
      <label>Intro on the Products page<textarea data-k="copy.lead">\${esc(c.lead)}</textarea></label>
      <div class="grid">
        <label>Small label above the title<input data-k="copy.tag" value="\${esc(c.tag)}"></label>
        <label>Button text<input data-k="copy.link.label" value="\${esc(c.link.label)}"></label>
      </div>
    </section>
    <p class="hint">Each card below is one product. The name is the small green word under the logo; the title is the bold line on the Products page. Platforms: separate with commas.</p>
    \${data.products.map((p, i) => \`
      <section class="card" data-i="\${i}">
        <div class="top">
          <div class="lock">\${MARK}<div><div class="wm">SHIVO<span>LABS</span></div><div class="sub">\${esc(p.name)}</div></div></div>
          <div class="tools">
            <button class="line" data-move="-1" \${i === 0 ? 'disabled' : ''} title="Move up">↑</button>
            <button class="line" data-move="1" \${i === data.products.length - 1 ? 'disabled' : ''} title="Move down">↓</button>
          </div>
        </div>
        <div class="grid">
          <label>Name under the logo<input data-k="products.\${i}.name" value="\${esc(p.name)}"></label>
          <label>Title<input data-k="products.\${i}.line" value="\${esc(p.line)}"></label>
        </div>
        <label>Description <span class="count" data-count="\${i}"></span><textarea data-k="products.\${i}.text">\${esc(p.text)}</textarea></label>
        <label>Platforms<input data-k="products.\${i}.on" value="\${esc(p.on.join(', '))}"></label>
      </section>\`).join('')}\`;
  data.products.forEach((p, i) => count(i));
}
function count(i) { const el = $('[data-count="' + i + '"]'); if (el) el.textContent = '· ' + data.products[i].text.length + ' characters'; }
function set(path, value) {
  const keys = path.split('.'); let o = data;
  keys.slice(0, -1).forEach((k) => { o = o[k]; });
  const last = keys[keys.length - 1];
  o[last] = last === 'on' ? value.split(',').map((x) => x.trim()).filter(Boolean) : value;
}
document.addEventListener('input', (e) => {
  const k = e.target.dataset && e.target.dataset.k; if (!k) return;
  set(k, e.target.value); touch();
  const m = k.match(/^products\\.(\\d+)\\.(name|text)$/);
  if (m && m[2] === 'name') e.target.closest('.card').querySelector('.sub').textContent = e.target.value;
  if (m && m[2] === 'text') count(+m[1]);
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-move]'); if (!b) return;
  const i = +b.closest('.card').dataset.i, j = i + +b.dataset.move;
  [data.products[i], data.products[j]] = [data.products[j], data.products[i]]; touch(); render();
});
$('#save').addEventListener('click', async () => {
  $('#save').disabled = true; state('Saving…');
  try {
    const r = await fetch('/save', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'Could not save');
    dirty = false; state('Saved. Refresh the Products page to see it.', 'ok');
  } catch (err) { state(err.message, 'bad'); $('#save').disabled = false; }
});
document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); if (dirty) $('#save').click(); } });
window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
fetch('/data').then((r) => r.json()).then((d) => { data = d; render(); state('All saved'); });
</script>
</body></html>`;

function check(d) {
  if (!d || typeof d !== 'object' || !d.copy || !Array.isArray(d.products)) return 'The data is not in the right shape.';
  if (!Array.isArray(d.copy.title) || d.copy.title.length !== 2) return 'The title needs two lines.';
  for (const [i, p] of d.products.entries()) {
    for (const k of ['slug', 'name', 'line', 'text']) if (typeof p[k] !== 'string' || !p[k].trim()) return `Product ${i + 1}: "${k === 'line' ? 'title' : k}" is empty.`;
    if (!Array.isArray(p.on) || !p.on.length) return `Product ${i + 1}: add at least one platform.`;
  }
  return '';
}

createServer((req, res) => {
  const send = (code, body, type = 'application/json') => { res.writeHead(code, { 'content-type': `${type}; charset=utf-8`, 'cache-control': 'no-store' }); res.end(body); };
  if (req.method === 'GET' && req.url === '/') return send(200, page, 'text/html');
  if (req.method === 'GET' && req.url === '/data') return send(200, readFileSync(FILE, 'utf8'));
  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 1e6) req.destroy(); });
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
}).listen(PORT, '127.0.0.1', () => console.log(`Product editor: http://localhost:${PORT}`));
