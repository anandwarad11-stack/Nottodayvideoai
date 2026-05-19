import { useEffect, useState } from 'react';
import { Palette, SunMoon, Gauge, Wand2 } from 'lucide-react';
import IOSShell from '../components/IOSShell';
import GlassCard from '../components/GlassCard';
import SegmentedControl from '../components/SegmentedControl';
import Toggle from '../components/Toggle';
import Field from '../components/Field';
import { Profile, getProfile, upsertProfile } from '../lib/api';
import { applyTheme } from '../lib/theme';

const DEMO_ID = '00000000-0000-0000-0000-000000000000';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const p = await getProfile(DEMO_ID);
      setProfile(p);
      applyTheme({ mode: p.theme_mode, accent: p.accent });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  async function save(patch: Partial<Profile>) {
    if (!profile) return;
    try {
      const next = await upsertProfile({ id: profile.id, ...patch });
      setProfile(next);
      applyTheme({ mode: next.theme_mode, accent: next.accent });
    } catch (e) {
      console.error(e);
      alert((e as any)?.message || 'Failed to save');
    }
  }

  return (
    <IOSShell>
      <div>
        <div className="text-xs text-[var(--muted)]">Preferences</div>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">Settings</h1>
      </div>

      <div className="mt-4 space-y-3">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-sm font-semibold">
              <Palette className="h-4 w-4 text-[var(--accent)]" /> Accent
            </div>
            <div className="text-xs text-[var(--muted)]">Monochrome + electric</div>
          </div>
          <div className="mt-3">
            <SegmentedControl
              value={profile?.accent || 'violet'}
              onChange={(v) => save({ accent: v as any })}
              options={[
                { value: 'violet', label: 'Violet' },
                { value: 'blue', label: 'Blue' },
              ]}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-sm font-semibold">
              <SunMoon className="h-4 w-4 text-[var(--accent)]" /> Theme
            </div>
            <div className="text-xs text-[var(--muted)]">Dark-first</div>
          </div>
          <div className="mt-3">
            <SegmentedControl
              value={profile?.theme_mode || 'system'}
              onChange={(v) => save({ theme_mode: v as any })}
              options={[
                { value: 'system', label: 'Auto' },
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' },
              ]}
            />
          </div>
        </GlassCard>

        <Toggle
          checked={!!profile?.reduce_motion}
          onChange={(v) => save({ reduce_motion: v })}
          label="Reduce motion"
          description="Softens micro-interactions"
        />

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-sm font-semibold">
              <Wand2 className="h-4 w-4 text-[var(--accent)]" /> Defaults
            </div>
            <div className="text-xs text-[var(--muted)]">Applies on Create</div>
          </div>
          <div className="mt-3 space-y-3">
            <Field label="Aspect ratio" hint={loading ? 'Loading…' : ''}>
              <SegmentedControl
                value={profile?.default_aspect_ratio || '9:16'}
                onChange={(v) => save({ default_aspect_ratio: v as any })}
                options={[
                  { value: '9:16', label: 'Vertical' },
                  { value: '16:9', label: 'Wide' },
                  { value: '1:1', label: 'Square' },
                ]}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Duration" hint={`${profile?.default_duration_seconds ?? 6}s`}>
                <input
                  type="range"
                  min={2}
                  max={12}
                  value={profile?.default_duration_seconds ?? 6}
                  onChange={(e) => save({ default_duration_seconds: parseInt(e.target.value, 10) })}
                  className="w-full accent-[var(--accent)]"
                />
              </Field>
              <Field label="FPS" hint={`${profile?.default_fps ?? 24}fps`}>
                <input
                  type="range"
                  min={12}
                  max={60}
                  value={profile?.default_fps ?? 24}
                  onChange={(e) => save({ default_fps: parseInt(e.target.value, 10) })}
                  className="w-full accent-[var(--accent)]"
                />
              </Field>
            </div>

            <Field label="Quality" hint="">
              <SegmentedControl
                value={profile?.default_quality || 'pro'}
                onChange={(v) => save({ default_quality: v as any })}
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'pro', label: 'Pro' },
                  { value: 'cinema', label: 'Cinema' },
                ]}
              />
            </Field>

            <Toggle
              checked={!!profile?.default_upscale_4k}
              onChange={(v) => save({ default_upscale_4k: v })}
              label="Default 4K upscale"
              description="Adds an upscaling stage"
            />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-sm font-semibold">
              <Gauge className="h-4 w-4 text-[var(--accent)]" /> Performance
            </div>
            <div className="text-xs text-[var(--muted)]">Mobile-first</div>
          </div>
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-[var(--muted)]">
            UI is optimized for iPhone viewport, reduced layout shift, and tap-friendly controls.
          </div>
        </GlassCard>
      </div>
    </IOSShell>
  );
}
