import type { Metadata } from 'next';
import { ServicesView } from '@/components/site/Views';

export const metadata: Metadata = {
  title: 'Services — Shivo Labs, Dar es Salaam',
  description: 'Websites and apps, custom business systems, AI workflows and automation, branding and social media, from Shivo Labs in Dar es Salaam for businesses across Tanzania and East Africa.',
  alternates: { canonical: '/services' },
};

export default function Page() { return <ServicesView lang="en" />; }
