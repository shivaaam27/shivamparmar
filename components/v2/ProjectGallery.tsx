'use client';

import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { track } from '@/lib/track';
import V2Compare from './Compare';
import Viewer, { type ViewShot } from './Viewer';
import { Masonry, ShotTile } from './Shots';

export type GalleryShot = ViewShot & { w: number; h: number; caption?: string };

/**
 * A project's pictures as one balanced masonry grid (the same as the work page), so tall and wide pictures sit
 * side by side instead of one under another. A day / night recording leads across the full width.
 * Any picture opens the full-screen viewer.
 */
export default function ProjectGallery({ shots }: { shots: GalleryShot[] }) {
  const [viewing, setViewing] = useState<number | null>(null);
  const close = useCallback(() => setViewing(null), []);
  const feature = shots.find((s) => s.compare && s.video);
  const grid = shots.filter((s) => s !== feature);

  return (
    <>
      {feature && (
        <div className="v2-gallery__feature">
          <V2Compare a={feature.video!} b={feature.compare!.video} posterA={feature.src} posterB={feature.compare!.poster}
            labelA={feature.compare!.label} labelB={feature.compare!.otherLabel} alt={feature.alt} />
        </div>
      )}
      {grid.length > 0 && (
        <Masonry items={grid} render={(s, k) => (
          <ShotTile shot={s} label={s.caption} eager={k < 6}
            onOpen={() => { setViewing(shots.indexOf(s)); track(`View ${s.video ? 'video' : 'photo'} · ${s.project}`); }} />
        )} />
      )}
      {viewing !== null && createPortal(<Viewer shots={shots} start={viewing} onClose={close} />, document.querySelector('.v2') ?? document.body)}
    </>
  );
}
