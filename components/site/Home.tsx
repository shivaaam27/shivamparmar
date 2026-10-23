import { contact, site } from '@/lib/content';
import { ArrowUR, BigLeaf, Loop, LOOPS, Petals, Sparkle } from './Art';
import Grow from './Grow';

/** Phrases in the about text that get a lime marker as the reading reaches them . */
export const KEY_PHRASES = ['iPhone, Android and Windows apps', 'custom systems*', 'MCP connections'];

/** Splits the about text so the key phrases can be marked. */
export function marked(text: string) {
  const parts: { t: string; hl: boolean }[] = [];
  let rest = text;
  while (rest) {
    const hits = KEY_PHRASES.map((p) => ({ p, i: rest.indexOf(p) })).filter((h) => h.i >= 0).sort((a, b) => a.i - b.i);
    if (!hits.length) { parts.push({ t: rest, hl: false }); break; }
    const { p, i } = hits[0];
    if (i) parts.push({ t: rest.slice(0, i), hl: false });
    parts.push({ t: p, hl: true });
    rest = rest.slice(i + p.length);
  }
  return parts;
}

/* ---------------------------------------------------------------- contact */

export function V2Contact({ n = 6 }: { n?: number }) {
  const [phone] = site.phones;
  return (
    // a lime block, only as tall as what it says, then the footer
    <Grow className="v2-contact" id="contact" label={contact.tag}>
      <div className="v2-contact__stick">
        <div className="v2-contact__card" data-reveal>
          <Loop className="v2-contact__loop" d={LOOPS.long} color="var(--forest)" width={12} />
          <BigLeaf className="v2-contact__leaf v2-sway v2-sway--slow" />
          <Petals className="v2-contact__petal v2-spin" />
          <Sparkle className="v2-contact__spark" />
          <h2 className="v2-display v2-contact__title v2-rise" style={{ '--d': 1 } as React.CSSProperties}>{contact.headline[0]}<br />{contact.headline[1]}</h2>
          <a className="v2-contact__mail v2-rise" style={{ '--d': 2 } as React.CSSProperties} href={`mailto:${site.email}`} data-umami-event="Contact · email">
            <span>{site.email}</span><ArrowUR />
          </a>
          {/* one number, written once: it is the call and the WhatsApp */}
          <p className="v2-contact__phone v2-rise" style={{ '--d': 3 } as React.CSSProperties}>{phone.label}</p>
          <div className="v2-contact__row v2-rise" style={{ '--d': 4 } as React.CSSProperties}>
            <a className="v2-btn" href={`tel:${phone.tel}`} data-umami-event="Contact · call">Call<span className="v2-btn__dot"><ArrowUR /></span></a>
            <a className="v2-btn" href={`https://wa.me/${phone.wa}`} target="_blank" rel="noopener" data-umami-event="Contact · WhatsApp">WhatsApp<span className="v2-btn__dot"><ArrowUR /></span></a>
          </div>
        </div>
      </div>
    </Grow>
  );
}
