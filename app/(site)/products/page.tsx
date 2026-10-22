import type { Metadata } from 'next';
import { Page } from '@/components/site/Kit';
import ProductsScene from '@/components/site/ProductsScene';
import { products, productsCopy } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Shivo Labs Hub & Products',
  description: 'Shivo Labs software for Windows, iPhone, Android and TV: the Shivo Labs Hub, an AI assistant, team chat, file storage and transfer, iPhone screen mirroring, iPhone app installs, a TV home screen, a camera app and website visitor reports.',
  alternates: { canonical: '/products' },
};

/** /products: one held scene, the Hub and then each app in turn (components/site/ProductsScene.tsx). */
export default function ProductsPage() {
  return (
    <Page className="v2-productsp">
      <ProductsScene title={productsCopy.title} products={products} />
    </Page>
  );
}
