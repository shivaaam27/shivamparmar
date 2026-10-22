import type { Metadata } from 'next';
import V2WorkBrowser from '@/components/v2/WorkBrowser';
import V2WorkIndex from '@/components/v2/WorkIndex';
import { Cta } from '@/components/v2/Kit';
import { site } from '@/lib/content';
import { workData } from '@/lib/work-data';
import { wallEntries } from '@/lib/work-reel';

export const metadata: Metadata = {
  title: `Work — ${site.fullName}`,
  description: 'Selected work by Shivo Labs and its founder Shivam Parmar: websites, business systems, social media and photography from Tanzania.',
  alternates: { canonical: '/work' },
};

/** V2 /work: the opening, the reel of every project, then every picture (docs/V2-PLAN.md, "Work pages"). */
export default function WorkV2() {
  const entries = wallEntries();
  return (
    <main id="main" className="v2-page v2-work-film">
      <V2WorkIndex entries={entries} title={['My', 'Work']} lead="Websites, business systems, social media and photography, made in Tanzania.">
        <V2WorkBrowser cats={workData()} initial={{ c: null, s: null }} archive />
        <Cta />
      </V2WorkIndex>
    </main>
  );
}
