'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Fresh numbers every minute while the tab is open and visible. */
export default function AutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => { if (document.visibilityState === 'visible') router.refresh(); }, 60_000);
    return () => clearInterval(id);
  }, [router]);
  return null;
}
