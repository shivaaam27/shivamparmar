import type { Metadata } from 'next';
import V2WorkBrowser from '@/components/v2/WorkBrowser';
import { Cta } from '@/components/v2/Kit';
import { site } from '@/lib/content';
import { workData } from '@/lib/work-data';

export const metadata: Metadata = {
  title: `Work — ${site.fullName}`,
  description: 'Selected work by Shivo Labs and its founder Shivam Parmar: websites, business systems, social media and photography from Tanzania.',
  alternates: { canonical: '/work' },
};

/** V2 /work: every category, every collection, every picture. */
export default function WorkV2() {
  return (
    <main id="main" className="v2-page">
      <V2WorkBrowser cats={workData()} initial={{ c: null, s: null }} />
      <Cta />
    </main>
  );
}
