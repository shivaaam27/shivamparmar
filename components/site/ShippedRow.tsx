import Link from 'next/link';
import { aboutPage } from '@/lib/content';
import { tc } from '@/lib/title-case';
import { ArrowUR } from './Art';
import Marquee from './Marquee';
import Ribbons from './Ribbons';

/** Where each thing built and shipped is written up: the work page's Software list, or its own page. */
const HREF: Record<string, string> = {
  'Task management platform': '/work/software?s=task-management-platform',
  'AI document agent': '/work/software?s=ai-document-agent',
  'Compliance alert engine': '/work/software?s=compliance-alert-engine',
  'Custom MCP server': '/work/software?s=custom-mcp-server',
  'AI image pipeline': '/work/software?s=ai-image-pipeline',
  'Shivo Labs apps': '/about#products',
  'V1 Supermarket website': '/work/v1-supermarket-website',
};

/**
 * Things I've built and shipped, on the cream page: one row of tiles gliding past, each with its own moving line
 * (where the products have a logo) and its name. The words that went with each are on the work page, under Software.
 */
export default function ShippedRow() {
  const { highlights } = aboutPage;
  const tiles = highlights.items.map((h, i) => {
    const inner = (
      <>
        <span className="v2-ship__art"><Ribbons set={`h${(i % 8) + 1}`} /></span>
        <b className="v2-ship__t">{tc(h.title)}</b>
      </>
    );
    const href = HREF[h.title];
    return href
      ? <Link key={h.title} className="v2-ship__tile" href={href} aria-label={`${h.title}. ${h.text}`}>{inner}</Link>
      : <span key={h.title} className="v2-ship__tile" role="group" aria-label={`${h.title}. ${h.text}`}>{inner}</span>;
  });
  return (
    <section className="v2-pr v2-ship" id="highlights" aria-label="Things built and shipped">
      <div className="v2-pr__head">
        <h2 className="v2-pr__title">{tc(highlights.title[0])} <em>{tc(highlights.title[1], { start: false })}</em></h2>
      </div>
      <Marquee label="Things built and shipped" rows={[tiles]} secondsPerTile={4.2} />
      <p className="v2-pr__all">
        <Link className="v2-btn" href={'/work/software'}>See all software<span className="v2-btn__dot"><ArrowUR /></span></Link>
      </p>
    </section>
  );
}
