/**
 * The languages the Journal can be written in, and the words around a post in each of them. A post in a language is a
 * Markdown file with `lang: <code>` (content/journal); a language shows in the language button as soon as one post
 * exists in it. English is the default everywhere. Add a language here, and its font in app/layout.tsx.
 */

export type PostLang = 'en' | 'sw' | 'fr' | 'ar' | 'hi' | 'gu';

/** The order in the language button: English first. */
export const POST_LANGS: PostLang[] = ['en', 'sw', 'fr', 'ar', 'hi', 'gu'];

/** Each language written in itself. */
export const LANG_NAMES: Record<PostLang, string> = {
  en: 'English', sw: 'Kiswahili', fr: 'Français', ar: 'العربية', hi: 'हिन्दी', gu: 'ગુજરાતી',
};

export const isPostLang = (v: unknown): v is PostLang => POST_LANGS.includes(v as PostLang);
export const isRtl = (lang: PostLang) => lang === 'ar';

/** For dates (Intl). Arabic keeps the digits 0-9. */
export const LOCALE: Record<PostLang, string> = { en: 'en-GB', sw: 'sw-TZ', fr: 'fr-FR', ar: 'ar-u-nu-latn', hi: 'hi-IN', gu: 'gu-IN' };
/** For search engines (inLanguage, RSS). */
export const BCP47: Record<PostLang, string> = { en: 'en', sw: 'sw-TZ', fr: 'fr', ar: 'ar', hi: 'hi', gu: 'gu' };
/** For hreflang. */
export const HREFLANG: Record<PostLang, string> = { en: 'en', sw: 'sw', fr: 'fr', ar: 'ar', hi: 'hi', gu: 'gu' };

export type PostWords = {
  home: string; journal: string; allPosts: string; newer: string; older: string; minutes: (n: number) => string;
  latest: string; read: string; everyTopic: string; breadcrumb: string; alsoIn: string;
  inArticle: string; textSize: string; size: string;
  ctaTitle: string; ctaText: string; whatsapp: string; email: string;
};

/** The words on the Journal list and on a post, in each language. */
export const WORDS: Record<PostLang, PostWords> = {
  en: {
    home: 'Home', journal: 'Journal', allPosts: 'All posts', newer: 'Newer post', older: 'Older post', minutes: (n) => `${n} min read`,
    latest: 'Latest', read: 'Read', everyTopic: 'Every topic', breadcrumb: 'Breadcrumb', alsoIn: 'Also in',
    inArticle: 'In this article', textSize: 'Text size', size: 'Size',
    ctaTitle: 'Tell us what you need', ctaText: 'The first conversation is free.', whatsapp: 'WhatsApp', email: 'Email',
  },
  sw: {
    home: 'Mwanzo', journal: 'Makala', allPosts: 'Makala zote', newer: 'Makala mpya zaidi', older: 'Makala iliyotangulia', minutes: (n) => `Dakika ${n} kusoma`,
    latest: 'Mpya zaidi', read: 'Soma', everyTopic: 'Mada zote', breadcrumb: 'Ulipo', alsoIn: 'Pia kwa',
    inArticle: 'Yaliyomo', textSize: 'Ukubwa wa maandishi', size: 'Ukubwa',
    ctaTitle: 'Tuambie unachohitaji', ctaText: 'Mazungumzo ya kwanza ni bure.', whatsapp: 'WhatsApp', email: 'Barua pepe',
  },
  fr: {
    home: 'Accueil', journal: 'Journal', allPosts: 'Tous les articles', newer: 'Article plus récent', older: 'Article précédent', minutes: (n) => `${n} min de lecture`,
    latest: 'Dernier article', read: 'Lire', everyTopic: 'Tous les sujets', breadcrumb: 'Fil d’Ariane', alsoIn: 'Aussi en',
    inArticle: 'Dans cet article', textSize: 'Taille du texte', size: 'Taille',
    ctaTitle: 'Dites-nous ce dont vous avez besoin', ctaText: 'La première conversation est gratuite.', whatsapp: 'WhatsApp', email: 'E-mail',
  },
  ar: {
    home: 'الرئيسية', journal: 'المقالات', allPosts: 'كل المقالات', newer: 'مقال أحدث', older: 'مقال أقدم', minutes: (n) => `القراءة: ${n} د`,
    latest: 'الأحدث', read: 'اقرأ', everyTopic: 'كل المواضيع', breadcrumb: 'مسار التنقل', alsoIn: 'متوفر أيضًا بـ',
    inArticle: 'في هذا المقال', textSize: 'حجم النص', size: 'الحجم',
    ctaTitle: 'أخبرنا بما تحتاجه', ctaText: 'المحادثة الأولى مجانية.', whatsapp: 'واتساب', email: 'البريد الإلكتروني',
  },
  hi: {
    home: 'होम', journal: 'लेख', allPosts: 'सभी लेख', newer: 'नया लेख', older: 'पिछला लेख', minutes: (n) => `${n} मिनट पढ़ें`,
    latest: 'नवीनतम', read: 'पढ़ें', everyTopic: 'सभी विषय', breadcrumb: 'आप यहाँ हैं', alsoIn: 'इन भाषाओं में भी',
    inArticle: 'इस लेख में', textSize: 'अक्षरों का आकार', size: 'आकार',
    ctaTitle: 'बताइए, आपको क्या चाहिए', ctaText: 'पहली बातचीत मुफ़्त है।', whatsapp: 'WhatsApp', email: 'ईमेल',
  },
  gu: {
    home: 'હોમ', journal: 'લેખો', allPosts: 'બધા લેખો', newer: 'નવો લેખ', older: 'અગાઉનો લેખ', minutes: (n) => `${n} મિનિટ વાંચન`,
    latest: 'તાજેતરનો', read: 'વાંચો', everyTopic: 'બધા વિષયો', breadcrumb: 'તમે અહીં છો', alsoIn: 'આ ભાષાઓમાં પણ',
    inArticle: 'આ લેખમાં', textSize: 'અક્ષરોનું કદ', size: 'કદ',
    ctaTitle: 'અમને કહો, તમને શું જોઈએ છે', ctaText: 'પહેલી વાતચીત મફત છે.', whatsapp: 'WhatsApp', email: 'ઇમેઇલ',
  },
};
