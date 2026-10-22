import type { Metadata } from 'next';
import { Page, PageHero, Section } from '@/components/v2/Kit';
import ProductLogo from '@/components/v2/ProductLogo';
import { Leaf, Petals } from '@/components/v2/Art';
import { products, productsCopy } from '@/lib/products';
import { tc, v2 } from '@/lib/v2';

export const metadata: Metadata = {
  title: 'Shivo Labs Hub & Products',
  description: 'Shivo Labs software for Windows, iPhone, Android and TV: the Shivo Labs Hub, an AI assistant, team chat, file storage and transfer, iPhone screen mirroring, iPhone app installs, a TV home screen, a camera app and website visitor reports.',
  alternates: { canonical: '/products' },
};

const TONES = ['lime', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'];

/** V2 /products: every product as a card with its own logo, what it is, and where it runs. */
export default function ProductsV2() {
  return (
    <Page>
      <PageHero tone="forest" tag={productsCopy.tag} title={<>{tc(productsCopy.title[0])} <em>{tc(productsCopy.title[1], { start: false })}</em></>} lead={productsCopy.lead}
        crumbs={[{ href: v2('/'), label: 'Home' }, { label: productsCopy.tag }]} />
      <Section label="All products" n={1}>
        <ul className="v2-prods">
          {products.map((p, i) => (
            <li key={p.slug} id={p.slug} className={`v2-card v2-card--${TONES[i % TONES.length]} v2-prod v2-rise${i === 0 ? ' is-hub' : ''}`} style={{ '--d': i % 3 } as React.CSSProperties}>
              {i === 0 ? <Petals className="v2-prod__art v2-spin" /> : <Leaf className="v2-prod__art v2-sway" />}
              <ProductLogo name={p.name} />
              <h2 className="v2-prod__line">{tc(p.line)}</h2>
              <p className="v2-prod__text">{p.text}</p>
              <ul className="v2-prod__on" aria-label="Works on">{p.on.map((o) => <li key={o}>{o}</li>)}</ul>
            </li>
          ))}
        </ul>
      </Section>
    </Page>
  );
}
