import Link from 'next/link';
import { products } from '@/lib/products';
import { ArrowUR } from './Art';
import { Mark } from './Logo';
import { copy } from '@/lib/copy';
import Marquee from './Marquee';

/**
 * Shivo Labs products, on the cream page: the Shivo Labs logo with the name of each product beside it, on tiles that
 * glide past in two rows, in opposite directions (as the logos did on the first site). The products are split in half
 * so one shows in one row only.
 */
export default function ProductRows() {
  const title = copy('products.title', 'Shivo Labs Products').split(' ');
  const half = Math.ceil(products.length / 2);
  const tile = (p: (typeof products)[number]) => (
    <Link className="v2-mq__tile" href={'/about#products'} aria-label={`Shivo Labs ${p.name}: ${p.line}`}>
      <span className="v2-logo v2-logo--light"><Mark /><span className="v2-logo__text">SHIVO<span>LABS</span></span></span>
      <span className="v2-mq__name">{p.name}</span>
    </Link>
  );
  return (
    <section className="v2-pr" id="products" aria-label="Shivo Labs products">
      <div className="v2-pr__head">
        <h2 className="v2-pr__title">{title.slice(0, -1).join(' ')} <em>{title[title.length - 1]}</em></h2>
      </div>
      <Marquee label="Shivo Labs products" rows={[products.slice(0, half).map(tile), products.slice(half).map(tile)]} />
      <p className="v2-pr__all">
        <Link className="v2-btn" href={'/about#products'}>See all products<span className="v2-btn__dot"><ArrowUR /></span></Link>
      </p>
    </section>
  );
}
