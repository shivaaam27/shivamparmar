import type { Metadata } from 'next';
import { Page } from '@/components/site/Kit';
import ContactPage from '@/components/site/ContactPage';
import { contact, site } from '@/lib/content';
import { services } from '@/lib/services';
import { faq } from '@/lib/faq';
import { faqLd, graph } from '@/lib/schema';
import { JsonLd } from '@/components/site/Kit';
import Faq from '@/components/site/Faq';

export const metadata: Metadata = {
  title: 'Contact — Shivo Labs, Dar es Salaam',
  description: 'Contact Shivo Labs in Dar es Salaam on WhatsApp, by phone or by email about a website, an app, a business system, AI and automation, or branding.',
  alternates: { canonical: '/#contact' },
};

/** /contact: one full screen with every way to reach Shivo Labs. */
export default function Contact() {
  const profiles = [
    { label: 'LinkedIn', href: site.sameAs.find((u) => u.includes('linkedin')) },
    { label: 'Instagram', href: site.sameAs.find((u) => u.includes('instagram')) },
  ].filter((p): p is { label: string; href: string } => Boolean(p.href));
  return (
    <Page className="v2-contactp v3" cta={false}>
      <ContactPage headline={[contact.headline[0], contact.headline[1]]} email={site.email} phone={site.phones[0]} location={site.location}
        profiles={profiles} topics={services.map((s) => s.en.title)} />
      <JsonLd data={graph(faqLd(faq.en, 'en'))} />
      <section className="v2-ctq" id="faq" aria-labelledby="faq-title">
        <div className="v2-ctq__in">
          <h2 id="faq-title" className="v2-ctq__title">Questions people ask <em>before they start</em></h2>
          <Faq items={faq.en} />
        </div>
      </section>
    </Page>
  );
}
