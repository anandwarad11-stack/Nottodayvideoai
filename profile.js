import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id is required' });

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'PUT') {
      const {
        id,
        display_name,
        accent,
        theme_mode,
        default_aspect_ratio,
        default_duration_seconds,
        default_fps,
        default_quality,
        default_upscale_4k,
        reduce_motion,
        auto_play_previews,
      } = req.body || {};

      if (!id) return res.status(400).json({ error: 'id is required' });

      const patch = {
        display_name: display_name ?? null,
        accent: accent ?? 'violet',
        theme_mode: theme_mode ?? 'system',
        default_aspect_ratio: default_aspect_ratio ?? '9:16',
        default_duration_seconds: default_duration_seconds ?? 6,
        default_fps: default_fps ?? 24,
        default_quality: default_quality ?? 'pro',
        default_upscale_4k: !!default_upscale_4k,
        reduce_motion: !!reduce_motion,
        auto_play_previews: auto_play_previews ?? true,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id, ...patch })
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
