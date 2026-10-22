'use client';

import { useEffect, useState } from 'react';

/** The time where Shivam is, ticking each minute (blank until the browser draws it, so it never mismatches). */
export default function LocalTime({ timeZone = 'Africa/Dar_es_Salaam' }: { timeZone?: string }) {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone });
    const tick = () => setNow(fmt.format(Date.now()));
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, [timeZone]);
  return <time suppressHydrationWarning>{now ?? '--:--'}</time>;
}
