import { clients } from '@/lib/content';
import { tc } from '@/lib/title-case';

/** The brands' headline and logo grid alone, for the products scene to animate. */
export function BrandsGrid() {
  return (
    <div className="v2-bs__in">
      <h2 className="v2-bs__title">{tc(clients.title[0])} <em>{tc(clients.title[1], { start: false })}</em></h2>
      <ul className="v2-bs__grid" aria-label="Logos of brands I’ve worked with">
        {clients.logos.map((l) => (
          <li key={l.name}>{l.src ? <img src={l.src} alt={l.name} loading="lazy" /> : <span>{l.name}</span>}</li>
        ))}
      </ul>
    </div>
  );
}
