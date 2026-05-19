import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Heart } from 'lucide-react';
import IOSShell from '../components/IOSShell';
import VideoCard from '../components/VideoCard';
import VideoPlayerSheet from '../components/VideoPlayerSheet';
import { VideoGeneration, deleteVideo, listVideos, setFavorite } from '../lib/api';
import GlassCard from '../components/GlassCard';
import SegmentedControl from '../components/SegmentedControl';
import { cn } from '../lib/utils';

export default function LibraryPage() {
  const [items, setItems] = useState<VideoGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorites' | 'completed'>('all');

  const [sheetOpen, setSheetOpen] = useState(false);
  const [active, setActive] = useState<VideoGeneration | null>(null);

  const fetchItems = async () => {
    try {
      const data = await listVideos({ limit: 80 });
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((v) => {
        if (filter === 'favorites' && !v.is_favorite) return false;
        if (filter === 'completed' && v.status !== 'completed') return false;
        if (!q) return true;
        return v.prompt.toLowerCase().includes(q) || (v.style_preset || '').toLowerCase().includes(q);
      })
      .slice(0, 50);
  }, [items, query, filter]);

  return (
    <IOSShell>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-[var(--muted)]">Your library</div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">Generations</h1>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-2 text-[var(--muted)] backdrop-blur-xl">
          <Filter className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-3 py-2.5">
            <Search className="h-4 w-4 text-[var(--muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search prompts, presets…"
              className="w-full bg-transparent text-sm text-[var(--text)] placeholder:text-white/30 outline-none"
            />
          </div>
          <div className="mt-3">
            <SegmentedControl
              value={filter}
              onChange={(v) => setFilter(v as any)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'completed', label: 'Ready' },
                { value: 'favorites', label: 'Saved' },
              ]}
            />
          </div>
          {filter === 'favorites' ? (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-[var(--muted)]">
              <span className="inline-flex items-center gap-2">
                <Heart className="h-4 w-4 text-[var(--accent)]" /> Tap the heart on any generation to save it here.
              </span>
            </div>
          ) : null}
        </GlassCard>

        <div className="space-y-3">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--muted)]">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--muted)]">
              Nothing matches yet.
            </div>
          ) : (
            filtered.map((v) => (
              <VideoCard
                key={v.id}
                v={v}
                onOpen={() => {
                  setActive(v);
                  setSheetOpen(true);
                }}
                onFavorite={async (fav) => {
                  try {
                    await setFavorite(v.id, fav);
                    await fetchItems();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                onDelete={async () => {
                  if (!confirm('Delete this generation?')) return;
                  try {
                    await deleteVideo(v.id);
                    await fetchItems();
                  } catch (e) {
                    console.error(e);
                  }
                }}
              />
            ))
          )}
        </div>
      </div>

      <VideoPlayerSheet
        open={sheetOpen}
        video={active}
        onClose={() => setSheetOpen(false)}
        onRefresh={async () => {
          await fetchItems();
          if (active) {
            const updated = (await listVideos({ limit: 120 })).find((x) => x.id === active.id) || null;
            setActive(updated);
          }
        }}
      />
    </IOSShell>
  );
}
