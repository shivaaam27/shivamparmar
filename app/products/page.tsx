import type { Metadata } from 'next';
import { Page, Hero, JsonLd } from '@/components/pages/Kit';
import ProductLockup from '@/components/ProductLockup';
import { products, productsCopy } from '@/lib/products';
import { siteUrl } from '@/lib/seo';
import '../pages.css';

export const metadata: Metadata = {
  title: 'Shivo Labs Hub & Products',
  description: 'Shivo Labs software for Windows, iPhone, Android and TV: the Shivo Labs Hub, an AI assistant, team chat, file storage and transfer, iPhone screen mirroring, iPhone app installs, a TV home screen, a camera app and website visitor reports.',
  alternates: { canonical: '/products' },
  openGraph: { url: '/products', title: 'Shivo Labs Hub & Products' },
};

export default function ProductsPage() {
  const list = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'Shivo Labs products',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: { '@type': 'SoftwareApplication', name: `Shivo Labs ${p.name}`, description: p.text, operatingSystem: p.on.join(', '), applicationCategory: 'UtilitiesApplication', url: `${siteUrl()}/products#${p.slug}`, publisher: { '@type': 'Organization', name: 'Shivo Labs' } },
    })),
  };
  return (
    <Page lang="en" label={productsCopy.tag}>
      <JsonLd data={list} />
      <Hero lang="en" tag={productsCopy.tag} title={`${productsCopy.title[0]} ${productsCopy.title[1]}`} lead={productsCopy.lead}
        crumbs={[{ href: '/', label: 'Home' }, { label: productsCopy.tag }]} />
      <ul className="products__grid products__grid--page">
        {products.map((p) => (
          <li key={p.slug} id={p.slug} className="products__card">
            <ProductLockup name={p.name} />
            <h2 className="products__line">{p.line}</h2>
            <p>{p.text}</p>
            <ul className="products__on" aria-label="Works on">{p.on.map((o) => <li key={o}>{o}</li>)}</ul>
          </li>
        ))}
      </ul>
    </Page>
  );
}
