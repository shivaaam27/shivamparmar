'use client';

import { usePathname } from 'next/navigation';
import { isV2Path, otherVersion } from '@/lib/v2';
import './VersionSwitch.css';

/**
 * The V1 / V2 pill in the bottom-right corner of every page, while both versions are compared
 * (docs/V2-PLAN.md). It opens the same page in the other version. Delete it when V2 becomes the site.
 */
export default function VersionSwitch() {
  const pathname = usePathname() ?? '/';
  // the insights dashboard is a tool, not part of the site's look
  if (pathname.startsWith('/insights')) return null;
  const on2 = isV2Path(pathname);
  const go = (want2: boolean) => {
    if (want2 === on2) return;
    // a full load, so each version starts with its own look and intro
    window.location.href = otherVersion(window.location.pathname, window.location.search + window.location.hash);
  };
  return (
    <div className={`vswitch${on2 ? ' is-2' : ''}`} role="group" aria-label="Site version">
      <span className="vswitch__thumb" aria-hidden="true" />
      <button type="button" aria-pressed={!on2} onClick={() => go(false)}>V1</button>
      <button type="button" aria-pressed={on2} onClick={() => go(true)}>V2</button>
    </div>
  );
}
