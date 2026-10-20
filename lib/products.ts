/**
 * Shivo Labs' own products: the Hub and the apps inside it, plus Website Insights.
 * Shown on the home page (Hub & Products) and on /products.
 * The words live in content/products.json, so they can be changed in the product editor
 * (npm run products:edit) without touching code. `name` is the small line under the logo.
 */
import data from '@/content/products.json';

export type Product = { slug: string; name: string; line: string; text: string; on: string[] };

export const products: Product[] = data.products;
export const productsCopy: { tag: string; title: [string, string]; lead: string; link: { label: string; href: string } } =
  { ...data.copy, title: [data.copy.title[0], data.copy.title[1]] };
