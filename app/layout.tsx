import type { Metadata, Viewport } from 'next';
import { Sora, Hanken_Grotesk } from 'next/font/google';
import { site } from '@/lib/content';
import { personJsonLd, siteUrl } from '@/lib/seo';
import SmoothScroll from '@/components/SmoothScroll';
import Analytics from '@/components/Analytics';
import ImageGuard from '@/components/ImageGuard';
import './globals.css';

// brand type: Sora for display, headings and the logo; Hanken Grotesk for body text and every small label
const serif = Sora({ subsets: ['latin'], weight: ['300', '400', '600'], variable: '--font-serif' });
const sans = Hanken_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-sans' });
const mono = Hanken_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono' });

export const metadata: Metadata = {
  // absolute links for search engines and share previews
  metadataBase: new URL(siteUrl()),
  title: { default: `${site.fullName} — ${site.tagline} in Dar es Salaam`, template: `%s` },
  description: site.description,
  applicationName: site.fullName,
  authors: [{ name: site.fullName, url: siteUrl() }, { name: site.founder.name }],
  creator: site.founder.name,
  keywords: ['Shivo Labs', 'digital solutions', 'websites and apps', 'custom software', 'AI workflows', 'automation', 'branding', 'social media', 'digital strategy', 'Dar es Salaam', 'Tanzania', 'Shivam Parmar'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: site.fullName,
    locale: 'en_GB',
    url: '/',
    title: `${site.fullName} — ${site.tagline}`,
    description: site.description,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Shivo Labs logo mark' }],
  },
  twitter: { card: 'summary_large_image', title: site.fullName, description: site.description, images: ['/og.png'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  // the phone's browser bar in the site's deep green
  themeColor: '#0A2E20',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* hide hero chrome + reveal items until JS animates them in */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js');try{var t=localStorage.getItem('shivo-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}" }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }} />
        <a className="skip" href="#main">Skip to content</a>
        <SmoothScroll>{children}</SmoothScroll>
        <Analytics />
        <ImageGuard />
      </body>
    </html>
  );
}
