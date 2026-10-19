/**
 * Questions people ask before they hire Shivo Labs, in English and Kiswahili. Shown on /faq and /sw/maswali and
 * marked up for search engines (schema.org FAQPage), which is what Google and AI assistants quote from.
 * Keep answers short, plain and true; prices and timelines stay general until Shivam sets fixed ones.
 */

export type Qa = { q: string; a: string };

export const faq: { en: Qa[]; sw: Qa[] } = {
  en: [
    { q: 'What does Shivo Labs do?', a: 'Shivo Labs is a digital solutions company in Dar es Salaam, Tanzania. It builds websites and apps, custom business systems, AI workflows and automation, and creates branding, photography and social media content.' },
    { q: 'How much does a website cost in Tanzania?', a: 'It depends on the number of pages, the languages, and whether you need features like a product catalogue, bookings or a client login. After a free first conversation you get a written quote with a fixed price and timeline, so there are no surprises.' },
    { q: 'How long does it take to build a website?', a: 'A simple company website is quicker than a web app with logins and payments. The timeline is agreed in writing before work starts, and you can follow the progress on your own phone.' },
    { q: 'Can my website be in English and Kiswahili?', a: 'Yes. Websites can be in English, Kiswahili or both, with each language set up so Google and AI assistants find the right one for each visitor.' },
    { q: 'Will my website show up on Google and in AI assistants like ChatGPT?', a: 'Every site is set up for search from the start: Google Search Console, Bing (which ChatGPT search and Copilot use), clear page titles, structured data and an AI-readable summary. Ranking also depends on good content over time, which Shivo Labs can help you write.' },
    { q: 'Do you build custom software, not just websites?', a: 'Yes. Shivo Labs builds business systems such as task and document management for groups of companies, dashboards for directors, and internal tools that replace spreadsheets and paper forms.' },
    { q: 'How can AI help my business?', a: 'Mostly by taking over the tasks that repeat: reports, summaries, data entry, reminders and first drafts of replies. The best start is one task automated end to end, with the hours saved measured, before doing more.' },
    { q: 'Do you work with businesses outside Dar es Salaam?', a: 'Yes. Shivo Labs works with businesses across Tanzania, East Africa and the rest of Africa, in person in Dar es Salaam or online anywhere.' },
    { q: 'Do you set up the domain, hosting and email?', a: 'Yes. Shivo Labs can register your domain (such as .co.tz or .com), host the site and set up business email, or work with what you already have.' },
    { q: 'How do I start?', a: 'Send a message on WhatsApp, call, or email info@shivolabs.co.tz with a few lines about your business and what you need. The first conversation is free.' },
  ],
  sw: [
    { q: 'Shivo Labs inafanya nini?', a: 'Shivo Labs ni kampuni ya suluhisho za kidijitali jijini Dar es Salaam, Tanzania. Inajenga tovuti na programu, mifumo maalum ya biashara, mifumo ya AI na otomatiki, na kutengeneza chapa, picha na maudhui ya mitandao ya kijamii.' },
    { q: 'Tovuti inagharimu kiasi gani Tanzania?', a: 'Inategemea idadi ya kurasa, lugha, na kama unahitaji vitu kama katalogi ya bidhaa, kuweka nafasi au akaunti za wateja. Baada ya mazungumzo ya kwanza ya bure unapata nukuu ya maandishi yenye bei na muda kamili, bila mshangao.' },
    { q: 'Inachukua muda gani kujenga tovuti?', a: 'Tovuti rahisi ya kampuni huchukua muda mfupi kuliko programu ya mtandaoni yenye akaunti na malipo. Muda unakubaliwa kwa maandishi kabla kazi haijaanza, na unaweza kufuatilia maendeleo kwenye simu yako.' },
    { q: 'Tovuti yangu inaweza kuwa kwa Kiingereza na Kiswahili?', a: 'Ndiyo. Tovuti inaweza kuwa kwa Kiingereza, Kiswahili au zote mbili, kila lugha ikiwa imeandaliwa ili Google na wasaidizi wa AI wampe kila mgeni lugha sahihi.' },
    { q: 'Tovuti yangu itaonekana Google na kwenye AI kama ChatGPT?', a: 'Kila tovuti inaandaliwa kwa ajili ya utafutaji tangu mwanzo: Google Search Console, Bing (ambayo ChatGPT na Copilot hutumia), vichwa vya kurasa vilivyo wazi na muhtasari unaosomeka na AI. Kupanda juu kwenye matokeo pia kunategemea maudhui mazuri kwa muda, na Shivo Labs inaweza kukusaidia kuyaandika.' },
    { q: 'Mnajenga mifumo ya biashara, si tovuti tu?', a: 'Ndiyo. Shivo Labs hujenga mifumo ya biashara kama usimamizi wa kazi na nyaraka kwa makundi ya kampuni, dashibodi za wakurugenzi, na zana za ndani zinazochukua nafasi ya majedwali na fomu za karatasi.' },
    { q: 'AI inawezaje kusaidia biashara yangu?', a: 'Hasa kwa kufanya kazi zinazojirudia: ripoti, muhtasari, kuingiza taarifa, vikumbusho na rasimu za kwanza za majibu. Mwanzo bora ni kazi moja kujiendesha yenyewe mwanzo hadi mwisho, na kupima saa zilizookolewa, kabla ya kuongeza nyingine.' },
    { q: 'Mnafanya kazi na biashara nje ya Dar es Salaam?', a: 'Ndiyo. Shivo Labs inafanya kazi na biashara kote Tanzania, Afrika Mashariki na Afrika nzima, ana kwa ana Dar es Salaam au mtandaoni popote.' },
    { q: 'Mnasajili domain, hosting na barua pepe?', a: 'Ndiyo. Shivo Labs inaweza kusajili domain yako (kama .co.tz au .com), kuweka tovuti hewani na kuandaa barua pepe za biashara, au kufanya kazi na ulichonacho tayari.' },
    { q: 'Ninaanzaje?', a: 'Tuma ujumbe WhatsApp, piga simu, au tuma barua pepe kwa info@shivolabs.co.tz ukieleza kwa mistari michache kuhusu biashara yako na unachohitaji. Mazungumzo ya kwanza ni bure.' },
  ],
};
