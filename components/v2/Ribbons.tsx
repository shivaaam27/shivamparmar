/**
 * Ribbons: thick loop lines with round ends that keep moving (from the ribbon film in the reference board,
 * first seen on the AI card). Each line has its own way of moving:
 *   run     a long stretch of the line travels along it, forever
 *   breathe it gets thicker and thinner
 *   draw    it draws itself, holds, then undraws
 *   sway    it rocks gently from side to side
 *   pulse   small beads run along it
 * Presets below are used by the hero, page tops and the About highlights; all stop for reduced motion.
 */
export type Ribbon = { d: string; c: string; w: number; mode: 'run' | 'breathe' | 'draw' | 'sway' | 'pulse'; s: number; rev?: boolean; dash?: number; op?: number };

export const RIBBON_SETS: Record<string, { box: string; lines: Ribbon[] }> = {
  /* the home hero: tone on tone on lime, and one fine green line that keeps running */
  hero: {
    box: '0 0 1440 900',
    lines: [
      { d: 'M-140 640C40 600 170 690 220 790s-40 170-130 130 0-210 170-210 270 120 360 260', c: 'var(--lime-3)', w: 78, mode: 'breathe', s: 11 },
      { d: 'M1580 40c-130 10-190 90-270 130s-170 20-150-50 120-70 130 20-40 190-170 210', c: 'var(--lime-2)', w: 48, mode: 'sway', s: 13 },
      { d: 'M-80 250C70 190 170 110 290 140s110 120 30 130-60-120 80-150 200 0 290-40', c: 'var(--lime-2)', w: 26, mode: 'run', s: 15, dash: .7 },
      { d: 'M-60 640C180 600 350 700 560 660s310-150 470-130 240 90 520 30', c: 'var(--forest)', w: 2, mode: 'run', s: 20, dash: .6, op: .4 },
    ],
  },
  /* the AI card's original three */
  card: {
    box: '0 0 300 200',
    lines: [
      { d: 'M-20 40C60 20 90 110 160 120s100-60 160 40', c: 'var(--teal)', w: 20, mode: 'run', s: 13, rev: true },
      { d: 'M-20 160C40 160 60 60 110 70s40 70 0 70-20-90 40-100 80 90 190 50', c: 'var(--lime)', w: 22, mode: 'run', s: 9 },
      { d: 'M210-20c-20 60 60 80 40 130s-80 60-40 120', c: 'var(--paper)', w: 12, mode: 'run', s: 15 },
    ],
  },
  /* page tops on deep green: quiet, two tones of green and one lime thread */
  page: {
    box: '0 0 1440 600',
    lines: [
      { d: 'M820 680C900 520 1040 420 1140 470s40 180-50 170-40-220 120-260 220 40 300-20', c: 'var(--pine)', w: 80, mode: 'breathe', s: 12 },
      { d: 'M1500 90c-140 10-210 120-320 100s-60-120 20-110 40 170-80 220', c: 'var(--forest-2)', w: 46, mode: 'sway', s: 14 },
      { d: 'M700 640C820 560 900 470 1010 500s40 150-40 130-30-170 90-190 260 60 420 0', c: 'var(--lime)', w: 3, mode: 'run', s: 16, dash: .5, op: .8 },
    ],
  },
  /* the eight About highlights: one ribbon each, each moving its own way */
  h1: { box: '0 0 300 200', lines: [{ d: 'M-20 150C60 150 80 50 140 60s50 90-10 90-30-110 60-120 90 60 150 40', c: 'var(--lime)', w: 18, mode: 'run', s: 8 }] },
  h2: { box: '0 0 300 200', lines: [{ d: 'M-30 80C50 30 120 160 190 110s70-90 140-40', c: 'var(--teal)', w: 30, mode: 'breathe', s: 6 }, { d: 'M-30 160c80-40 160 30 240-10s80-40 120-10', c: 'var(--lime)', w: 6, mode: 'run', s: 11 }] },
  h3: { box: '0 0 300 200', lines: [{ d: 'M20 170C40 90 130 40 170 80s0 110-50 90-40-120 40-150 110 10 150 60', c: 'var(--sun)', w: 16, mode: 'draw', s: 6 }] },
  h4: { box: '0 0 300 200', lines: [{ d: 'M-10 100c40-60 80-60 120 0s80 60 120 0 80-60 120 0', c: 'var(--lime)', w: 20, mode: 'sway', s: 7 }] },
  h5: { box: '0 0 300 200', lines: [{ d: 'M-20 60C80 40 120 170 200 140s80-120 140-90', c: 'var(--paper)', w: 8, mode: 'pulse', s: 16 }, { d: 'M-20 170C60 150 140 100 320 130', c: 'var(--teal)', w: 14, mode: 'run', s: 12, rev: true }] },
  h6: { box: '0 0 300 200', lines: [{ d: 'M150 100m-60 0a60 60 0 1 1 120 0a60 60 0 1 1-120 0', c: 'var(--lime)', w: 14, mode: 'run', s: 6, dash: .35 }, { d: 'M150 100m-90 0a90 90 0 1 1 180 0a90 90 0 1 1-180 0', c: 'var(--pine)', w: 22, mode: 'run', s: 10, rev: true, dash: .5 }] },
  h7: { box: '0 0 300 200', lines: [{ d: 'M-20 120c30-50 60-50 90 0s60 50 90 0 60-50 90 0 60 50 90 0', c: 'var(--clay)', w: 12, mode: 'draw', s: 5 }, { d: 'M-20 60c40 30 80 30 120 0s80-30 120 0 80 30 120 0', c: 'var(--lime)', w: 22, mode: 'breathe', s: 7 }] },
  h8: { box: '0 0 300 200', lines: [{ d: 'M30 210C30 120 90 60 150 60s120 60 120 150', c: 'var(--sky)', w: 26, mode: 'sway', s: 9 }, { d: 'M70 210c0-60 40-100 80-100s80 40 80 100', c: 'var(--lime)', w: 10, mode: 'pulse', s: 12 }] },
};

export default function Ribbons({ set, className = '', paused = false }: { set: keyof typeof RIBBON_SETS | string; className?: string; paused?: boolean }) {
  const r = RIBBON_SETS[set];
  if (!r) return null;
  return (
    <svg className={`v2-ribbons${paused ? ' is-paused' : ''} ${className}`} viewBox={r.box} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {r.lines.map((l, i) => (
        <path key={i} d={l.d} pathLength={1} className={`rb-${l.mode}`} stroke={l.c} strokeWidth={l.w}
          style={{ '--s': `${l.s}s`, '--dir': l.rev ? 'reverse' : 'normal', '--dash': l.dash ?? .6, '--gapr': 1 - (l.dash ?? .6), '--w1': l.w, '--w2': l.w * 0.55, opacity: l.op } as React.CSSProperties} />
      ))}
    </svg>
  );
}
