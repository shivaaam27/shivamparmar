import type { Metadata } from 'next';
import { site } from '@/lib/content';
import { AboutDisciplines, AboutHighlights, AboutOpen } from '@/components/v2/AboutScenes';
import { BrandsGrid } from '@/components/v2/BrandsScene';
import { V2Contact } from '@/components/v2/Home';

export const metadata: Metadata = {
  title: `About — ${site.fullName}`,
  description: 'About Shivam Parmar, who runs Shivo Labs, a freelance software and digital solutions business in Dar es Salaam: pharmacist (BPharm, MSc Pharmacovigilance), photographer and systems builder.',
  alternates: { canonical: '/about' },
};

/**
 * V2 /about, told as held scenes like the home page: hello → what I do (+ the belief and figures) →
 * highlights → brands → contact, the footer sliding over the end. Each scene ends on the colour the next starts with.
 */
export default function AboutV2() {
  return (
    <main id="main" className="v2-home v2-aboutp">
      <AboutOpen />
      <AboutDisciplines />
      {/* one held screen: the highlights slide past, then the same screen turns cream and becomes the brands */}
      <AboutHighlights><BrandsGrid /></AboutHighlights>
      <V2Contact />
    </main>
  );
}
