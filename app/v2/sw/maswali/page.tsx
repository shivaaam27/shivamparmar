import type { Metadata } from 'next';
import { FaqView } from '@/components/v2/Views';

export const metadata: Metadata = {
  title: 'Maswali — tovuti, mifumo na AI Tanzania — Shivo Labs',
  alternates: { canonical: '/sw/maswali' },
};

export default function Page() { return <FaqView lang="sw" />; }
