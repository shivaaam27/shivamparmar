'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { work } from '@/lib/content';
import { FILTER_SUBS, categories, categoryHasWork, countAll, countCategory, coverOf, hasPage } from '@/lib/work';
import Tag from './Tag';
import Placeholder from './Placeholder';
import MetaCol from './MetaCol';
import { track } from '@/lib/track';

const pad = (n: number) => String(n).padStart(2, '0');

/** Which part of the work is showing: a category index and a sub-category index, -1 meaning "all". */
type Filter = { c: number; s: number };
/** The expanded strip, addressed by category / sub-category / project index. */
type Open = { g: number; s: number; p: number };

/** ?c=photography&s=portraits  <->  { c, s } */
function readFilter(): Filter {
  const q = new URLSearchParams(window.location.search);
  const c = categories.findIndex((cat) => cat.slug === q.get('c'));
  const s = c < 0 ? -1 : categories[c].subcategories.findIndex((sub) => sub.slug === q.get('s'));
  return { c, s };
}
function writeFilter({ c, s }: Filter) {
  const q = new URLSearchParams();
  if (c >= 0) q.set('c', categories[c].slug);
  if (c >= 0 && s >= 0) q.set('s', categories[c].subcategories[s].slug);
  const qs = q.toString();
  window.history.pushState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}#work`);
}

/** First strip that is visible under a filter. */
const firstOpen = ({ c, s }: Filter): Open => ({ g: Math.max(c, 0), s: Math.max(s, 0), p: 0 });

/**
 * Work, grouped Category → Sub-category → Project. Choosing a category or
 * sub-category (in the filter or the line under the strips) narrows what
 * shows and is kept in the address. Hover / focus / tap expands a strip; a
 * second click on an open project, or its "View project" link, opens its page.
 */
export default function Work() {
  const router = useRouter();
  const [filter, setFilterState] = useState<Filter>({ c: -1, s: -1 });
  const [open, setOpen] = useState<Open>({ g: 0, s: 0, p: 0 });
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    setCanHover(window.matchMedia('(hover: hover)').matches);
    const sync = () => { const f = readFilter(); setFilterState(f); setOpen(firstOpen(f)); };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const setFilter = useCallback((f: Filter) => {
    const cat = categories[f.c];
    track(cat ? `Filter · ${cat.name}${f.s >= 0 ? ` › ${cat.subcategories[f.s].name}` : ''}` : 'Filter · All work');
    setFilterState(f);
    setOpen(firstOpen(f));
    writeFilter(f);
  }, []);

  // what's on show under the current filter, keeping each item's real index
  const shown = useMemo(() => categories
    .map((cat, g) => ({ cat, g }))
    .filter(({ g }) => filter.c < 0 || g === filter.c)
    .map(({ cat, g }) => ({
      cat, g,
      subs: cat.subcategories
        .map((sub, s) => ({ sub, s }))
        .filter(({ s }) => filter.c < 0 || filter.s < 0 || s === filter.s),
    })), [filter]);

  const focused = filter.c >= 0 ? categories[filter.c] : null;
  const isOpen = (g: number, s: number, p: number) => open.g === g && open.s === s && open.p === p;

  return (
    <section className="work section" id="work">
      <div className="work__head">
        <h2 className="display reveal">
          <Tag>{work.tag}</Tag>
          <Link className="work__title-link" href="/work" onClick={() => track('Open work page')}>{work.title}<span className="work__title-arrow" aria-hidden="true">↗</span></Link>
        </h2>
        <div className="work__meta reveal" data-delay="1">
          <MetaCol label="Categories">
            <ul className="work__filter">
              <li>
                <button type="button" className={filter.c < 0 ? 'is-active' : undefined} aria-pressed={filter.c < 0} onClick={() => setFilter({ c: -1, s: -1 })}>
                  All<span className="mono">{pad(countAll())}</span>
                </button>
                <Link className="work__page mono" href="/work" aria-label="Open the work page" onClick={() => track('Open work page')}>
                  Open<span aria-hidden="true">↗</span>
                </Link>
              </li>
              {categories.map((cat, g) => (
                <li key={cat.slug}>
                  <button type="button" className={g === filter.c ? 'is-active' : undefined} aria-pressed={g === filter.c} onClick={() => setFilter({ c: g, s: -1 })}>
                    {cat.name}<span className="mono">{pad(countCategory(cat))}</span>
                  </button>
                  {categoryHasWork(cat) && (
                    <Link className="work__page mono" href={`/work/${cat.slug}`} aria-label={`Open the ${cat.name} page`} onClick={() => track(`Open category · ${cat.name}`)}>
                      Open<span aria-hidden="true">↗</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </MetaCol>
          {focused && (
            <MetaCol label={focused.name}>
              <ul className="work__filter">
                <li>
                  <button type="button" className={filter.s < 0 ? 'is-active' : undefined} aria-pressed={filter.s < 0} onClick={() => setFilter({ c: filter.c, s: -1 })}>
                    All<span className="mono">{pad(countCategory(focused))}</span>
                  </button>
                </li>
                {focused.subcategories.map((sub, s) => (s < FILTER_SUBS || s === filter.s) && (
                  <li key={sub.slug}>
                    <button type="button" className={s === filter.s ? 'is-active' : undefined} aria-pressed={s === filter.s} onClick={() => setFilter({ c: filter.c, s })}>
                      {sub.name}<span className="mono">{pad(sub.projects.length)}</span>
                    </button>
                  </li>
                ))}
                {focused.subcategories.length > FILTER_SUBS && (
                  <li>
                    <Link className="work__more" href={`/work/${focused.slug}`} onClick={() => track(`Open category · ${focused.name}`)}>
                      +{focused.subcategories.length - FILTER_SUBS} more<span aria-hidden="true"> ↗</span>
                    </Link>
                  </li>
                )}
              </ul>
            </MetaCol>
          )}
        </div>
      </div>

      <div className="reveal" data-delay="2">
      <div className="strips" key={`${filter.c}.${filter.s}`}>
        {shown.map(({ cat, g, subs }) => {
          const catOpen = open.g === g;
          const grow = subs.reduce((n, { sub, s }) => n + sub.projects.length + (catOpen && open.s === s ? 8 : 0), 0);
          return (
            <section key={cat.slug} className={`strip-group${catOpen ? ' is-open' : ''}`} style={{ flexGrow: grow }} aria-label={cat.name}>
              <p className="strip-group__label mono">
                <span>{pad(g + 1)}</span>{cat.name}<span className="strip-group__count">{pad(countCategory(cat))}</span>
              </p>
              <div className="strip-group__row">
                {subs.map(({ sub, s }) => {
                  const subOpen = catOpen && open.s === s;
                  return (
                    <div key={sub.slug} className={`strip-sub${subOpen ? ' is-open' : ''}`} style={{ flexGrow: sub.projects.length + (subOpen ? 8 : 0) }}>
                      <p className="strip-sub__label mono">{sub.name}</p>
                      <ul className="strip-sub__row">
                        {sub.projects.map((project, p) => {
                          const on = isOpen(g, s, p);
                          const page = hasPage(project);
                          const cover = coverOf(project);
                          return (
                            <li key={project.slug} className={`strip${on ? ' is-active' : ''}`}>
                              <button
                                type="button"
                                className="strip__btn"
                                aria-pressed={on}
                                aria-label={page ? `${project.title}, ${sub.name}` : `${sub.name}: coming soon`}
                                onMouseEnter={canHover ? () => setOpen({ g, s, p }) : undefined}
                                onFocus={() => setOpen({ g, s, p })}
                                onClick={() => {
                                  if (!(on && page)) return setOpen({ g, s, p });
                                  track(`Open project · ${project.title}`);
                                  router.push(`/work/${project.slug}`);
                                }}
                              >
                                <Placeholder tone={project.tone} image={cover} alt={project.images?.[0]?.alt} />
                                <span className="strip__label">
                                  <span className="mono">{pad(g + 1)}.{pad(s + 1)}</span>
                                  {project.title}
                                </span>
                              </button>
                              {on && page && (
                                <Link className="strip__open mono" href={`/work/${project.slug}`} onClick={() => track(`Open project · ${project.title}`)}>
                                  View project<span aria-hidden="true"> →</span>
                                </Link>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      </div>

      {/* the category line: categories in the overview, sub-categories once one is chosen */}
      <p className="work__index reveal" data-delay="3">
        {focused ? (
          <>
            {focused.subcategories.map((sub, s) => (
              <Fragment key={sub.slug}>
                <span>
                  <em>{s === 0 ? 'From' : 'to'}</em>{' '}
                  <button
                    type="button"
                    className={(filter.s < 0 ? open.s === s : filter.s === s) ? 'is-active' : undefined}
                    aria-pressed={filter.s === s}
                    onClick={() => setFilter({ c: filter.c, s })}
                  >
                    {sub.name}
                  </button>
                  {s < focused.subcategories.length - 1 ? ',' : '.'}
                </span>{' '}
              </Fragment>
            ))}
            <button type="button" className="work__back mono" onClick={() => setFilter({ c: -1, s: -1 })}>
              <span aria-hidden="true">← </span>All work
            </button>
          </>
        ) : (
          categories.map((cat, g) => (
            <Fragment key={cat.slug}>
              <span>
                <em>{g === 0 ? 'From' : 'to'}</em>{' '}
                <button type="button" className={g === open.g ? 'is-active' : undefined} onClick={() => setFilter({ c: g, s: -1 })}>
                  {cat.name}
                </button>
                {g < categories.length - 1 ? ',' : '.'}
              </span>{' '}
            </Fragment>
          ))
        )}
      </p>
    </section>
  );
}
