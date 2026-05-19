import { cn } from '../lib/utils';

export default function SegmentedControl({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={cn(
                'rounded-xl px-3 py-2 text-xs font-medium transition-all',
                active
                  ? 'bg-white/10 text-[var(--text)] shadow-[0_10px_24px_rgba(0,0,0,0.28)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
