import { ReactNode } from 'react';
import { cn } from '../lib/utils';

export default function GlassCard({
  children,
  className,
  as,
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'button';
}) {
  const Comp: any = as || 'div';
  return (
    <Comp
      className={cn(
        'rounded-3xl border border-white/10 bg-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.38)] backdrop-blur-xl',
        'transition-transform duration-200 ease-out active:scale-[0.99]',
        className
      )}
    >
      {children}
    </Comp>
  );
}
