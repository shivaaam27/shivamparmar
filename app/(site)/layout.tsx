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
import './styles/app-home.css';

// The fonts are loaded by the root layout: Sora (--font-serif) for headlines and the logo, Hanken Grotesk
// (--font-sans) for reading and the interface.

export const viewport: Viewport = {
  // edge to edge: the page runs under the status bar and the browser's bottom bar (iPhone and Android), as every other site
  // does; the CSS keeps the words clear of them with env(safe-area-inset-*)
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#141517' }, { media: '(prefers-color-scheme: light)', color: '#F9F9F9' }],
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="v2">
      <span id="top" aria-hidden="true" />
      <V2Header />
      {process.env.NODE_ENV === 'development' && <nav aria-label="Preview editing" style={{position:'fixed',bottom:16,right:16,zIndex:9999,display:'flex',gap:12,padding:'12px 18px',borderRadius:12,background:'#fff',color:'#141517',boxShadow:'0 2px 14px #0002',fontSize:14}}>
        <a href="http://localhost:8794/#about" target="_blank" rel="noopener noreferrer">Edit About</a>
        <a href="http://localhost:8794/cv" target="_blank" rel="noopener noreferrer">Open / edit CV ↗</a>
      </nav>}

      <V2Reveal />
      {children}
      <V2Footer />
    </div>
  );
}
