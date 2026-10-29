import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Server-side Supabase client using Service Role key if available
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

const isServerSupabaseConfigured = () => {
  return (
    supabaseUrl.length > 0 &&
    !supabaseUrl.includes('your-project') &&
    (supabaseServiceRole.length > 0 || supabaseAnon.length > 0)
  );
};

const serverSupabase = isServerSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseServiceRole || supabaseAnon, {
      auth: { persistSession: false },
    })
  : null;

// Endpoint: Check Supabase connection status from server cleanly without 404s
app.get('/api/supabase/status', async (req: Request, res: Response) => {
  const configured = isServerSupabaseConfigured();
  let dbReachable = false;
  let tableReady = false;
  let message = 'Supabase credentials not configured in environment or Secrets.';

  if (configured) {
    try {
      const authKey = supabaseServiceRole || supabaseAnon;
      const resp = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: { apikey: authKey, Authorization: `Bearer ${authKey}` },
      });
      if (resp.ok) {
        dbReachable = true;
        const data: any = await resp.json();
        tableReady = Boolean(data && data.paths && data.paths['/analytics_events']);
        message = tableReady
          ? 'Supabase database connected and analytics_events table ready.'
          : 'Connected to Supabase project! Table "analytics_events" needs to be created via supabase-schema.sql.';
      } else {
        message = `Supabase responded with HTTP ${resp.status}`;
      }
    } catch (err: any) {
      message = err?.message || 'Failed to ping Supabase.';
    }
  }

  res.json({
    configured,
    url: configured ? supabaseUrl : null,
    hasServiceRoleKey: Boolean(supabaseServiceRole && !supabaseServiceRole.includes('your-service-role')),
    hasAnonKey: Boolean(supabaseAnon && !supabaseAnon.includes('your-anon')),
    dbReachable,
    tableReady,
    message,
  });
});

// Endpoint: Ingest telemetry event to Supabase
app.post('/api/events', async (req: Request, res: Response) => {
  const event = req.body;
  if (!event || !event.id) {
    return res.status(400).json({ error: 'Missing event payload' });
  }

  if (serverSupabase) {
    try {
      const { error } = await serverSupabase.from('analytics_events').insert([
        {
          id: event.id,
          timestamp: event.timestamp || Date.now(),
          type: event.type,
          path: event.path,
          user_id: event.userId,
          user_name: event.userName,
          user_tier: event.userTier,
          country: event.country,
          country_code: event.countryCode,
          city: event.city,
          device: event.device,
          browser: event.browser,
          dwell_time_seconds: event.dwellTimeSeconds,
          scroll_depth_pct: event.scrollDepthPct,
          metadata: event.metadata || {},
        },
      ]);

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.json({ success: true, persisted: true });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Server insert error' });
    }
  }

  // If Supabase is not configured yet, return ok for local emulation
  res.json({ success: true, persisted: false, notice: 'Stored in local telemetry stream' });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PulseTrack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
