/**
 * The phone-sized copy of a photo (made at build time by scripts/build-thumbs.mjs), offered alongside
 * the original so the browser picks the smaller one on a phone. Only JPEGs in /images wider than 640px
 * have a copy; anything else gets no srcset and loads as before.
 */
export const THUMB_W = 640;

export function srcSet(src: string, w?: number): string | undefined {
  if (!w || w <= THUMB_W || !/^\/images\/.+\.jpe?g$/i.test(src)) return undefined;
  return `/_w/${THUMB_W}${src} ${THUMB_W}w, ${src} ${w}w`;
}

/** The phone-sized copy's address when there is one (for thumbnails and quick placeholders), else the original. */
export function thumbOf(src: string, w?: number): string {
  return srcSet(src, w) ? `/_w/${THUMB_W}${src}` : src;
}
