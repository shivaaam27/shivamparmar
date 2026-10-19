import type { Metadata } from 'next';
import { FaqView } from '@/components/pages/Views';
import '../pages.css';

export const metadata: Metadata = {
  title: 'Questions — websites, systems and AI in Tanzania — Shivo Labs',
  description: 'What a website costs in Tanzania, how long it takes, English and Kiswahili sites, Google and AI search, business systems and AI automation: answers from Shivo Labs in Dar es Salaam.',
  alternates: { canonical: '/faq', languages: { en: '/faq', sw: '/sw/maswali', 'x-default': '/faq' } },
  openGraph: { url: '/faq', title: 'Questions — Shivo Labs' },
};

export default function Page() { return <FaqView lang="en" />; }
