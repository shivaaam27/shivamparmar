import type { Metadata } from 'next';
import { FaqView } from '@/components/site/Views';

export const metadata: Metadata = {
  title: 'Maswali — tovuti, mifumo na AI Tanzania — Shivo Labs',
  alternates: { canonical: '/sw/maswali' },
};

export default function Page() { return <FaqView lang="sw" />; }
