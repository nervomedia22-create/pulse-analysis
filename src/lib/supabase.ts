import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EngagementEvent } from '../types/analytics';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate that credentials are real and not placeholder defaults
export const isSupabaseConfigured = (): boolean => {
  return (
    typeof rawUrl === 'string' &&
    rawUrl.trim().length > 0 &&
    !rawUrl.includes('your-project') &&
    rawUrl.startsWith('http') &&
    typeof rawAnonKey === 'string' &&
    rawAnonKey.trim().length > 0 &&
    !rawAnonKey.includes('your-anon-public-key')
  );
};

export const getSupabaseConfigStatus = () => {
  const configured = isSupabaseConfigured();
  return {
    isConfigured: configured,
    url: configured ? rawUrl : rawUrl || 'Not configured',
    hasAnonKey: Boolean(rawAnonKey && !rawAnonKey.includes('your-anon-public-key')),
    isTableReady: cachedTableReady,
  };
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(rawUrl, rawAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Track whether the 'analytics_events' table exists in the schema cache
let cachedTableReady = false;
let lastCheckTime = 0;

/**
 * Checks if the analytics_events table exists in Supabase schema without triggering a 404 error.
 * Uses the OpenAPI specification root (/rest/v1/) which always returns HTTP 200.
 */
export async function checkAnalyticsTableReady(force = false): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    cachedTableReady = false;
    return false;
  }

  const now = Date.now();
  // Return cached positive result or throttle checks to every 8s
  if (!force && cachedTableReady) return true;
  if (!force && now - lastCheckTime < 8000) return cachedTableReady;

  lastCheckTime = now;

  try {
    const res = await fetch(`${rawUrl}/rest/v1/`, {
      headers: {
        apikey: rawAnonKey,
        Authorization: `Bearer ${rawAnonKey}`,
      },
    });

    if (!res.ok) {
      cachedTableReady = false;
      return false;
    }

    const data = await res.json();
    const hasTable = Boolean(data && data.paths && data.paths['/analytics_events']);
    cachedTableReady = hasTable;
    return hasTable;
  } catch {
    cachedTableReady = false;
    return false;
  }
}

/**
 * Tests live connectivity to Supabase and diagnoses table schema readiness.
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; tableReady: boolean }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      tableReady: false,
      message: 'Supabase credentials are not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  try {
    const isReady = await checkAnalyticsTableReady(true);
    if (!isReady) {
      return {
        success: true,
        tableReady: false,
        message: 'Connected to Supabase project successfully! The "analytics_events" table is not created yet. Copy and run the SQL schema script in your Supabase SQL Editor.',
      };
    }

    return {
      success: true,
      tableReady: true,
      message: 'Connected to Supabase! The "analytics_events" table is active and receiving live telemetry.',
    };
  } catch (err: any) {
    return {
      success: false,
      tableReady: false,
      message: err?.message || 'Failed to connect to Supabase endpoint.',
    };
  }
}

/**
 * Persists an event to Supabase analytics_events table safely.
 * Only attempts the insert if the table has been verified to prevent 404 console errors.
 */
export async function persistEventToSupabase(event: EngagementEvent): Promise<boolean> {
  if (!supabase || !cachedTableReady) return false;

  try {
    const { error } = await supabase.from('analytics_events').insert([
      {
        id: event.id,
        timestamp: event.timestamp,
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
        metadata: event.metadata,
      },
    ]);

    if (error) {
      // If table was dropped or became unavailable, reset cache
      if (error.code === 'PGRST205' || error.code === '42P01') {
        cachedTableReady = false;
      }
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetches historical events from Supabase analytics_events table safely.
 */
export async function fetchEventsFromSupabase(limit = 60): Promise<EngagementEvent[]> {
  if (!supabase || !cachedTableReady) return [];

  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error || !data) {
      if (error?.code === 'PGRST205' || error?.code === '42P01') {
        cachedTableReady = false;
      }
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      timestamp: Number(row.timestamp),
      type: row.type,
      path: row.path,
      userId: row.user_id,
      userName: row.user_name,
      userTier: row.user_tier,
      country: row.country,
      countryCode: row.country_code,
      city: row.city,
      device: row.device,
      browser: row.browser,
      dwellTimeSeconds: row.dwell_time_seconds,
      scrollDepthPct: row.scroll_depth_pct,
      metadata: row.metadata || {},
    }));
  } catch {
    return [];
  }
}
