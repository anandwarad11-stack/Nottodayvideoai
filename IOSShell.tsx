import { ReactNode } from 'react';
import { cn } from '../lib/utils';

export default function IOSShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('min-h-dvh bg-[var(--bg)] text-[var(--text)]', className)}>
      <div className="mx-auto w-full max-w-[420px] px-4 pb-24 pt-4">
        {children}
      </div>
    </div>
  );
}
