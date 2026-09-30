import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Inter_Tight, IBM_Plex_Mono } from 'next/font/google';
import { site } from '@/lib/content';
import { personJsonLd, siteUrl } from '@/lib/seo';
import SmoothScroll from '@/components/SmoothScroll';
import Analytics from '@/components/Analytics';
import ImageGuard from '@/components/ImageGuard';
import './globals.css';

const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif' });
const sans = Inter_Tight({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-sans' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });

export const metadata: Metadata = {
  // absolute links for search engines and share previews
  metadataBase: new URL(siteUrl()),
  title: `${site.fullName} — pharmacist, photographer and systems builder`,
  description: site.description,
  applicationName: site.fullName,
  authors: [{ name: site.fullName, url: siteUrl() }],
  creator: site.fullName,
  keywords: ['Shivam Parmar', 'pharmacist', 'photographer', 'Dar es Salaam', 'Tanzania', 'business systems', 'AI workflows', 'Claude Code', 'design', 'pharmacovigilance'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: site.fullName,
    locale: 'en_GB',
    url: '/',
    title: site.fullName,
    description: site.description,
    images: [{ url: '/images/hero-dashboard.jpg', width: 2560, height: 1440, alt: `${site.fullName}: work` }],
  },
  twitter: { card: 'summary_large_image', title: site.fullName, description: site.description, images: ['/images/hero-dashboard.jpg'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  formatDetection: { telephone: false },
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
        <a className="skip" href="#main">Skip to content</a>
        <SmoothScroll>{children}</SmoothScroll>
        <div className="grain" aria-hidden="true" />
        <Analytics />
        <ImageGuard />
      </body>
    </html>
  );
}
