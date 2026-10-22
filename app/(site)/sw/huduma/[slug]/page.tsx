import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ServiceView } from '@/components/site/Views';
import { findServiceSw, services } from '@/lib/services';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => services.map((s) => ({ slug: s.swSlug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = findServiceSw((await params).slug);
  if (!s) return {};
  return { title: `${s.sw.title} Dar es Salaam, Tanzania — Shivo Labs`, description: s.sw.short, alternates: { canonical: `/sw/huduma/${s.swSlug}` } };
}

export default async function Page({ params }: Props) {
  const s = findServiceSw((await params).slug);
  if (!s) notFound();
  return <ServiceView service={s} lang="sw" />;
}
