import Link from 'next/link';
import { about, clients, contact, site } from '@/lib/content';
import { products, productsCopy } from '@/lib/products';
import { tc, v2 } from '@/lib/v2';
import { ArrowUR, BigLeaf, Loop, LOOPS, Petals, Sparkle } from './Art';
import ProductLogo from './ProductLogo';
import Marquee from './Marquee';
import ScrollWords from './ScrollWords';
import Ribbons from './Ribbons';
import Grow from './Grow';
import { Kicker } from './Ui';

/** Phrases in the about text that get a lime marker as the reading reaches them (as V1). */
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

/* ---------------------------------------------------------------- about */

export function V2About() {
  const [first, second] = about.headline;
  const before = first.replace(about.scramble, '').replace(/,\s*$/, '').trim();
  return (
    <section className="v2-sec v2-about" id="about" aria-label={about.tag} data-reveal>
      <div className="v2-wrap">
        <Kicker n={1}>{about.tag}</Kicker>
        <h2 className="v2-h1 v2-about__title" aria-label={about.headline.join(' ')}>
          <span className="v2-rise" aria-hidden="true">{tc(before)} </span>
          <span className="v2-nowrap" aria-hidden="true"><span className="v2-about__pill v2-pop" style={{ '--d': 3 } as React.CSSProperties}>{tc(about.scramble, { start: false })}</span><span className="v2-rise" style={{ '--d': 1 } as React.CSSProperties}>,</span></span>
          <span className="v2-rise" style={{ '--d': 1 } as React.CSSProperties} aria-hidden="true"> {tc(second, { start: false })}</span>
        </h2>

        <div className="v2-about__text">
          <ScrollWords className="v2-about__body" parts={marked(about.body)} />
          <p className="v2-about__note">{about.note}</p>
          <Link className="v2-btn v2-about__go" href={v2(about.link.href)}>{about.link.label}<span className="v2-btn__dot"><ArrowUR /></span></Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- products */

const PRODUCT_TONES = ['lime', 'paper', 'mint', 'paper', 'mint', 'paper', 'mint', 'paper', 'mint', 'paper'] as const;

export function V2Products({ n = 4 }: { n?: number }) {
  return (
    <section className="v2-products" id="products" aria-label={productsCopy.title.join(' ')} data-reveal>
      <div className="v2-dark v2-products__panel">
      <Ribbons set="page" className="v2-products__ribbons" />
      <div className="v2-wrap v2-products__in">
        <Kicker n={n}>{productsCopy.tag}</Kicker>
        <div className="v2-products__head">
          <h2 className="v2-h2 v2-rise">{tc(productsCopy.title[0])} <em>{tc(productsCopy.title[1], { start: false })}</em></h2>
          <p className="v2-products__lead v2-rise" style={{ '--d': 1 } as React.CSSProperties}>{productsCopy.lead}</p>
        </div>
        <ul className="v2-products__grid">
          {products.map((p, i) => (
            <li key={p.slug} className={`v2-products__item v2-rise${i === 0 ? ' is-big' : ''}`} style={{ '--d': Math.min(i, 6) } as React.CSSProperties}>
              <Link href={`${v2('/products')}#${p.slug}`} className={`v2-card v2-card--${PRODUCT_TONES[i]} v2-products__card`}>
                <ProductLogo name={p.name} />
                <span className="v2-products__line">{tc(p.line)}</span>
                {i === 0 && <span className="v2-products__text">{p.text}</span>}
                <span className="v2-products__on">{p.on.join(' · ')}</span>
                <span className="v2-products__go" aria-hidden="true"><ArrowUR /></span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="v2-products__all">
          <Link className="v2-btn v2-btn--lime" href={v2(productsCopy.link.href)}>{productsCopy.link.label}<span className="v2-btn__dot"><ArrowUR /></span></Link>
        </div>
      </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- clients */

export function V2Clients() {
  return (
    <section className="v2-clients" aria-label={clients.tag}>
      <h2 className="v2-clients__title">{tc(clients.title[0])} <em>{tc(clients.title[1], { start: false })}</em></h2>
      <Marquee logos={clients.logos} label="Logos of brands I’ve worked with" />
    </section>
  );
}

/* ---------------------------------------------------------------- contact */

export function V2Contact({ n = 6 }: { n?: number }) {
  const [phone] = site.phones;
  return (
    // a lime card that grows into the full screen and stays while the footer slides up over it
    <Grow className="v2-contact" id="contact" label={contact.tag}>
      <div className="v2-contact__stick">
        <div className="v2-contact__card" data-reveal>
          <Loop className="v2-contact__loop" d={LOOPS.long} color="var(--forest)" width={12} />
          <BigLeaf className="v2-contact__leaf v2-sway v2-sway--slow" />
          <Petals className="v2-contact__petal v2-spin" />
          <Sparkle className="v2-contact__spark" />
          <Kicker n={n} className="v2-contact__kicker">{contact.tag}</Kicker>
          <h2 className="v2-display v2-contact__title v2-rise" style={{ '--d': 1 } as React.CSSProperties}>{contact.headline[0]}<br />{contact.headline[1]}</h2>
          <a className="v2-contact__mail v2-rise" style={{ '--d': 2 } as React.CSSProperties} href={`mailto:${site.email}`} data-umami-event="Contact · V2 email">
            <span>{site.email}</span><ArrowUR />
          </a>
          <div className="v2-contact__row v2-rise" style={{ '--d': 3 } as React.CSSProperties}>
            <a className="v2-btn" href={`https://wa.me/${phone.wa}`} target="_blank" rel="noopener" data-umami-event="Contact · V2 WhatsApp">WhatsApp {phone.label}<span className="v2-btn__dot"><ArrowUR /></span></a>
            <a className="v2-btn v2-btn--paper" href={`tel:${phone.tel}`} data-umami-event="Contact · V2 call">Call {phone.label}<span className="v2-btn__dot"><ArrowUR /></span></a>
          </div>
          <p className="v2-contact__based v2-rise" style={{ '--d': 4 } as React.CSSProperties}>Based in {site.location}. Working with people anywhere.</p>
        </div>
      </div>
    </Grow>
  );
}
