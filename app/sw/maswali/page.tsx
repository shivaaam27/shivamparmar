import type { Metadata } from 'next';
import { FaqView } from '@/components/pages/Views';
import '../../pages.css';

export const metadata: Metadata = {
  title: 'Maswali — tovuti, mifumo na AI Tanzania — Shivo Labs',
  description: 'Gharama ya tovuti Tanzania, muda wa kujenga, tovuti za Kiingereza na Kiswahili, Google na AI, mifumo ya biashara na otomatiki: majibu kutoka Shivo Labs jijini Dar es Salaam.',
  alternates: { canonical: '/sw/maswali', languages: { en: '/faq', sw: '/sw/maswali', 'x-default': '/faq' } },
  openGraph: { url: '/sw/maswali', title: 'Maswali — Shivo Labs', locale: 'sw_TZ' },
};

export default function Page() { return <FaqView lang="sw" />; }
