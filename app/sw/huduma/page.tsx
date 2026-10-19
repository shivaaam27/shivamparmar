import type { Metadata } from 'next';
import { ServicesView } from '@/components/pages/Views';
import '../../pages.css';

export const metadata: Metadata = {
  title: 'Huduma — Shivo Labs, Dar es Salaam',
  description: 'Tovuti na programu, mifumo maalum ya biashara, AI na otomatiki, chapa na mitandao ya kijamii kutoka Shivo Labs jijini Dar es Salaam kwa biashara kote Tanzania na Afrika Mashariki.',
  alternates: { canonical: '/sw/huduma', languages: { en: '/services', sw: '/sw/huduma', 'x-default': '/services' } },
  openGraph: { url: '/sw/huduma', title: 'Huduma — Shivo Labs', locale: 'sw_TZ' },
};

export default function Page() { return <ServicesView lang="sw" />; }
