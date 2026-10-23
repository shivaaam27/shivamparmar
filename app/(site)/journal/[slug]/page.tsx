import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostView } from '@/components/site/Views';
import { findPost, posts, versionsOf } from '@/lib/journal';
import { HREFLANG } from '@/lib/post-lang';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => posts().map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = findPost((await params).slug);
  if (!p) return {};
  // the same post in its other languages: told to search engines, so each reader is sent to the right one
  const v = versionsOf(p);
  const en = v.find((x) => x.lang === 'en');
  const languages = v.length > 1 ? Object.fromEntries(v.map((x) => [HREFLANG[x.lang], `/journal/${x.slug}`])) : undefined;
  return {
    title: `${p.title} — Shivo Labs`, description: p.description,
    alternates: { canonical: `/journal/${p.slug}`, ...(languages ? { languages: { ...languages, 'x-default': `/journal/${(en ?? p).slug}` } } : {}) },
  };
}

export default async function Page({ params }: Props) {
  const p = findPost((await params).slug);
  if (!p) notFound();
  return <PostView post={p} />;
}
