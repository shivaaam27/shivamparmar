import type { Metadata } from 'next';
import { ServicesView } from '@/components/v2/Views';

export const metadata: Metadata = {
  title: 'Huduma — Shivo Labs, Dar es Salaam',
  description: 'Tovuti na programu, mifumo maalum ya biashara, AI na otomatiki, chapa na mitandao ya kijamii kutoka Shivo Labs jijini Dar es Salaam kwa biashara kote Tanzania na Afrika Mashariki.',
  alternates: { canonical: '/sw/huduma' },
};

export default function Page() { return <ServicesView lang="sw" />; }
