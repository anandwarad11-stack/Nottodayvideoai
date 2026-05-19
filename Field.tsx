import { ReactNode } from 'react';

export default function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <div className="text-sm font-semibold">{label}</div>
        {hint ? <div className="text-xs text-[var(--muted)]">{hint}</div> : null}
      </div>
      {children}
    </div>
  );
}
