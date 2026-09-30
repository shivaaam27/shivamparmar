'use client';

import { useEffect } from 'react';

/** Is the pointer over a photo or video? Images ignore the pointer (see globals.css), so test their boxes. */
function overMedia(x: number, y: number) {
  for (const el of document.querySelectorAll('img, video')) {
    const r = el.getBoundingClientRect();
    if (r.width && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return true;
  }
  return false;
}

/**
 * Makes the photographs awkward to take: no right-click menu on them, no dragging them out,
 * no Ctrl/Cmd+S. It can't stop a screenshot, so every file also carries its copyright notice.
 */
export default function ImageGuard() {
  useEffect(() => {
    const menu = (e: MouseEvent) => { if (overMedia(e.clientX, e.clientY)) e.preventDefault(); };
    const drag = (e: DragEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.('img, video, picture, figure') || t?.querySelector?.('img, video')) e.preventDefault();
    };
    const save = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') e.preventDefault();
    };
    document.addEventListener('contextmenu', menu);
    document.addEventListener('dragstart', drag);
    document.addEventListener('keydown', save);
    return () => {
      document.removeEventListener('contextmenu', menu);
      document.removeEventListener('dragstart', drag);
      document.removeEventListener('keydown', save);
    };
  }, []);
  return null;
}
