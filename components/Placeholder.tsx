import type { Tone } from '@/lib/content';

/** Shows the image if there is one, otherwise a tonal stand-in. */
export default function Placeholder({ tone, image, alt = '' }: { tone: Tone; image?: string | null; alt?: string }) {
  return image
    ? <img className="ph" src={image} alt={alt} />
    : <span className="ph" data-tone={tone} />;
}
