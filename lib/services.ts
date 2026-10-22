/**
 * What Shivo Labs offers, in English and Kiswahili. One entry per service: each gets a page in both languages
 * (/services/<slug> and /sw/huduma/<swSlug>), is listed in the sitemap and llms.txt, and is described to search
 * engines as a Service of Shivo Labs. Edit the words here; the pages only handle layout.
 */

export type Lang = 'en' | 'sw';
export type ServiceText = {
  title: string;
  /** one line, for lists and the page description */
  short: string;
  /** the opening paragraph */
  lead: string;
  offer: string[];
  forWho: string[];
  steps: { title: string; text: string }[];
};
/** picture: what the services page shows behind this service (defaults to its first work's cover) */
export type Service = { slug: string; swSlug: string; work: string[]; picture?: string; en: ServiceText; sw: ServiceText };

export const services: Service[] = [
  {
    slug: 'websites-and-apps',
    swSlug: 'tovuti-na-programu',
    work: ['oracle-consultancy-group', 'terragreen-website', 'cocozuri-website', 'v1-supermarket-website'],
    picture: '/images/websites/terragreen-poster.jpg',
    en: {
      title: 'Websites and apps',
      short: 'Websites and web apps for businesses in Tanzania and East Africa, fast on any phone and easy to find on Google and AI search.',
      lead: 'A website is often the first thing a customer sees of your business. Shivo Labs designs and builds websites and web apps in Dar es Salaam that load fast on any phone and any network, read well in English and Kiswahili, and are set up to be found on Google and in AI assistants like ChatGPT and Claude.',
      offer: [
        'Company websites, landing pages and online catalogues',
        'Web apps: booking, ordering, client portals and internal tools',
        'Websites in English, Kiswahili or both',
        'Search set-up from day one: Google Search Console, Bing, page titles, structured data and AI-readable summaries',
        'Domain, hosting and business email set-up (.co.tz, .com and others)',
        'Changes and support after launch',
      ],
      forWho: ['Companies that need a clear, trustworthy website', 'Shops and brands that want customers to browse products online', 'Groups of companies that want one site for all their businesses'],
      steps: [
        { title: 'Talk', text: 'A first conversation about your business, your customers and what the site has to do.' },
        { title: 'Plan', text: 'The pages, the words and the look, agreed in writing with a clear quote and timeline.' },
        { title: 'Build', text: 'Design and build, with previews you can open on your own phone along the way.' },
        { title: 'Launch', text: 'Go live on your domain, connect Google and Bing, and hand over everything you own.' },
      ],
    },
    sw: {
      title: 'Tovuti na programu',
      short: 'Tovuti na programu za mtandaoni kwa biashara Tanzania na Afrika Mashariki: zinafunguka haraka kwenye simu yoyote na zinapatikana kwa urahisi Google na kwenye AI.',
      lead: 'Tovuti mara nyingi ndiyo kitu cha kwanza mteja anachoona kuhusu biashara yako. Shivo Labs husanifu na kujenga tovuti na programu za mtandaoni jijini Dar es Salaam ambazo zinafunguka haraka kwenye simu yoyote na mtandao wowote, zinasomeka vizuri kwa Kiingereza na Kiswahili, na zimeandaliwa kupatikana Google na kwenye wasaidizi wa AI kama ChatGPT na Claude.',
      offer: [
        'Tovuti za kampuni, kurasa za matangazo na katalogi za bidhaa mtandaoni',
        'Programu za mtandaoni: kuweka nafasi, kuagiza, tovuti za wateja na zana za ndani',
        'Tovuti kwa Kiingereza, Kiswahili au zote mbili',
        'Maandalizi ya kupatikana kwenye utafutaji tangu siku ya kwanza: Google Search Console, Bing, vichwa vya kurasa na muhtasari unaosomeka na AI',
        'Kusajili domain, hosting na barua pepe za biashara (.co.tz, .com na nyingine)',
        'Marekebisho na msaada baada ya kuzindua',
      ],
      forWho: ['Kampuni zinazohitaji tovuti iliyo wazi na ya kuaminika', 'Maduka na chapa zinazotaka wateja waangalie bidhaa mtandaoni', 'Makundi ya kampuni yanayotaka tovuti moja kwa biashara zao zote'],
      steps: [
        { title: 'Mazungumzo', text: 'Mazungumzo ya kwanza kuhusu biashara yako, wateja wako na kile tovuti inapaswa kufanya.' },
        { title: 'Mpango', text: 'Kurasa, maneno na muonekano, vinakubaliwa kwa maandishi pamoja na bei na muda kamili.' },
        { title: 'Kujenga', text: 'Kusanifu na kujenga, na unaweza kuangalia hatua kwa hatua kwenye simu yako.' },
        { title: 'Kuzindua', text: 'Tovuti inaingia hewani kwenye domain yako, tunaiunganisha na Google na Bing, na unakabidhiwa kila kitu ambacho ni mali yako.' },
      ],
    },
  },
  {
    slug: 'custom-software',
    swSlug: 'mifumo-ya-biashara',
    work: ['task-management', 'shivo-labs'],
    en: {
      title: 'Custom software and business systems',
      short: 'Business systems built around how your company works: tasks, files, permits, stock and reports in one place.',
      lead: 'Spreadsheets and WhatsApp groups only go so far. Shivo Labs builds custom systems around how your company actually works: tasks, files, approvals, permits and reports in one place, for one company or a whole group of companies. Built in Tanzania, for the way work is done here.',
      offer: [
        'Task and project management for teams and groups of companies',
        'Document and file management, with renewals of permits and certificates flagged in time',
        'Dashboards and reports for directors',
        'Internal tools that replace spreadsheets and paper forms',
        'Desktop and phone apps when a website is not enough',
        'Training for your team, and support as the business grows',
      ],
      forWho: ['Groups of companies that share one team', 'Managers who need to see what is done and what is late', 'Businesses whose files and deadlines live in too many places'],
      steps: [
        { title: 'Understand', text: 'Time with the people who will use the system, to see how work really flows today.' },
        { title: 'Design', text: 'Screens and steps agreed before building, so the system fits the work and not the other way round.' },
        { title: 'Build in stages', text: 'The most useful part first, in your hands early, then the rest piece by piece.' },
        { title: 'Run', text: 'Training, data moved over from the old way, and support afterwards.' },
      ],
    },
    sw: {
      title: 'Mifumo maalum ya biashara',
      short: 'Mifumo ya biashara iliyojengwa kulingana na jinsi kampuni yako inavyofanya kazi: kazi, nyaraka, vibali, stoo na ripoti mahali pamoja.',
      lead: 'Majedwali (spreadsheets) na makundi ya WhatsApp yana kikomo. Shivo Labs hujenga mifumo maalum kulingana na jinsi kampuni yako inavyofanya kazi kweli: kazi, nyaraka, idhini, vibali na ripoti mahali pamoja, kwa kampuni moja au kundi zima la kampuni. Imejengwa Tanzania, kwa jinsi kazi inavyofanyika hapa.',
      offer: [
        'Usimamizi wa kazi na miradi kwa timu na makundi ya kampuni',
        'Usimamizi wa nyaraka na faili, na kukumbushwa mapema kuhusu kuhuisha vibali na vyeti',
        'Dashibodi na ripoti kwa wakurugenzi',
        'Zana za ndani zinazochukua nafasi ya majedwali na fomu za karatasi',
        'Programu za kompyuta na simu pale tovuti haitoshi',
        'Mafunzo kwa timu yako, na msaada kadri biashara inavyokua',
      ],
      forWho: ['Makundi ya kampuni yanayotumia timu moja', 'Mameneja wanaohitaji kuona kilichokamilika na kilichochelewa', 'Biashara ambazo nyaraka na tarehe za mwisho ziko sehemu nyingi mno'],
      steps: [
        { title: 'Kuelewa', text: 'Muda na watu watakaotumia mfumo, kuona jinsi kazi inavyokwenda leo.' },
        { title: 'Kusanifu', text: 'Skrini na hatua zinakubaliwa kabla ya kujenga, ili mfumo ufuate kazi na si kinyume chake.' },
        { title: 'Kujenga kwa hatua', text: 'Sehemu yenye manufaa zaidi kwanza, mikononi mwako mapema, kisha zinazobaki moja baada ya nyingine.' },
        { title: 'Kuendesha', text: 'Mafunzo, kuhamisha taarifa kutoka njia ya zamani, na msaada baadaye.' },
      ],
    },
  },
  {
    slug: 'ai-automation',
    swSlug: 'akili-bandia-na-otomatiki',
    work: ['task-management'],
    picture: '/images/work-dashboard.jpg',
    en: {
      title: 'AI workflows and automation',
      short: 'AI and automation that save your team hours every week: reports, replies, data entry and documents done for you.',
      lead: 'Much of the work in an office repeats every day: copying data, writing the same replies, preparing the same reports. Shivo Labs designs AI workflows with tools like Claude and builds automations into your everyday work, so the repetitive part happens by itself and your people spend their time where it matters.',
      offer: [
        'AI assistants trained on your own documents and processes',
        'Automatic reports, summaries and reminders',
        'Data entry and document handling without the copying and pasting',
        'Customer replies drafted by AI and checked by your team',
        'Prompt engineering for reliable, repeatable results',
        'Advice on where AI helps your business, and where it does not',
      ],
      forWho: ['Teams that spend hours on the same tasks every week', 'Companies that want to use AI safely with their own data', 'Managers curious about AI who want a clear first step'],
      steps: [
        { title: 'Find the hours', text: 'Look at the week of your team and find the tasks that repeat.' },
        { title: 'Try one', text: 'Automate one task end to end, measure the hours saved.' },
        { title: 'Roll out', text: 'Bring it into everyday work, with your team trained and in control.' },
        { title: 'Grow', text: 'Add the next task, and the next, as the savings show.' },
      ],
    },
    sw: {
      title: 'Akili bandia (AI) na otomatiki',
      short: 'AI na otomatiki zinazookoa saa nyingi za timu yako kila wiki: ripoti, majibu, kuingiza taarifa na nyaraka vinafanyika vyenyewe.',
      lead: 'Kazi nyingi ofisini hujirudia kila siku: kunakili taarifa, kuandika majibu yaleyale, kuandaa ripoti zilezile. Shivo Labs husanifu mifumo ya AI kwa zana kama Claude na kujenga otomatiki ndani ya kazi zako za kila siku, ili sehemu inayojirudia ifanyike yenyewe na watu wako watumie muda wao pale panapohitajika zaidi.',
      offer: [
        'Wasaidizi wa AI wanaojua nyaraka na taratibu zako',
        'Ripoti, muhtasari na vikumbusho vinavyojitengeneza vyenyewe',
        'Kuingiza taarifa na kushughulikia nyaraka bila kunakili na kubandika',
        'Majibu kwa wateja yanayoandaliwa na AI na kukaguliwa na timu yako',
        'Uandishi wa maelekezo (prompts) kwa matokeo ya kuaminika',
        'Ushauri wa wapi AI inasaidia biashara yako, na wapi haisaidii',
      ],
      forWho: ['Timu zinazotumia saa nyingi kwa kazi zilezile kila wiki', 'Kampuni zinazotaka kutumia AI kwa usalama na taarifa zao wenyewe', 'Mameneja wanaotaka hatua ya kwanza iliyo wazi kuelekea AI'],
      steps: [
        { title: 'Kutafuta saa', text: 'Kuangalia wiki ya timu yako na kutambua kazi zinazojirudia.' },
        { title: 'Kujaribu moja', text: 'Kufanya kazi moja ijiendeshe yenyewe mwanzo hadi mwisho, na kupima saa zilizookolewa.' },
        { title: 'Kuanza kutumia', text: 'Kuiingiza kwenye kazi za kila siku, timu ikiwa imefundishwa na ikiwa na udhibiti.' },
        { title: 'Kukua', text: 'Kuongeza kazi inayofuata, na nyingine, kadri faida inavyoonekana.' },
      ],
    },
  },
  {
    slug: 'branding-and-social-media',
    swSlug: 'chapa-na-mitandao-ya-kijamii',
    work: ['cocozuri-social', 'dar-distributors'],
    en: {
      title: 'Branding, content and social media',
      short: 'Brand identity, photography, posters and social media posts that make a business look as good as it is.',
      lead: 'People judge a brand in seconds, on a phone screen. Shivo Labs creates the look and the content that make a business recognisable: logos and brand identity, photography, posters, and social media posts planned month by month, for brands in Tanzania and beyond.',
      offer: [
        'Brand identity: logo, colours, type and a simple brand guide',
        'Product, hotel and place photography',
        'Posters, menus, flyers and company profiles',
        'Social media posts, reels and monthly content plans',
        'Captions in English and Kiswahili',
        'A consistent look across website, social media and print',
      ],
      forWho: ['New brands that need to look established', 'Food, hospitality and retail businesses that sell with pictures', 'Companies whose social media has no plan or no time'],
      steps: [
        { title: 'Listen', text: 'Who your customers are and what the brand should feel like.' },
        { title: 'Shape', text: 'The look and the voice, agreed before any posts go out.' },
        { title: 'Create', text: 'Photos, designs and posts made to the plan.' },
        { title: 'Keep going', text: 'A monthly rhythm, with the numbers checked and the plan adjusted.' },
      ],
    },
    sw: {
      title: 'Chapa, maudhui na mitandao ya kijamii',
      short: 'Utambulisho wa chapa, picha, mabango na machapisho ya mitandao ya kijamii yanayoonyesha ubora halisi wa biashara.',
      lead: 'Watu huihukumu chapa ndani ya sekunde chache, kwenye skrini ya simu. Shivo Labs hutengeneza muonekano na maudhui yanayofanya biashara itambulike: nembo na utambulisho wa chapa, picha, mabango, na machapisho ya mitandao ya kijamii yaliyopangwa mwezi kwa mwezi, kwa chapa Tanzania na kwingineko.',
      offer: [
        'Utambulisho wa chapa: nembo, rangi, maandishi na mwongozo rahisi wa chapa',
        'Picha za bidhaa, hoteli na maeneo',
        'Mabango, menyu, vipeperushi na wasifu wa kampuni',
        'Machapisho ya mitandao ya kijamii, reels na mipango ya maudhui ya kila mwezi',
        'Maelezo ya machapisho kwa Kiingereza na Kiswahili',
        'Muonekano mmoja kwenye tovuti, mitandao ya kijamii na machapisho ya karatasi',
      ],
      forWho: ['Chapa mpya zinazotaka kuonekana zimeimarika', 'Biashara za vyakula, hoteli na maduka zinazouza kwa picha', 'Kampuni ambazo mitandao yao ya kijamii haina mpango au muda'],
      steps: [
        { title: 'Kusikiliza', text: 'Wateja wako ni akina nani na chapa inapaswa kuonekanaje.' },
        { title: 'Kuunda', text: 'Muonekano na sauti ya chapa, vinakubaliwa kabla ya chapisho lolote.' },
        { title: 'Kutengeneza', text: 'Picha, michoro na machapisho kulingana na mpango.' },
        { title: 'Kuendelea', text: 'Utaratibu wa kila mwezi, takwimu zikikaguliwa na mpango ukirekebishwa.' },
      ],
    },
  },
];

export const findService = (slug: string) => services.find((s) => s.slug === slug);
export const findServiceSw = (slug: string) => services.find((s) => s.swSlug === slug);

/** Where Shivo Labs works, for pages and for search engines (schema.org areaServed). */
export const areas = {
  en: 'Based in Dar es Salaam. Working with businesses across Tanzania, East Africa (Kenya, Uganda, Rwanda, Burundi), the rest of Africa and beyond, in person or online.',
  sw: 'Tuko Dar es Salaam. Tunafanya kazi na biashara kote Tanzania, Afrika Mashariki (Kenya, Uganda, Rwanda, Burundi), Afrika nzima na kwingineko, ana kwa ana au mtandaoni.',
  schema: ['Tanzania', 'Kenya', 'Uganda', 'Rwanda', 'Burundi', 'East Africa', 'Africa'],
};
