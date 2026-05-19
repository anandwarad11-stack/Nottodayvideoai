import { Heart, Trash2, Download, Square, Play } from 'lucide-react';
import GlassCard from './GlassCard';
import { VideoGeneration } from '../lib/api';
import { cn, formatRelativeTime, formatDuration } from '../lib/utils';

export default function VideoCard({
  v,
  onOpen,
  onFavorite,
  onDelete,
}: {
  v: VideoGeneration;
  onOpen: () => void;
  onFavorite: (fav: boolean) => void;
  onDelete: () => void;
}) {
  const badge = {
    queued: 'Queued',
    generating: 'Generating',
    upscaling: 'Upscaling',
    finalizing: 'Finalizing',
    completed: 'Ready',
    failed: 'Failed',
    canceled: 'Canceled',
  }[v.status];

  const badgeClass = {
    queued: 'bg-white/10 text-[var(--text)]',
    generating: 'bg-[var(--accent)]/20 text-[var(--text)]',
    upscaling: 'bg-[var(--accent)]/20 text-[var(--text)]',
    finalizing: 'bg-white/10 text-[var(--text)]',
    completed: 'bg-emerald-400/15 text-emerald-200',
    failed: 'bg-red-400/15 text-red-200',
    canceled: 'bg-white/10 text-[var(--muted)]',
  }[v.status];

  const ratioLabel = v.aspect_ratio.replace(':', '∶');

  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <button onClick={onOpen} className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <div className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold', badgeClass)}>{badge}</div>
            <div className="text-[11px] text-[var(--muted)]">
              {ratioLabel} • {formatDuration(v.duration_seconds)} • {v.fps}fps
            </div>
          </div>
          <div className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">{v.prompt}</div>
          <div className="mt-2 text-xs text-[var(--muted)]">{formatRelativeTime(v.created_at)}</div>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onFavorite(!v.is_favorite)}
            className={cn(
              'rounded-2xl border border-white/10 bg-white/5 p-2 text-[var(--muted)] backdrop-blur-xl',
              'transition-transform active:scale-[0.98]'
            )}
            aria-label="Favorite"
          >
            <Heart className={cn('h-4 w-4', v.is_favorite ? 'fill-[var(--accent)] text-[var(--accent)]' : '')} />
          </button>
          <button
            onClick={onDelete}
            className={cn(
              'rounded-2xl border border-white/10 bg-white/5 p-2 text-[var(--muted)] backdrop-blur-xl',
              'transition-transform active:scale-[0.98]'
            )}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          {v.poster_url ? (
            <img src={v.poster_url} alt="poster" className="h-44 w-full object-cover opacity-80" />
          ) : (
            <div className="h-44 w-full" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.72),rgba(0,0,0,0.15),rgba(0,0,0,0.65))]" />

          <div className="absolute left-3 top-3 rounded-2xl bg-black/40 px-2.5 py-1 text-[11px] text-white/80 backdrop-blur-xl">
            {v.style_preset} • {v.quality.toUpperCase()}{v.upscale_4k ? ' • 4K' : ''}
          </div>

          {v.status === 'completed' ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-2xl">
                <Play className="h-4 w-4" /> Preview
              </div>
            </div>
          ) : (
            <div className="absolute inset-x-3 bottom-3">
              <div className="flex items-center justify-between text-[11px] text-white/75">
                <div className="flex items-center gap-2">
                  <Square className="h-3.5 w-3.5 opacity-80" />
                  <span>
                    {v.status === 'queued'
                      ? 'Warming up…'
                      : v.status === 'generating'
                      ? 'Synthesizing motion…'
                      : v.status === 'upscaling'
                      ? 'Upscaling to 4K…'
                      : v.status === 'finalizing'
                      ? 'Finalizing…'
                      : ''}
                  </span>
                </div>
                <div>{v.progress}%</div>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),rgba(255,255,255,0.25))]"
                  style={{ width: `${Math.min(100, Math.max(0, v.progress || 0))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {v.status === 'completed' ? (
          <div className="mt-3 flex gap-2">
            <button
              onClick={onOpen}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[var(--text)] backdrop-blur-xl transition-transform active:scale-[0.99]"
            >
              Open
            </button>
            <button
              onClick={onOpen}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[var(--text)] backdrop-blur-xl transition-transform active:scale-[0.99]"
              aria-label="Export"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </GlassCard>
  );
}
