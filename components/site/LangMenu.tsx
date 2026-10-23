'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/** The names of the languages the Journal can be in (each written in its own language). Add a language here when its first post exists. */
export const LANG_NAMES: Record<string, string> = {
  en: 'English', sw: 'Kiswahili', fr: 'Français', ar: 'العربية', hi: 'हिन्दी', gu: 'ગુજરાતી', zh: '中文', es: 'Español', pt: 'Português',
};

export type LangItem = { code: string; href?: string };

/**
 * A language button: a small globe; it opens a short list of the languages a post or the list exists in, the one in
 * use marked. On the list the choice is made in place (`onSelect`); on a post each language is a link to that
 * translation. English is the default everywhere. Closes with Escape, a click elsewhere or a choice.
 */
export default function LangMenu({ items, current, onSelect, align = 'left', label = 'Language' }: {
  items: LangItem[]; current: string; onSelect?: (code: string) => void; align?: 'left' | 'right'; label?: string;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', key); };
  }, [open]);

  const name = (c: string) => LANG_NAMES[c] ?? c.toUpperCase();
  return (
    <div ref={box} className={`v2-lang v2-lang--${align}`}>
      <button type="button" className="v2-lang__btn" aria-haspopup="true" aria-expanded={open} aria-label={`${label}: ${name(current)}`} title={name(current)} onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.5 4 5.6 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.6-4-9s1.4-6.5 4-9Z" /></svg>
      </button>
      {open && (
        <ul className="v2-lang__list" role="menu" aria-label={label}>
          {items.map((it) => {
            const on = it.code === current;
            const inner = <><span lang={it.code}>{name(it.code)}</span>{on && <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>}</>;
            return (
              <li key={it.code} role="none">
                {it.href && !on
                  ? <Link role="menuitem" href={it.href} hrefLang={it.code} onClick={() => setOpen(false)}>{inner}</Link>
                  : <button type="button" role="menuitem" aria-current={on || undefined} onClick={() => { onSelect?.(it.code); setOpen(false); }}>{inner}</button>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
