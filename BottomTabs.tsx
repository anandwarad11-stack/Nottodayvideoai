import { NavLink } from 'react-router-dom';
import { Wand2, Grid2X2, User2, Settings2 } from 'lucide-react';
import { cn } from '../lib/utils';

const tabs = [
  { to: '/', label: 'Create', icon: Wand2 },
  { to: '/library', label: 'Library', icon: Grid2X2 },
  { to: '/account', label: 'Account', icon: User2 },
  { to: '/settings', label: 'Settings', icon: Settings2 },
];

export default function BottomTabs() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pb-[max(env(safe-area-inset-bottom),12px)]">
      <div className="mx-auto w-full max-w-[420px] px-4">
        <div className="rounded-[26px] border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
          <div className="grid grid-cols-4 gap-1 p-2">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }: { isActive: boolean }) =>
                  cn(
                    'group flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-xs',
                    'transition-colors',
                    isActive
                      ? 'bg-white/8 text-[var(--text)]'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                  )
                }
              >
                <t.icon className="h-5 w-5" />
                <span className="leading-none">{t.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
