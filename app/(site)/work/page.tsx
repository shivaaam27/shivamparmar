import type { Metadata } from 'next';
import V2WorkBrowser from '@/components/site/WorkBrowser';
import V2WorkIndex from '@/components/site/WorkIndex';
import { Cta } from '@/components/site/Kit';
import { site } from '@/lib/content';
import { workData } from '@/lib/work-data';
import { wallEntries } from '@/lib/work-reel';

export const metadata: Metadata = {
  title: `Work — ${site.fullName}`,
  description: 'Selected work by Shivo Labs and its founder Shivam Parmar: websites, business systems, social media and photography from Tanzania.',
  alternates: { canonical: '/work' },
};

/** /work: the opening, the reel of every project, then every picture (docs/SITE.md, "Work pages"). */
export default function WorkPage() {
  const entries = wallEntries();
  return (
    <main id="main" className="v2-page v2-work-film v3">
      <V2WorkIndex entries={entries} title="Work" lead="Websites, business systems, social media and photography, made in Tanzania.">
        {/* after the wall: a line about the work, then the filters and every picture */}
        <section className="v2-wa__body v2-work-note" aria-label="About this work">
          <p className="v2-wa__lead">
            Working Across <b>Companies, Hotels And Brands Across Tanzania</b>, Building <b>Client-Tailored Software,
            {' '}Applications, Websites</b>, And More, But Not Limited To These. <b>More Than 20 Projects Completed</b>, And More Ongoing.
          </p>
        </section>
        <V2WorkBrowser cats={workData()} initial={{ c: null, s: null }} archive />
        <Cta />
      </V2WorkIndex>
    </main>
  );
}
