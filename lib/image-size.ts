import 'server-only';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Width and height of an image in /public, read from the file's own header
 * (JPEG or PNG) at build time, so layouts can use each photo's real shape
 * without anyone typing sizes in by hand.
 */
const cache = new Map<string, { w: number; h: number }>();

export function imageSize(src: string): { w: number; h: number } {
  const hit = cache.get(src);
  if (hit) return hit;
  let size = { w: 4, h: 5 };
  try {
    const b = readFileSync(join(process.cwd(), 'public', src));
    if (b[0] === 0x89 && b[1] === 0x50) {
      size = { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };           // PNG: IHDR
    } else if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;                                                         // JPEG: walk to a start-of-frame marker
      while (i < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const m = b[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
          size = { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
          break;
        }
        i += 2 + b.readUInt16BE(i + 2);
      }
    }
  } catch { /* missing file: fall back to 4:5 */ }
  cache.set(src, size);
  return size;
}
