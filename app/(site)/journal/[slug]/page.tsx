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
  return { title: `${p.title} — Shivo Labs`, description: p.description, alternates: { canonical: `/journal/${p.slug}` } };
}

export default async function Page({ params }: Props) {
  const p = findPost((await params).slug);
  if (!p) notFound();
  return <PostView post={p} />;
}
