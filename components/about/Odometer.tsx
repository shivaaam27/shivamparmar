const DIGITS = Array.from({ length: 20 }, (_, i) => i % 10);

/**
 * A number whose digits roll into place like an odometer, each column a
 * beat after the one before. Pure markup: the roll is played by CSS once a
 * surrounding <Reveal> is in view. Screen readers get the plain number.
 */
export default function Odometer({ value, pad = 2 }: { value: number; pad?: number }) {
  const text = String(value).padStart(pad, '0');
  return (
    <span className="odo" role="img" aria-label={String(value)}>
      {[...text].map((ch, i) => (
        <span key={i} className="odo__col" aria-hidden="true" style={{ '--n': 10 + Number(ch), '--c': i } as React.CSSProperties}>
          <span className="odo__reel">{DIGITS.map((d, j) => <span key={j}>{d}</span>)}</span>
        </span>
      ))}
    </span>
  );
}
