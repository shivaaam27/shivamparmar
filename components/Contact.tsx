import { contact, site } from '@/lib/content';
import Tag from './Tag';
import MetaCol from './MetaCol';

export default function Contact() {
  return (
    <section className="contact section" id="contact">
      <h2 className="headline headline--left reveal">
        <Tag>{contact.tag}</Tag>
        {contact.headline.map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}
      </h2>

      <a className="contact__mail reveal" data-delay="1" href={`mailto:${site.email}`} data-umami-event="Contact · Email">
        {site.email}<span aria-hidden="true">↗</span>
      </a>

      <div className="contact__cols reveal" data-delay="2">
        {contact.columns.map((col) => (
          <MetaCol key={col.label} label={col.label}>
            <ul>
              {col.links?.map((l) => (
                <li key={l.href}>
                  <a href={l.href} data-umami-event={`Contact · ${col.label}`} {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}>{l.label}</a>
                </li>
              ))}
              {col.lines?.map((line) => <li key={line}>{line}</li>)}
            </ul>
          </MetaCol>
        ))}
      </div>
    </section>
  );
}
