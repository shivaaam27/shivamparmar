import type { Metadata } from 'next';
import { Page } from '@/components/v2/Kit';
import ProductsScene from '@/components/v2/ProductsScene';
import { products, productsCopy } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Shivo Labs Hub & Products',
  description: 'Shivo Labs software for Windows, iPhone, Android and TV: the Shivo Labs Hub, an AI assistant, team chat, file storage and transfer, iPhone screen mirroring, iPhone app installs, a TV home screen, a camera app and website visitor reports.',
  alternates: { canonical: '/products' },
};

/** V2 /products: one held scene, the Hub and then each app in turn (components/v2/ProductsScene.tsx). */
export default function ProductsV2() {
  return (
    <Page className="v2-productsp">
      <ProductsScene title={productsCopy.title} products={products} />
    </Page>
  );
}
