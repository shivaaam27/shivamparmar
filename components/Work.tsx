'use client';

import { useEffect, useState } from 'react';
import { work } from '@/lib/content';
import Tag from './Tag';
import Placeholder from './Placeholder';
import MetaCol from './MetaCol';

/** Image strips: hover / focus / tap expands one and collapses the rest. */
export default function Work() {
  const [active, setActive] = useState(0);
  const [canHover, setCanHover] = useState(false);
  useEffect(() => setCanHover(window.matchMedia('(hover: hover)').matches), []);

  return (
    <section className="work section" id="work">
      <div className="work__head">
        <h2 className="display reveal"><Tag>{work.tag}</Tag>{work.title}</h2>
        <div className="work__meta reveal" data-delay="1">
          {work.meta.map((col) => (
            <MetaCol key={col.label} label={col.label}>
              <ul>
                {col.items.map((item, i) => <li key={item} className={i === 0 ? 'is-muted' : undefined}>{item}</li>)}
              </ul>
            </MetaCol>
          ))}
        </div>
      </div>

      <ul className="strips reveal" data-delay="2" aria-label="Selected work">
        {work.items.map((item, i) => (
          <li key={item.title} className={`strip${i === active ? ' is-active' : ''}`}>
            <button
              type="button"
              className="strip__btn"
              aria-pressed={i === active}
              onMouseEnter={canHover ? () => setActive(i) : undefined}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
            >
              <Placeholder tone={item.tone} image={item.image} alt={item.alt} />
              <span className="strip__label">
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                {item.title}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
