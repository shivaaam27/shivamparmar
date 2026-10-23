import { parts } from '@/lib/copy';

/** A text from content/site-text.json, with its [[marked]] words in bold. */
export default function Rich({ text }: { text: string }) {
  return <>{parts(text).map((p, i) => (p.hl ? <b key={i}>{p.t}</b> : <span key={i}>{p.t}</span>))}</>;
}
