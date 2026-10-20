// Phone-sized copies of every photo, made at build time (never committed): public/_w/640/images/… for each
// public/images/….jpg wider than 640px. Pages offer them through srcset (lib/thumb.ts), so a phone downloads
// a ~80 KB picture instead of the 400–500 KB original; big screens still get the original.
// Only copies that are missing or older than their original are made, so repeat builds are quick.
import { mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('../public/', import.meta.url));
const SRC = join(ROOT, 'images');
const W = 640;

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]));
const files = walk(SRC).filter((f) => /\.jpe?g$/i.test(f));
let made = 0;
for (const f of files) {
  const out = join(ROOT, '_w', String(W), 'images', relative(SRC, f));
  if (existsSync(out) && statSync(out).mtimeMs >= statSync(f).mtimeMs) continue;
  const meta = await sharp(f).metadata();
  if (!meta.width || meta.width <= W) continue;
  mkdirSync(dirname(out), { recursive: true });
  await sharp(f).rotate().resize({ width: W }).jpeg({ quality: 74, mozjpeg: true, progressive: true }).toFile(out);
  made++;
}
console.log(`thumbs: ${made} made, ${files.length} photos checked`);
