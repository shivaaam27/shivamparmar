/**
 * Section openers ("01 About" with a rule) were removed on request (V2 shows no numbered labels).
 * Kept as a no-op so callers stay simple; delete the calls when V2 becomes the site.
 */
export function Kicker(_props: { n?: string | number; children: React.ReactNode; className?: string }) {
  return null;
}
