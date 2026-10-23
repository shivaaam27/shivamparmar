import { posts } from '@/lib/journal';
import { siteUrl } from '@/lib/seo';
import { BCP47 } from '@/lib/post-lang';

/** /journal/rss.xml: every journal post, for feed readers and for search engines and AI tools that follow feeds. */
export const dynamic = 'force-static';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function GET() {
  const url = siteUrl();
  const items = posts().map((p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}/journal/${p.slug}</link>
      <guid isPermaLink="true">${url}/journal/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>
      <dc:language>${BCP47[p.lang]}</dc:language>
    </item>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Shivo Labs Journal</title>
    <link>${url}/journal</link>
    <atom:link href="${url}/journal/rss.xml" rel="self" type="application/rss+xml" />
    <description>Websites, business systems and AI for businesses in Tanzania, East Africa and Africa, in English, Kiswahili, French, Arabic, Hindi and Gujarati.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
