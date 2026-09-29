import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Inter_Tight, IBM_Plex_Mono } from 'next/font/google';
import { site } from '@/lib/content';
import SmoothScroll from '@/components/SmoothScroll';
import Analytics from '@/components/Analytics';
import './globals.css';

const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif' });
const sans = Inter_Tight({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-sans' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });

export const metadata: Metadata = {
  // absolute links for social previews: Vercel provides the production host
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000'),
  title: site.fullName,
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* hide hero chrome + reveal items until JS animates them in */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <SmoothScroll>{children}</SmoothScroll>
        <div className="grain" aria-hidden="true" />
        <Analytics />
      </body>
    </html>
  );
}
