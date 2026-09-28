import { contact, site } from '@/lib/content';

export default function Footer() {
  return (
    <footer className="site-footer">
      <p className="site-footer__name" data-scramble aria-label={site.name}>{site.name}</p>
      <div className="site-footer__bar mono">
        <span>© {new Date().getFullYear()} {site.fullName}</span>
        <span className="site-footer__mid">{contact.footerNote}</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
