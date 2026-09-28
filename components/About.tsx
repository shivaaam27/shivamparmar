import { about } from '@/lib/content';
import Tag from './Tag';

export default function About() {
  return (
    <section className="about section" id="about">
      <h2 className="headline reveal">
        <Tag>{about.tag}</Tag>
        {about.headline.map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}
      </h2>

      <div className="about__grid">
        <div className="about__text reveal" data-delay="1">
          <p className="lead">{about.body}</p>
          <a className="about__sign" href={about.link.href}>
            {about.link.label}<span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
