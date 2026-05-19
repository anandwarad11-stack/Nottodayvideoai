import { cn } from '../lib/utils';

export default function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left',
        'backdrop-blur-xl transition-transform active:scale-[0.99]'
      )}
    >
      <div>
        <div className="text-sm font-semibold">{label}</div>
        {description ? <div className="mt-1 text-xs text-[var(--muted)]">{description}</div> : null}
      </div>
      <div
        className={cn(
          'h-7 w-12 rounded-full border border-white/10 p-0.5',
          checked ? 'bg-[var(--accent)]/35' : 'bg-black/30'
        )}
      >
        <div
          className={cn(
            'h-6 w-6 rounded-full bg-white shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </div>
    </button>
  );
}
