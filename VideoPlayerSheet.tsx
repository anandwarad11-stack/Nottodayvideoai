import { useEffect, useMemo, useState } from 'react';
import { X, Download, Share2, Sparkles, Copy, Film, BadgeCheck } from 'lucide-react';
import GlassCard from './GlassCard';
import PrimaryButton from './PrimaryButton';
import SegmentedControl from './SegmentedControl';
import { VideoGeneration, exportVideo, tickVideo } from '../lib/api';
import { cn } from '../lib/utils';

function exportFilename(v: VideoGeneration) {
  const base = v.prompt
    .slice(0, 36)
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .toLowerCase();
  return `${base || 'motion'}-${v.id}`;
}

export default function VideoPlayerSheet({
  open,
  video,
  onClose,
  onRefresh,
}: {
  open: boolean;
  video: VideoGeneration | null;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [format, setFormat] = useState<'mp4' | 'mov' | 'gif'>('mp4');
  const [busy, setBusy] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setPulse(true), 180);
    return () => window.clearTimeout(t);
  }, [open]);

  const canExport = video?.status === 'completed' && !!video.output_url;
  const title = useMemo(() => (video ? `Generation #${video.id}` : 'Generation'), [video]);

  async function handleExport() {
    if (!video) return;
    setBusy(true);
    try {
      await exportVideo(video.id, format);
      onRefresh();
    } catch (e) {
      console.error(e);
      alert((e as any)?.message || 'Export failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleForceTick() {
    if (!video) return;
    setBusy(true);
    try {
      await tickVideo(video.id);
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  async function handleCopyPrompt() {
    if (!video) return;
    try {
      await navigator.clipboard.writeText(video.prompt);
    } catch {
      // ignore
    }
  }

  if (!open || !video) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={cn('absolute inset-x-0 bottom-0 pb-[max(env(safe-area-inset-bottom),10px)]', pulse ? '' : 'opacity-0')}>
        <div className="mx-auto w-full max-w-[420px] px-3">
          <div className="rounded-[34px] border border-white/10 bg-black/55 backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.70)]">
            <div className="flex items-center justify-between gap-3 px-5 pt-5">
              <div>
                <div className="text-xs text-[var(--muted)]">{title}</div>
                <div className="mt-1 text-base font-semibold">Preview & Export</div>
              </div>
              <button
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-white/5 p-2 text-[var(--muted)] backdrop-blur-xl transition-transform active:scale-[0.98]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 pb-5 pt-4">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/50">
                {video.output_url ? (
                  <video
                    className="h-56 w-full object-cover"
                    controls
                    playsInline
                    preload="metadata"
                    poster={video.poster_url || undefined}
                    src={video.output_url}
                  />
                ) : (
                  <div className="flex h-56 w-full items-center justify-center text-sm text-[var(--muted)]">
                    Preview will appear when ready
                  </div>
                )}
              </div>

              <GlassCard className="mt-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                      <Sparkles className="h-4 w-4" />
                      <span>
                        {video.style_preset} • {video.quality.toUpperCase()}{video.upscale_4k ? ' • 4K' : ''}
                      </span>
                    </div>
                    <div className="mt-2 line-clamp-3 text-sm font-semibold leading-snug">{video.prompt}</div>
                    {video.negative_prompt ? (
                      <div className="mt-2 text-xs text-[var(--muted)]">Neg: {video.negative_prompt}</div>
                    ) : null}
                  </div>
                  <button
                    onClick={handleCopyPrompt}
                    className="rounded-2xl border border-white/10 bg-white/5 p-2 text-[var(--muted)] backdrop-blur-xl transition-transform active:scale-[0.98]"
                    aria-label="Copy prompt"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-[11px] text-[var(--muted)]">Aspect</div>
                    <div className="mt-1 text-sm font-semibold">{video.aspect_ratio}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-[11px] text-[var(--muted)]">Duration</div>
                    <div className="mt-1 text-sm font-semibold">{video.duration_seconds}s</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-[11px] text-[var(--muted)]">FPS</div>
                    <div className="mt-1 text-sm font-semibold">{video.fps}</div>
                  </div>
                </div>
              </GlassCard>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Export</div>
                  {video.status === 'completed' ? (
                    <div className="flex items-center gap-1 text-xs text-emerald-200">
                      <BadgeCheck className="h-4 w-4" /> Ready
                    </div>
                  ) : (
                    <div className="text-xs text-[var(--muted)]">In progress</div>
                  )}
                </div>

                <div className="mt-2">
                  <SegmentedControl
                    value={format}
                    onChange={(v) => setFormat(v as any)}
                    options={[
                      { value: 'mp4', label: 'MP4' },
                      { value: 'mov', label: 'MOV' },
                      { value: 'gif', label: 'GIF' },
                    ]}
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <PrimaryButton disabled={!canExport || busy} onClick={handleExport}>
                    <span className="inline-flex items-center justify-center gap-2">
                      <Download className="h-4 w-4" /> Export
                    </span>
                  </PrimaryButton>
                  <button
                    disabled={!canExport}
                    onClick={() => {
                      if (!video.output_url) return;
                      if (navigator.share) {
                        navigator.share({ title: '4K Video', url: video.output_url }).catch(() => {});
                      } else {
                        window.open(video.output_url, '_blank');
                      }
                    }}
                    className={cn(
                      'rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[var(--text)] backdrop-blur-xl',
                      'transition-transform active:scale-[0.99]',
                      'disabled:opacity-50 disabled:active:scale-100'
                    )}
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <Share2 className="h-4 w-4" /> Share
                    </span>
                  </button>
                </div>

                {video.export_state === 'ready' ? (
                  <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-[var(--muted)]">
                    Export prepared as <span className="text-[var(--text)] font-semibold">{video.export_format}</span>.
                    <div className="mt-1">Filename: {exportFilename(video)}.{video.export_format}</div>
                  </div>
                ) : null}

                <button
                  onClick={handleForceTick}
                  disabled={busy || video.status === 'completed'}
                  className={cn(
                    'mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[var(--muted)] backdrop-blur-xl',
                    'transition-transform active:scale-[0.99]',
                    'disabled:opacity-50 disabled:active:scale-100'
                  )}
                >
                  <Film className="h-4 w-4" /> Simulate progress
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
