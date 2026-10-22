import { Mark } from './Logo';

/**
 * A product's logo as the Shivo Labs app shows it (unchanged from V1's ProductLockup): the mark, SHIVO LABS,
 * and the product's name in small spaced capitals beneath. Drawn in HTML so it stays sharp.
 */
export default function ProductLogo({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span className={`v2-plogo ${className}`} role="img" aria-label={`Shivo Labs ${name}`}>
      <Mark />
      <span className="v2-plogo__words" aria-hidden="true">
        <span className="v2-plogo__wm">SHIVO<span>LABS</span></span>
        <span className="v2-plogo__sub">{name}</span>
      </span>
    </span>
  );
}
