import Link from 'next/link';
import { contact, nav, site } from '@/lib/content';
import { visibleCategories } from '@/lib/work';
import { tc } from '@/lib/title-case';
import LocalTime from './LocalTime';
import Logo from './Logo';
import { ArrowUR, Burst, Hills, Leaf } from './Art';

const SOCIAL: Record<string, string> = { linkedin: 'LinkedIn', instagram: 'Instagram', orcid: 'ORCID' };
const socialName = (url: string) => Object.entries(SOCIAL).find(([k]) => url.includes(k))?.[1] ?? url;

/** Footer, the same on every page: low hills into the green, then the logo, the pages, the work, contact and the small print. */
export default function V2Footer() {
  const cats = visibleCategories();
  const [phone] = site.phones;
  return (
    <footer className="v2-footer">
      <div className="v2-footer__hills" aria-hidden="true">
        <Burst className="v2-footer__sun" points={16} />
        <Leaf className="v2-footer__leaf" />
        <Hills />
      </div>
      <div className="v2-footer__body v2-dark">
        <div className="v2-petals" aria-hidden="true" />
        <div className="v2-wrap v2-footer__in">
          <div className="v2-footer__brand">
            <Link href={'/'} aria-label="Shivo Labs — home"><Logo tone="dark" /></Link>
            <p className="v2-footer__line">{site.tagline}, from {site.location}. Working with people anywhere.</p>
            <a className="v2-footer__mail" href={`mailto:${site.email}`} data-umami-event="Contact · footer email">
              {site.email} <ArrowUR size={14} />
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
                {site.sameAs.filter((u) => !u.includes('orcid')).map((u) => <li key={u}><a className="v2-link" href={u} target="_blank" rel="noopener">{socialName(u)}</a></li>)}
              </ul>
            </div>
          </nav>
        </div>

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
