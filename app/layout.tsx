import type { Metadata, Viewport } from 'next';
import { Sora, Hanken_Grotesk, Noto_Sans_Arabic, Noto_Sans_Devanagari, Noto_Sans_Gujarati } from 'next/font/google';
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
// the scripts of the Journal's Arabic, Hindi and Gujarati posts: loaded only on a page that uses them
const arabic = Noto_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '600'], variable: '--font-arabic', preload: false });
const devanagari = Noto_Sans_Devanagari({ subsets: ['devanagari'], weight: ['400', '600'], variable: '--font-devanagari', preload: false });
const gujarati = Noto_Sans_Gujarati({ subsets: ['gujarati'], weight: ['400', '600'], variable: '--font-gujarati', preload: false });

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
  colorScheme: 'light dark',
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#141517' }, { media: '(prefers-color-scheme: light)', color: '#F9F9F9' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className={`${serif.variable} ${sans.variable} ${mono.variable} ${arabic.variable} ${devanagari.variable} ${gujarati.variable}`} suppressHydrationWarning>
      <head>
        {/* hide hero chrome + reveal items until JS animates them in */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js');try{var t=localStorage.getItem('shivo-theme')||'light';if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;document.querySelectorAll('meta[name=theme-color]').forEach(function(m){m.setAttribute('content',t==='light'?'#F9F9F9':'#141517')})}}catch(e){}" }} />
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
