/** The small square marker every section opens with. Decodes on scroll (see Effects). */
export default function Tag({ children }: { children: string }) {
  return <span className="tag" data-scramble aria-label={children}>{children}</span>;
}
