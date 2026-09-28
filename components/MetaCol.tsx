import type { ReactNode } from 'react';

/** Label + list pair used in Work and Contact. */
export default function MetaCol({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="meta-col">
      <p className="meta-col__label">{label}</p>
      {children}
    </div>
  );
}
