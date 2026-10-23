import type { Viewport } from 'next';
import V2Header from '@/components/site/Header';
import V2Footer from '@/components/site/Footer';
import V2Reveal from '@/components/site/Reveal';
import './styles/base.css';
import './styles/chrome.css';
import './styles/hero.css';
import './styles/home.css';
import './styles/pages.css';
import './styles/about.css';
import './styles/work.css';
import './styles/film.css';
import './styles/services.css';
import './styles/journal.css';
import './styles/contact.css';
import './styles/type.css';

// The fonts are loaded by the root layout: Sora (--font-serif) for headlines and the logo, Hanken Grotesk
// (--font-sans) for reading and the interface.

export const viewport: Viewport = { themeColor: '#2B6444' };

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="v2">
      <span id="top" aria-hidden="true" />
      <V2Header />
      <V2Reveal />
      {children}
      <V2Footer />
    </div>
  );
}
