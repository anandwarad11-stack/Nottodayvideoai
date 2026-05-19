import { useEffect, useMemo, useState } from 'react';
import { KeyRound, Shield, Sparkles, LogOut, User2 } from 'lucide-react';
import IOSShell from '../components/IOSShell';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import Toggle from '../components/Toggle';
import { Profile, getProfile, upsertProfile } from '../lib/api';

const DEMO_ID = '00000000-0000-0000-0000-000000000000';

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const p = await getProfile(DEMO_ID);
      setProfile(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const displayName = useMemo(() => profile?.display_name || 'Demo Creator', [profile]);

  async function save(patch: Partial<Profile>) {
    if (!profile) return;
    setSaving(true);
    try {
      const next = await upsertProfile({ id: profile.id, ...patch });
      setProfile(next);
    } catch (e) {
      console.error(e);
      alert((e as any)?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <IOSShell>
      <div>
        <div className="text-xs text-[var(--muted)]">Account</div>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">Profile</h1>
      </div>

      <div className="mt-4 space-y-3">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <User2 className="h-6 w-6 text-[var(--accent)]" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">{loading ? 'Loading…' : displayName}</div>
              <div className="mt-1 text-xs text-[var(--muted)]">Plan: Pro • 4K enabled</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-[11px] text-[var(--muted)]">API</div>
              <div className="mt-1 text-sm font-semibold">Low-latency</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-[11px] text-[var(--muted)]">Safety</div>
              <div className="mt-1 text-sm font-semibold">On-device UI</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Security</div>
            <div className="text-xs text-[var(--muted)]">Frictionless</div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <KeyRound className="h-5 w-5 text-[var(--accent)]" />
              <div>
                <div className="text-sm font-semibold">Passkeys</div>
                <div className="mt-1 text-xs text-[var(--muted)]">Coming soon for iOS-first sign-in</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <Shield className="h-5 w-5 text-[var(--accent)]" />
              <div>
                <div className="text-sm font-semibold">Content filters</div>
                <div className="mt-1 text-xs text-[var(--muted)]">Always-on safety pipeline</div>
              </div>
            </div>
          </div>
        </GlassCard>

        <Toggle
          checked={!!profile?.auto_play_previews}
          onChange={(v) => save({ auto_play_previews: v })}
          label="Auto-play previews"
          description="Plays inline video when available"
        />

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Session</div>
            <div className="text-xs text-[var(--muted)]">Demo</div>
          </div>
          <div className="mt-3">
            <PrimaryButton
              disabled={saving}
              onClick={() => alert('This demo app uses a lightweight profile record. Add Supabase Auth for real accounts.')}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" /> Upgrade to full auth
              </span>
            </PrimaryButton>
            <button
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[var(--muted)] backdrop-blur-xl transition-transform active:scale-[0.99]"
              onClick={() => alert('Demo mode: no sign-out required.')}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </GlassCard>
      </div>
    </IOSShell>
  );
}
