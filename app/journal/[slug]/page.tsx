import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostView } from '@/components/pages/Views';
import { findPost, posts } from '@/lib/journal';
import '../../pages.css';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => posts().map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = findPost((await params).slug);
  if (!p) return {};
  const path = `/journal/${p.slug}`;
  const languages: Record<string, string> = { [p.lang]: path };
  if (p.pair) languages[p.lang === 'sw' ? 'en' : 'sw'] = `/journal/${p.pair}`;
  return {
    title: `${p.title} — Shivo Labs`,
    description: p.description,
    keywords: p.tags,
    alternates: { canonical: path, languages, types: { 'application/rss+xml': '/journal/rss.xml' } },
    openGraph: { type: 'article', url: path, title: p.title, description: p.description, publishedTime: p.date, locale: p.lang === 'sw' ? 'sw_TZ' : 'en' },
  };
}

export default async function Page({ params }: Props) {
  const p = findPost((await params).slug);
  if (!p) notFound();
  return <PostView post={p} />;
}
