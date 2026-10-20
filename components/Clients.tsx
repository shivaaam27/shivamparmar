import { clients } from '@/lib/content';
import LogoRows from './LogoRows';
import Tag from './Tag';

/** The companies I've worked with, between Work and Contact: the same title and two gliding rows as the About page. */
export default function Clients() {
  return (
    <section className="clients" aria-label={clients.tag}>
      <div className="clients__rows">
        <div><Tag>{clients.tag}</Tag></div>
        <h2 className="clients__title">{clients.title[0]}<br />{clients.title[1]}</h2>
        <LogoRows logos={clients.logos} label="Logos of brands I’ve worked with" />
      </div>
    </section>
  );
}
