'use client';

import { Fragment, useEffect, useState } from 'react';
import { work } from '@/lib/content';
import Tag from './Tag';
import Placeholder from './Placeholder';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Image strips grouped by category. Hover / focus / tap expands one strip;
 * each category is its own run, set apart by a gap and a labelled rule.
 * The category line underneath reads like a sentence and tracks the open strip.
 */
export default function Work() {
  const [active, setActive] = useState({ g: 0, i: 0 });
  const [canHover, setCanHover] = useState(false);
  useEffect(() => setCanHover(window.matchMedia('(hover: hover)').matches), []);

  const open = (g: number, i: number) => setActive({ g, i });

  return (
    <section className="work section" id="work">
      <div className="work__head">
        <h2 className="display reveal"><Tag>{work.tag}</Tag>{work.title}</h2>
      </div>

      <div className="strips reveal" data-delay="1">
        {work.categories.map((cat, g) => {
          const isOpen = g === active.g;
          return (
            <section
              key={cat.name}
              className={`strip-group${isOpen ? ' is-open' : ''}`}
              style={{ flexGrow: cat.items.length + (isOpen ? 8 : 0) }}
              aria-label={cat.name}
            >
              <p className="strip-group__label mono">
                <span>{pad(g + 1)}</span>{cat.name}<span className="strip-group__count">{pad(cat.items.length)}</span>
              </p>
              <ul className="strip-group__row" style={{ '--n': cat.items.length } as React.CSSProperties}>
                {cat.items.map((item, i) => {
                  const on = isOpen && i === active.i;
                  return (
                    <li key={`${cat.name}-${i}`} className={`strip${on ? ' is-active' : ''}`}>
                      <button
                        type="button"
                        className="strip__btn"
                        aria-pressed={on}
                        onMouseEnter={canHover ? () => open(g, i) : undefined}
                        onFocus={() => open(g, i)}
                        onClick={() => open(g, i)}
                      >
                        <Placeholder tone={item.tone} image={item.image} alt={item.alt} />
                        <span className="strip__label">
                          <span className="mono">{pad(g + 1)}.{pad(i + 1)}</span>
                          {item.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <p className="work__index reveal" data-delay="2">
        {work.categories.map((cat, g) => (
          <Fragment key={cat.name}>
            <span>
            <em>{g === 0 ? 'From' : 'to'}</em>{' '}
            <button
              type="button"
              className={g === active.g ? 'is-active' : undefined}
              aria-pressed={g === active.g}
              onClick={() => open(g, 0)}
            >
              {cat.name}
            </button>
            {g < work.categories.length - 1 ? ',' : '.'}
            </span>{' '}
          </Fragment>
        ))}
      </p>
    </section>
  );
}
