'use client';

import { useEffect, useState } from 'react';

/**
 * Umami skips any browser with localStorage "umami.disabled" set. Signing in
 * here turns that on, so your own visits stop counting on this device.
 */
export default function ExcludeMe() {
  const [off, setOff] = useState<boolean | null>(null);
  useEffect(() => {
    try { localStorage.setItem('umami.disabled', '1'); setOff(true); } catch { setOff(false); }
  }, []);
  if (off === null) return null;
  return (
    <p className="insights__exclude mono">
      {off ? 'Your visits on this device are not counted' : 'Couldn’t exclude this device (storage blocked)'}
    </p>
  );
}
