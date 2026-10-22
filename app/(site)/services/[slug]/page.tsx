import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ServiceView } from '@/components/site/Views';
import { findService, services } from '@/lib/services';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => services.map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = findService((await params).slug);
  if (!s) return {};
  return { title: `${s.en.title} in Dar es Salaam, Tanzania — Shivo Labs`, description: s.en.short, alternates: { canonical: `/services/${s.slug}` } };
}

export default async function Page({ params }: Props) {
  const s = findService((await params).slug);
  if (!s) notFound();
  return <ServiceView service={s} lang="en" />;
}
