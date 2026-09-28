import { about } from '@/lib/content';
import Tag from './Tag';
import Placeholder from './Placeholder';

export default function About() {
  const [small, large] = about.images;
  return (
    <section className="about section" id="about">
      <h2 className="headline reveal">
        <Tag>{about.tag}</Tag>
        {about.headline.map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}
      </h2>

      <div className="about__grid">
        <figure className="about__img about__img--small reveal" data-delay="1">
          <Placeholder {...small} />
        </figure>
        <figure className="about__img about__img--large reveal" data-delay="2">
          <Placeholder {...large} />
        </figure>
        <div className="about__text reveal" data-delay="3">
          <p className="lead">{about.body}</p>
          <p className="about__sign">{about.sign}</p>
        </div>
      </div>
    </section>
  );
}
