import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ServiceView } from '@/components/pages/Views';
import { findServiceSw, services } from '@/lib/services';
import '../../../pages.css';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => services.map((s) => ({ slug: s.swSlug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = findServiceSw((await params).slug);
  if (!s) return {};
  const path = `/sw/huduma/${s.swSlug}`;
  return {
    title: `${s.sw.title} Dar es Salaam, Tanzania — Shivo Labs`,
    description: s.sw.short,
    alternates: { canonical: path, languages: { en: `/services/${s.slug}`, sw: path, 'x-default': `/services/${s.slug}` } },
    openGraph: { url: path, title: `${s.sw.title} — Shivo Labs`, description: s.sw.short, locale: 'sw_TZ' },
  };
}

export default async function Page({ params }: Props) {
  const s = findServiceSw((await params).slug);
  if (!s) notFound();
  return <ServiceView service={s} lang="sw" />;
}
