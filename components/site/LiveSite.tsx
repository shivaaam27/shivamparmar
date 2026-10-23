'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { track } from '@/lib/track';
import Logo from './Logo';
import { ArrowUR } from './Art';

/**
 * A project's live site, shown inside the Shivo Labs frame so the visitor never feels they left: the site fills the
 * screen under a slim bar (the logo, the project, its address, open in a new tab, back). Esc, the bar's back button
 * and the phone's own back gesture all close it. It only works for sites that allow shivolabs.com to show them
 * (`embed: true` on the project link, and the address in EMBED_ORIGINS, lib/headers.ts); every other link opens a new tab.
 */
export default function LiveSite({ href, label, title, embed }: { href: string; label: string; title: string; embed?: boolean }) {
  const [open, setOpen] = useState(false);
  const host = (() => { try { return new URL(href, 'https://shivolabs.com').host; } catch { return href; } })();

  const close = useCallback(() => { if (window.location.hash === '#live') window.history.back(); else setOpen(false); }, []);
  useEffect(() => {
    if (!open) return;
    window.history.pushState({ live: true }, '', '#live');
    const onPop = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    const html = document.documentElement, before = html.style.overflow;
    html.style.overflow = 'hidden';
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKey);
    return () => { html.style.overflow = before; window.removeEventListener('popstate', onPop); window.removeEventListener('keydown', onKey); };
  }, [open, close]);

  if (!embed) {
    return <a className="v2-btn" href={href} target={href.startsWith('/') ? undefined : '_blank'} rel="noopener" onClick={() => track(`Live site · ${title}`)}>{label}<span className="v2-btn__dot"><ArrowUR /></span></a>;
  }
  return (
    <>
      <button type="button" className="v2-btn" onClick={() => { setOpen(true); track(`Live site · ${title}`); }}>{label}<span className="v2-btn__dot"><ArrowUR /></span></button>
      {open && createPortal(
        <div className="v2-live" role="dialog" aria-modal="true" aria-label={`${title}, live`} data-lenis-prevent>
          <header className="v2-live__bar">
            <button type="button" className="v2-live__back" onClick={close} autoFocus>← Back to {title}</button>
            <span className="v2-live__brand"><Logo tone="dark" /></span>
            <span className="v2-live__host">{host}</span>
            <a className="v2-live__out" href={href} target="_blank" rel="noopener">New tab <ArrowUR /></a>
          </header>
          <iframe className="v2-live__frame" src={href} title={`${title}, live site`} loading="eager" referrerPolicy="strict-origin-when-cross-origin" />
        </div>,
        document.querySelector('.v2') ?? document.body,
      )}
    </>
  );
}
