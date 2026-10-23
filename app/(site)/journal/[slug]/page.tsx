import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostView } from '@/components/site/Views';
import { findPost, posts } from '@/lib/journal';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => posts().map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = findPost((await params).slug);
  if (!p) return {};
  // the same post in its other language: told to search engines, so each reader is sent to the right one
  const twin = p.pair ? findPost(p.pair) : undefined;
  const en = p.lang === 'en' ? p : twin?.lang === 'en' ? twin : undefined;
  const languages = twin ? Object.fromEntries([p, twin].map((x) => [x.lang, `/journal/${x.slug}`])) : undefined;
  return {
    title: `${p.title} — Shivo Labs`, description: p.description,
    alternates: { canonical: `/journal/${p.slug}`, ...(languages ? { languages: { ...languages, 'x-default': en ? `/journal/${en.slug}` : `/journal/${p.slug}` } } : {}) },
  };
}

export default async function Page({ params }: Props) {
  const p = findPost((await params).slug);
  if (!p) notFound();
  return <PostView post={p} />;
}
