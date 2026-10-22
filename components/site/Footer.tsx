import Link from 'next/link';
import { contact, nav, site } from '@/lib/content';
import { visibleCategories } from '@/lib/work';
import { tc } from '@/lib/title-case';
import LocalTime from './LocalTime';
import Logo from './Logo';
import { ArrowUR, Burst, Hills, Leaf } from './Art';

const SOCIAL: Record<string, string> = { linkedin: 'LinkedIn', instagram: 'Instagram', orcid: 'ORCID' };
const socialName = (url: string) => Object.entries(SOCIAL).find(([k]) => url.includes(k))?.[1] ?? url;

/** Footer: hills rise from the page into deep green, then the logo, the pages, the work, contact and the small print. */
export default function V2Footer() {
  const cats = visibleCategories();
  const [phone] = site.phones;
  return (
    <footer className="v2-footer">
      <div className="v2-footer__hills" aria-hidden="true">
        <Burst className="v2-footer__sun v2-spin" points={16} />
        <Leaf className="v2-footer__leaf v2-sway" />
        <Hills />
      </div>
      <div className="v2-footer__body v2-dark">
        <div className="v2-petals" aria-hidden="true" />
        <div className="v2-wrap v2-footer__in">
          <div className="v2-footer__brand">
            <Link href={'/'} aria-label="Shivo Labs — home"><Logo tone="dark" /></Link>
            <p className="v2-footer__line">{site.tagline}, from {site.location}. Working with people anywhere.</p>
            <a className="v2-btn v2-btn--lime" href={`mailto:${site.email}`} data-umami-event="Contact · footer email">
              {site.email}<span className="v2-btn__dot"><ArrowUR size={16} /></span>
            </a>
          </div>

          <nav className="v2-footer__cols" aria-label="Footer">
            <div>
              <p className="v2-label">Pages</p>
              <ul>{nav.map((n) => <li key={n.href}><Link className="v2-link" href={n.href}>{n.label}</Link></li>)}</ul>
            </div>
            <div>
              <p className="v2-label">Work</p>
              <ul>{cats.map((c) => <li key={c.slug}><Link className="v2-link" href={`/work/${c.slug}`}>{tc(c.name)}</Link></li>)}</ul>
            </div>
            <div>
              <p className="v2-label">Say hello</p>
              <ul>
                <li><a className="v2-link" href={`tel:${phone.tel}`}>Call {phone.label}</a></li>
                <li><a className="v2-link" href={`https://wa.me/${phone.wa}`} target="_blank" rel="noopener">WhatsApp</a></li>
                <li><a className="v2-link" href={`mailto:${site.email}`}>Email</a></li>
                {site.sameAs.map((u) => <li key={u}><a className="v2-link" href={u} target="_blank" rel="noopener">{socialName(u)}</a></li>)}
              </ul>
            </div>
          </nav>
        </div>

        {/* the logo across the whole width, so the footer ends full and finished on every page */}
        <div className="v2-wrap v2-footer__big" aria-hidden="true"><Logo tone="dark" /></div>

        <div className="v2-wrap v2-footer__bar">
          <span>© {new Date().getFullYear()} {site.fullName} · All rights reserved</span>
          <span>{site.location.split(',')[0]} · <LocalTime /> local time</span>
          <span>{contact.footerNote}</span>
          <a className="v2-footer__top" href="#top">Back to top <span aria-hidden="true">↑</span></a>
        </div>
      </div>
    </footer>
  );
}
