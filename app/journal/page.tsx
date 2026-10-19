import type { Metadata } from 'next';
import { JournalView } from '@/components/pages/Views';
import { posts } from '@/lib/journal';
import '../pages.css';

export const metadata: Metadata = {
  title: 'Journal — websites, systems and AI for businesses in Africa — Shivo Labs',
  description: 'Plain guides on websites, business systems, AI and digital marketing for businesses in Tanzania, East Africa and Africa, in English and Kiswahili.',
  alternates: { canonical: '/journal', types: { 'application/rss+xml': '/journal/rss.xml' } },
  openGraph: { url: '/journal', title: 'Journal — Shivo Labs' },
};

export default function Page() { return <JournalView posts={posts()} />; }
