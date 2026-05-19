import { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, SlidersHorizontal, Zap, CornerDownLeft, RefreshCw, StopCircle } from 'lucide-react';
import IOSShell from '../components/IOSShell';
import GlassCard from '../components/GlassCard';
import Field from '../components/Field';
import PrimaryButton from '../components/PrimaryButton';
import SegmentedControl from '../components/SegmentedControl';
import Toggle from '../components/Toggle';
import VideoPlayerSheet from '../components/VideoPlayerSheet';
import {
  VideoGeneration,
  createVideo,
  listVideos,
  tickVideo,
  cancelVideo,
  setFavorite,
  deleteVideo,
} from '../lib/api';
import { clamp, cn } from '../lib/utils';

const presets = ['Cinematic', 'Product', 'Anime', 'Noir', 'Dreamlike', 'Neon'];

export default function CreatePage() {
  const [prompt, setPrompt] = useState('A violet-electric skyline of glass towers, rain-slick streets, slow cinematic push-in, volumetric fog');
  const [negative, setNegative] = useState('low quality, jitter, text, watermark, distorted faces');
  const [preset, setPreset] = useState('Cinematic');
  const [ratio, setRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [duration, setDuration] = useState(6);
  const [fps, setFps] = useState(24);
  const [quality, setQuality] = useState<'draft' | 'pro' | 'cinema'>('pro');
  const [upscale4k, setUpscale4k] = useState(true);
  const [seedLocked, setSeedLocked] = useState(false);
  const [seed, setSeed] = useState<number>(472911);

  const [jobs, setJobs] = useState<VideoGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [active, setActive] = useState<VideoGeneration | null>(null);

  const pollRef = useRef<number | null>(null);

  const activeJob = useMemo(() => jobs.find((j) => !['completed', 'failed', 'canceled'].includes(j.status)) || null, [jobs]);

  const fetchJobs = async () => {
    try {
      const data = await listVideos({ limit: 12 });
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    // poll if there is an active job
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (!activeJob) return;

    pollRef.current = window.setInterval(async () => {
      try {
        await tickVideo(activeJob.id);
        await fetchJobs();
      } catch (e) {
        console.error(e);
      }
    }, 1600);

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [activeJob?.id]);

  async function handleGenerate() {
    setBusy(true);
    try {
      const s = seedLocked ? seed : Math.floor(Math.random() * 900000) + 100000;
      setSeed(s);
      const created = await createVideo({
        prompt,
        negative_prompt: negative,
        style_preset: preset,
        aspect_ratio: ratio,
        duration_seconds: clamp(duration, 2, 12),
        fps: clamp(fps, 12, 60),
        seed: s,
        quality,
        upscale_4k: upscale4k,
      });
      await fetchJobs();
      setActive(created);
      setSheetOpen(true);
    } catch (e) {
      console.error(e);
      alert((e as any)?.message || 'Failed to start generation');
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    if (!activeJob) return;
    setBusy(true);
    try {
      await cancelVideo(activeJob.id);
      await fetchJobs();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  const latestCompleted = useMemo(
    () => jobs.find((j) => j.status === 'completed') || null,
    [jobs]
  );

  return (
    <IOSShell>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-[var(--muted)]">4K Text-to-Video</div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">Motion Studio</h1>
        </div>
        <button
          onClick={fetchJobs}
          className="rounded-2xl border border-white/10 bg-white/5 p-2 text-[var(--muted)] backdrop-blur-xl transition-transform active:scale-[0.98]"
          aria-label="Refresh"
        >
          <RefreshCw className={cn('h-5 w-5', loading ? 'animate-spin' : '')} />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-[var(--accent)]" /> Prompt
            </div>
            <div className="text-xs text-[var(--muted)]">Optimized for iPhone</div>
          </div>

          <div className="mt-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className={cn(
                'w-full resize-none rounded-2xl border border-white/10 bg-black/35 p-3 text-sm leading-relaxed',
                'text-[var(--text)] placeholder:text-white/30 outline-none',
                'focus:ring-2 focus:ring-[var(--accent)]/35'
              )}
              placeholder="Describe your shot…"
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => setPrompt((p) => `${p}\n\nCamera: slow dolly-in, shallow depth of field, realistic motion blur.`)}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-[var(--text)] backdrop-blur-xl transition-transform active:scale-[0.99]"
            >
              + Camera cues
            </button>
            <button
              onClick={() => setPrompt((p) => `${p}\n\nLighting: soft studio key, rim light, subtle bloom, filmic contrast.`)}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-[var(--text)] backdrop-blur-xl transition-transform active:scale-[0.99]"
            >
              + Lighting
            </button>
          </div>

          <div className="mt-3">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-[var(--text)] backdrop-blur-xl">
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-[var(--accent)]" /> Advanced
                </span>
                <CornerDownLeft className="h-4 w-4 text-[var(--muted)] transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-3 space-y-3">
                <Field label="Negative prompt" hint="Optional">
                  <textarea
                    value={negative}
                    onChange={(e) => setNegative(e.target.value)}
                    rows={2}
                    className={cn(
                      'w-full resize-none rounded-2xl border border-white/10 bg-black/35 p-3 text-sm leading-relaxed',
                      'text-[var(--text)] placeholder:text-white/30 outline-none',
                      'focus:ring-2 focus:ring-[var(--accent)]/35'
                    )}
                    placeholder="What to avoid…"
                  />
                </Field>

                <Field label="Style preset" hint="Tastefully constrained">
                  <div className="grid grid-cols-3 gap-2">
                    {presets.map((p) => {
                      const active = p === preset;
                      return (
                        <button
                          key={p}
                          onClick={() => setPreset(p)}
                          className={cn(
                            'rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold backdrop-blur-xl',
                            'transition-transform active:scale-[0.99]',
                            active ? 'text-[var(--text)] ring-2 ring-[var(--accent)]/35' : 'text-[var(--muted)]'
                          )}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Aspect ratio" hint="iPhone-ready">
                  <SegmentedControl
                    value={ratio}
                    onChange={(v) => setRatio(v as any)}
                    options={[
                      { value: '9:16', label: 'Vertical' },
                      { value: '16:9', label: 'Wide' },
                      { value: '1:1', label: 'Square' },
                    ]}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Duration" hint={`${duration}s`}>
                    <input
                      type="range"
                      min={2}
                      max={12}
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                      className="w-full accent-[var(--accent)]"
                    />
                  </Field>
                  <Field label="FPS" hint={`${fps}fps`}>
                    <input
                      type="range"
                      min={12}
                      max={60}
                      step={1}
                      value={fps}
                      onChange={(e) => setFps(parseInt(e.target.value, 10))}
                      className="w-full accent-[var(--accent)]"
                    />
                  </Field>
                </div>

                <Field label="Quality" hint="Latency vs detail">
                  <SegmentedControl
                    value={quality}
                    onChange={(v) => setQuality(v as any)}
                    options={[
                      { value: 'draft', label: 'Draft' },
                      { value: 'pro', label: 'Pro' },
                      { value: 'cinema', label: 'Cinema' },
                    ]}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-2">
                  <Toggle
                    checked={upscale4k}
                    onChange={setUpscale4k}
                    label="4K Upscale"
                    description="Adds upscaling stage"
                  />
                  <Toggle
                    checked={seedLocked}
                    onChange={setSeedLocked}
                    label="Lock seed"
                    description={`Seed: ${seed}`}
                  />
                </div>
              </div>
            </details>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Generation</div>
            <div className="text-xs text-[var(--muted)]">Provider: DesignArena Sim</div>
          </div>

          {activeJob ? (
            <div className="mt-3 rounded-3xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{activeJob.status.toUpperCase()}</div>
                <div className="text-xs text-[var(--muted)]">ETA {Math.max(0, activeJob.eta_seconds ?? 0)}s</div>
              </div>
              <div className="mt-2 text-xs text-[var(--muted)] line-clamp-2">{activeJob.prompt}</div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),rgba(255,255,255,0.25))]"
                  style={{ width: `${activeJob.progress}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setActive(activeJob);
                    setSheetOpen(true);
                  }}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[var(--text)] backdrop-blur-xl transition-transform active:scale-[0.99]"
                >
                  Open
                </button>
                <button
                  disabled={busy}
                  onClick={handleCancel}
                  className={cn(
                    'rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[var(--text)] backdrop-blur-xl',
                    'transition-transform active:scale-[0.99] disabled:opacity-50'
                  )}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <StopCircle className="h-4 w-4" /> Cancel
                  </span>
                </button>
              </div>
            </div>
          ) : latestCompleted ? (
            <div className="mt-3 rounded-3xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Ready to export</div>
                <div className="text-xs text-[var(--muted)]">{latestCompleted.quality.toUpperCase()}</div>
              </div>
              <div className="mt-2 text-xs text-[var(--muted)] line-clamp-2">{latestCompleted.prompt}</div>
              <div className="mt-3">
                <PrimaryButton
                  onClick={() => {
                    setActive(latestCompleted);
                    setSheetOpen(true);
                  }}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Zap className="h-4 w-4" /> Open preview
                  </span>
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-3xl border border-white/10 bg-black/30 p-4 text-sm text-[var(--muted)]">
              Start a generation to see progress and export controls.
            </div>
          )}

          <div className="mt-4">
            <PrimaryButton disabled={busy || !!activeJob} onClick={handleGenerate}>
              <span className="inline-flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" /> Generate 4K Video
              </span>
            </PrimaryButton>
            {!!activeJob ? <div className="mt-2 text-xs text-[var(--muted)]">One active generation at a time.</div> : null}
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Recent</div>
            <div className="text-xs text-[var(--muted)]">Tap a card to open</div>
          </div>
          <div className="mt-3 space-y-3">
            {loading ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--muted)]">Loading…</div>
            ) : jobs.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--muted)]">No generations yet.</div>
            ) : (
              jobs.slice(0, 3).map((j) => (
                <button
                  key={j.id}
                  onClick={() => {
                    setActive(j);
                    setSheetOpen(true);
                  }}
                  className="w-full"
                >
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-xl transition-transform active:scale-[0.99]">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-[var(--muted)]">#{j.id} • {j.status}</div>
                      <div className="text-xs text-[var(--muted)]">{j.progress}%</div>
                    </div>
                    <div className="mt-2 text-sm font-semibold line-clamp-2">{j.prompt}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      <VideoPlayerSheet
        open={sheetOpen}
        video={active}
        onClose={() => setSheetOpen(false)}
        onRefresh={async () => {
          await fetchJobs();
          if (active) {
            const updated = (await listVideos({ limit: 50 })).find((x) => x.id === active.id) || null;
            setActive(updated);
          }
        }}
      />
    </IOSShell>
  );
}
