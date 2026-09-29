/** The small square marker every section opens with. */
export default function Tag({ children }: { children: string }) {
  return <span className="tag">{children}</span>;
}
