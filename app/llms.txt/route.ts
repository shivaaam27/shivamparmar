import { aboutPage, site } from '@/lib/content';
import { pagedProjects } from '@/lib/work';
import { siteUrl } from '@/lib/seo';

/**
 * /llms.txt: a plain, factual summary of who this site is about, for AI
 * assistants and AI search (ChatGPT, Perplexity, Claude, Gemini…). Built from
 * the same content as the site, so it never drifts out of date.
 */
export const dynamic = 'force-static';

export function GET() {
  const url = siteUrl();
  const facts = aboutPage.facts.map((f) => `- ${f.label}: ${f.value}`).join('\n');
  const work = pagedProjects().map(({ project, category }) => `- [${project.title}](${url}/work/${project.slug}) (${category.name})${project.summary ? `: ${project.summary}` : ''}`).join('\n');
  const journey = aboutPage.experience.map((e) => `- ${e.years}: ${e.role}, ${e.place}. ${e.text}`).join('\n');
  const body = `# ${site.fullName}

> ${site.description}

${aboutPage.intro.join(' ')}

## Quick facts
${facts}

## What I do
${aboutPage.disciplines.map((d) => `- ${d.title}: ${d.text}`).join('\n')}

## Journey
${journey}

## Work
${work}

## Contact
- Email: ${site.email}
- Phone and WhatsApp: ${site.phones.map((p) => p.label).join(', ')}
- Based in: ${site.location}

## Profiles
${site.sameAs.map((u) => `- ${u}`).join('\n')}

## Pages
- [Home](${url}/)
- [About](${url}/about)
- [Work](${url}/work)
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
