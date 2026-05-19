import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { status, limit } = req.query;
      const lim = Math.min(parseInt(limit || '50', 10) || 50, 200);

      let q = supabase
        .from('video_generations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(lim);

      if (status) q = q.eq('status', status);

      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const {
        prompt,
        style_preset,
        aspect_ratio,
        duration_seconds,
        fps,
        seed,
        quality,
        upscale_4k,
        negative_prompt,
      } = req.body || {};

      if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 4) {
        return res.status(400).json({ error: 'Prompt is required (min 4 chars).' });
      }

      const now = new Date();
      const createdAt = now.toISOString();

      // In a real app this would enqueue a job with a provider (Runway/Pika/Gen-3/etc.).
      // Here we simulate a realistic lifecycle with timestamps and progress.
      const fakeEtaSeconds = Math.max(12, Math.min(45, Math.round((duration_seconds || 6) * 3 + 12)));

      const payload = {
        prompt: prompt.trim(),
        negative_prompt: (negative_prompt || '').trim() || null,
        style_preset: style_preset || 'Cinematic',
        aspect_ratio: aspect_ratio || '9:16',
        duration_seconds: duration_seconds ?? 6,
        fps: fps ?? 24,
        seed: seed ?? null,
        quality: quality || 'pro',
        upscale_4k: !!upscale_4k,
        status: 'queued',
        progress: 0,
        provider: 'DesignArena Sim',
        created_at: createdAt,
        started_at: null,
        completed_at: null,
        eta_seconds: fakeEtaSeconds,
        output_url: null,
        poster_url: null,
        error_message: null,
        export_state: 'idle',
      };

      const { data, error } = await supabase
        .from('video_generations')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, action } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });

      const { data: current, error: fetchError } = await supabase
        .from('video_generations')
        .select('*')
        .eq('id', id)
        .single();
      if (fetchError) throw fetchError;

      const now = new Date();
      const status = current.status;

      if (action === 'tick') {
        // Progress simulation
        let next = { ...current };

        if (status === 'queued') {
          next.status = 'generating';
          next.started_at = next.started_at || now.toISOString();
          next.progress = Math.max(next.progress || 0, 5);
        } else if (status === 'generating') {
          const inc = 8 + Math.round(Math.random() * 10);
          next.progress = Math.min(98, (next.progress || 0) + inc);

          // Occasionally go into "upscaling" if 4K requested
          if (next.upscale_4k && next.progress >= 70 && next.progress < 85) {
            next.status = 'upscaling';
          }
        } else if (status === 'upscaling') {
          const inc = 6 + Math.round(Math.random() * 8);
          next.progress = Math.min(99, (next.progress || 0) + inc);
          if (next.progress >= 92) {
            next.status = 'finalizing';
          }
        } else if (status === 'finalizing') {
          next.progress = 100;
          next.status = 'completed';
          next.completed_at = now.toISOString();
          // Use stable sample video URLs (public domain sample); proxy not required.
          next.output_url = next.output_url || 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
          next.poster_url = next.poster_url || 'https://images.unsplash.com/photo-1520975958225-36b2d0d69e52?auto=format&fit=crop&w=1200&q=80';
        }

        // ETA
        const eta = Math.max(0, (next.eta_seconds ?? 20) - 3);
        next.eta_seconds = eta;

        const { data, error } = await supabase
          .from('video_generations')
          .update({
            status: next.status,
            progress: next.progress,
            started_at: next.started_at,
            completed_at: next.completed_at,
            output_url: next.output_url,
            poster_url: next.poster_url,
            eta_seconds: next.eta_seconds,
          })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return res.status(200).json(data);
      }

      if (action === 'cancel') {
        if (['completed', 'failed', 'canceled'].includes(status)) {
          return res.status(400).json({ error: 'Cannot cancel a finished job.' });
        }
        const { data, error } = await supabase
          .from('video_generations')
          .update({ status: 'canceled', error_message: null, completed_at: now.toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return res.status(200).json(data);
      }

      if (action === 'export') {
        if (status !== 'completed') return res.status(400).json({ error: 'Export is only available after completion.' });
        const { export_format } = req.body || {};
        const allowed = ['mp4', 'mov', 'gif'];
        const format = allowed.includes(export_format) ? export_format : 'mp4';

        const { data, error } = await supabase
          .from('video_generations')
          .update({ export_state: 'ready', export_format: format })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return res.status(200).json(data);
      }

      if (action === 'setFavorite') {
        const { is_favorite } = req.body || {};
        const { data, error } = await supabase
          .from('video_generations')
          .update({ is_favorite: !!is_favorite })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return res.status(200).json(data);
      }

      return res.status(400).json({ error: 'Unknown action.' });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });

      const { error } = await supabase.from('video_generations').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
