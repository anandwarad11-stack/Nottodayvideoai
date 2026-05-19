import { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export default function PrimaryButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'relative w-full select-none rounded-2xl px-4 py-3 text-sm font-semibold',
        'text-white shadow-[0_18px_50px_rgba(0,0,0,0.50)]',
        'bg-[linear-gradient(135deg,var(--accent),rgba(255,255,255,0.12))]',
        'border border-white/10',
        'transition-transform duration-200 active:scale-[0.99]',
        'disabled:opacity-50 disabled:active:scale-100',
        className
      )}
      {...props}
    />
  );
}
