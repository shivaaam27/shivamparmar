/**
 * Questions and answers as rounded cards that open one at a time like an accordion (plain <details>, so it
 * works without scripts and search engines read every answer). The first one starts open.
 */
export default function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="v2-faq" data-reveal>
      {items.map((x, i) => (
        <details key={x.q} name="v2-faq" open={i === 0} className="v2-rise" style={{ '--d': Math.min(i, 8) } as React.CSSProperties}>
          <summary><span>{x.q}</span><i aria-hidden="true" /></summary>
          <p>{x.a}</p>
        </details>
      ))}
    </div>
  );
}
