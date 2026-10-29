-- ==============================================================================
-- PulseTrack Real-Time Analytics - Supabase PostgreSQL Schema
-- Run this in your Supabase Dashboard: SQL Editor > New Query > Run
-- ==============================================================================

-- 1. Analytics Events Table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id TEXT PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  type TEXT NOT NULL,
  path TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_tier TEXT NOT NULL DEFAULT 'guest',
  country TEXT,
  country_code TEXT,
  city TEXT,
  device TEXT NOT NULL DEFAULT 'desktop',
  browser TEXT,
  dwell_time_seconds INTEGER DEFAULT 0,
  scroll_depth_pct INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning-fast real-time filtering and queries
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON public.analytics_events (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_path ON public.analytics_events (path);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.analytics_events (type);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.analytics_events (user_id);

-- 2. Active Sessions Table
CREATE TABLE IF NOT EXISTS public.active_sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free',
  city TEXT,
  country TEXT,
  country_code TEXT,
  current_path TEXT NOT NULL,
  started_at BIGINT NOT NULL,
  last_active_at BIGINT NOT NULL,
  device TEXT NOT NULL DEFAULT 'desktop',
  browser TEXT,
  total_events_count INTEGER DEFAULT 0,
  total_dwell_time_sec INTEGER DEFAULT 0,
  current_scroll_depth INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_last_active ON public.active_sessions (last_active_at DESC);

-- 3. Friction Alerts Table
CREATE TABLE IF NOT EXISTS public.friction_alerts (
  id TEXT PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL,
  metric_impact TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. Enable Row Level Security (RLS) & Policies
-- ==============================================================================
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friction_alerts ENABLE ROW LEVEL SECURITY;

-- Allow public read & insert for analytics telemetry (or authenticated users)
CREATE POLICY "Allow public insert on analytics_events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read on analytics_events"
  ON public.analytics_events FOR SELECT
  USING (true);

CREATE POLICY "Allow public access on active_sessions"
  ON public.active_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access on friction_alerts"
  ON public.friction_alerts FOR ALL
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 5. Enable Supabase Realtime for live websocket broadcasting
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friction_alerts;
