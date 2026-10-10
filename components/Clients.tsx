import { clients } from '@/lib/content';
import { imageSize } from '@/lib/image-size';

/**
 * The companies we've built for, drifting slowly left to right between Work and Contact.
 * The track holds the set four times; it moves by half its width, so the loop never shows a seam.
 */
export default function Clients() {
  const set = [...clients.logos, ...clients.logos];
  return (
    <section className="clients" aria-label={clients.tag}>
      <p className="clients__tag mono">{clients.tag}</p>
      <div className="clients__marquee">
        <ul className="clients__track">
          {[...set, ...set].map((l, i) => {
            // same visual weight for a square mark and a long wordmark: height falls with the logo's width-to-height
            const { w, h } = imageSize(l.src);
            const k = Math.min(1.25, 1.25 / Math.sqrt(w / h));
            return (
            <li key={i} aria-hidden={i >= clients.logos.length || undefined} style={{ '--k': k.toFixed(3) } as React.CSSProperties}>
              <img src={l.src} alt={i < clients.logos.length ? l.name : ''} loading="lazy" />
            </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
