import type { Metadata, Viewport } from 'next';
import V2Header from '@/components/v2/Header';
import V2Footer from '@/components/v2/Footer';
import V2Reveal from '@/components/v2/Reveal';
import './styles/base.css';
import './styles/chrome.css';
import './styles/hero.css';
import './styles/home.css';
import './styles/pages.css';
import './styles/about.css';
import './styles/work.css';
import './styles/film.css';
import './styles/products.css';
import './styles/services.css';
import './styles/journal.css';
import './styles/contact.css';
import './styles/type.css';

// Version 2 uses V1's fonts, loaded by the root layout: Sora (--font-serif) for headlines and the logo,
// Hanken Grotesk (--font-sans) for reading and the interface.

export const metadata: Metadata = {
  // a trial of the new look: kept out of search until it becomes the site
  robots: { index: false, follow: true },
};

export const viewport: Viewport = { themeColor: '#0A2E20' };

export default function V2Layout({ children }: { children: React.ReactNode }) {
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
