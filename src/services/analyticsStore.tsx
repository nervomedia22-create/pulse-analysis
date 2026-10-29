import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
  EngagementAlert,
  EngagementEvent,
  EventType,
  FunnelStage,
  RouteMetric,
  SimulationConfig,
  TimePoint,
  UserSession,
  UserTier,
} from '../types/analytics';
import { COUNTRIES, DEMO_USERS, INITIAL_FUNNEL, INITIAL_ROUTES } from './mockData';
import {
  supabase,
  isSupabaseConfigured,
  getSupabaseConfigStatus,
  checkAnalyticsTableReady,
  persistEventToSupabase,
  fetchEventsFromSupabase,
  testSupabaseConnection,
} from '../lib/supabase';

interface AnalyticsContextType {
  events: EngagementEvent[];
  activeSessions: UserSession[];
  timeSeries: TimePoint[];
  routes: RouteMetric[];
  funnel: FunnelStage[];
  alerts: EngagementAlert[];
  config: SimulationConfig;
  selectedSegment: 'all' | UserTier;
  selectedTimeframe: 'live' | '15m' | '1h';
  currentActiveCount: number;
  currentEventsPerSec: number;
  currentAvgDwellSec: number;
  currentBounceRate: number;
  selectedEventForInspection: EngagementEvent | null;
  selectedSessionForInspection: UserSession | null;
  supabaseStatus: { isConfigured: boolean; url: string; hasAnonKey: boolean; isTableReady: boolean };
  testConnection: () => Promise<{ success: boolean; message: string; tableReady: boolean }>;
  setSelectedEventForInspection: (event: EngagementEvent | null) => void;
  setSelectedSessionForInspection: (session: UserSession | null) => void;
  setSelectedSegment: (seg: 'all' | UserTier) => void;
  setSelectedTimeframe: (tf: 'live' | '15m' | '1h') => void;
  togglePause: () => void;
  setSpeed: (speed: 1 | 2 | 5) => void;
  triggerTrafficSpike: () => void;
  injectCustomEvent: (partial: Partial<EngagementEvent>) => void;
  resolveAlert: (id: string) => void;
  clearEvents: () => void;
  exportTelemetryData: (format: 'json' | 'csv') => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

const EVENT_TYPES_WEIGHTED: { type: EventType; weight: number }[] = [
  { type: 'page_view', weight: 35 },
  { type: 'button_click', weight: 28 },
  { type: 'scroll_depth', weight: 15 },
  { type: 'feature_used', weight: 12 },
  { type: 'search_performed', weight: 4 },
  { type: 'video_milestone', weight: 3 },
  { type: 'checkout_started', weight: 2 },
  { type: 'signup_completed', weight: 1 },
  { type: 'rage_click', weight: 0.5 },
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomWeightedEvent(): EventType {
  const total = EVENT_TYPES_WEIGHTED.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * total;
  for (const item of EVENT_TYPES_WEIGHTED) {
    if (random < item.weight) return item.type;
    random -= item.weight;
  }
  return 'button_click';
}

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SimulationConfig>({
    speed: 1,
    isPaused: false,
    spikeActive: false,
    autoScrollStream: true,
  });

  const [selectedSegment, setSelectedSegment] = useState<'all' | UserTier>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'live' | '15m' | '1h'>('live');
  const [selectedEventForInspection, setSelectedEventForInspection] = useState<EngagementEvent | null>(null);
  const [selectedSessionForInspection, setSelectedSessionForInspection] = useState<UserSession | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState(getSupabaseConfigStatus());

  // Initialize rolling time series
  const [timeSeries, setTimeSeries] = useState<TimePoint[]>(() => {
    const points: TimePoint[] = [];
    const now = Date.now();
    for (let i = 35; i >= 0; i--) {
      const ts = now - i * 3000;
      const base = 1240 + Math.floor(Math.sin(i / 4) * 80 + Math.random() * 60);
      points.push({
        timestamp: ts,
        label: new Date(ts).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
        activeUsers: base,
        eventsPerSec: Math.floor(base * 0.14 + (Math.random() * 18 - 9)),
        avgDwellSec: 142 + Math.floor(Math.random() * 16 - 8),
        bounceRatePct: Number((18.4 + (Math.random() * 2 - 1)).toFixed(1)),
      });
    }
    return points;
  });

  // Active Sessions
  const [activeSessions, setActiveSessions] = useState<UserSession[]>(() => {
    return DEMO_USERS.map((usr, idx) => ({
      sessionId: `sess_${Math.random().toString(36).substring(2, 9)}`,
      userId: usr.userId || `usr_${idx}`,
      userName: usr.userName || `User ${idx}`,
      tier: usr.tier || 'free',
      avatarSeed: usr.userName || `User ${idx}`,
      city: usr.city || 'Berlin',
      country: usr.country || 'Germany',
      countryCode: usr.countryCode || 'DE',
      currentPath: usr.currentPath || '/dashboard',
      startedAt: Date.now() - (idx + 1) * 120000,
      lastActiveAt: Date.now() - (idx + 1) * 4000,
      device: usr.device || 'desktop',
      browser: usr.browser || 'Chrome 128',
      totalEventsCount: usr.totalEventsCount || 24,
      totalDwellTimeSec: usr.totalDwellTimeSec || 320,
      currentScrollDepth: usr.currentScrollDepth || 75,
      status: usr.status || 'active',
      history: [
        { path: '/', dwellSec: 35, timestamp: Date.now() - 100000 },
        { path: usr.currentPath || '/dashboard', dwellSec: 120, timestamp: Date.now() - 40000 },
      ],
    }));
  });

  // Recent Event Stream
  const [events, setEvents] = useState<EngagementEvent[]>(() => {
    const initialList: EngagementEvent[] = [];
    const now = Date.now();
    for (let i = 0; i < 24; i++) {
      const type = getRandomWeightedEvent();
      const country = getRandomItem(COUNTRIES);
      const user = getRandomItem(DEMO_USERS);
      const path = getRandomItem(INITIAL_ROUTES).path;
      initialList.push({
        id: `evt_${Date.now() - i * 1400}_${i}`,
        timestamp: now - i * 1400,
        type,
        path,
        userId: user.userId || 'usr_demo',
        userName: user.userName || 'Anonymous Visitor',
        userTier: user.tier || 'guest',
        country: country.name,
        countryCode: country.code,
        city: country.city,
        device: (user.device as any) || 'desktop',
        browser: user.browser || 'Chrome 128',
        dwellTimeSeconds: Math.floor(Math.random() * 240) + 12,
        scrollDepthPct: Math.floor(Math.random() * 60) + 40,
        metadata: {
          referrer: i % 2 === 0 ? 'https://google.com' : 'Direct Navigation',
          viewportWidth: 1440,
          interactionLatencyMs: Math.floor(Math.random() * 45) + 12,
        },
      });
    }
    return initialList;
  });

  const [routes, setRoutes] = useState<RouteMetric[]>(INITIAL_ROUTES);
  const [funnel] = useState<FunnelStage[]>(INITIAL_FUNNEL);
  const [alerts, setAlerts] = useState<EngagementAlert[]>([
    {
      id: 'alt_1',
      timestamp: Date.now() - 320000,
      severity: 'nominal',
      title: 'Checkout Conversion Above Baseline',
      message: 'Checkout completion step increased by +4.2% over standard 7-day rolling baseline.',
      category: 'Conversion',
      metricImpact: '+4.2% Conversion Rate',
      resolved: false,
    },
    {
      id: 'alt_2',
      timestamp: Date.now() - 180000,
      severity: 'warning',
      title: 'Elevated Dwell Time on API Docs',
      message: 'Average time spent on /docs/api-reference increased to 245s, indicating potential developer search friction.',
      category: 'UX Friction',
      metricImpact: '+32% Avg Dwell',
      resolved: false,
    },
  ]);

  // Load from Supabase on start if configured and table exists
  useEffect(() => {
    let channel: any = null;

    if (isSupabaseConfigured() && supabase) {
      checkAnalyticsTableReady().then((isReady) => {
        setSupabaseStatus(getSupabaseConfigStatus());
        if (!isReady || !supabase) return;

        // Fetch initial telemetry events
        fetchEventsFromSupabase(50).then((dbEvents) => {
          if (dbEvents && dbEvents.length > 0) {
            setEvents((prev) => {
              const ids = new Set(prev.map((e) => e.id));
              const newUnique = dbEvents.filter((e) => !ids.has(e.id));
              return [...newUnique, ...prev].slice(0, 100);
            });
          }
        });

        // Set up Supabase Realtime channel only if table is ready
        channel = supabase
          .channel('realtime_analytics_events')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'analytics_events' },
            (payload: any) => {
              const row = payload.new;
              if (row && row.id) {
                const incomingEvt: EngagementEvent = {
                  id: row.id,
                  timestamp: Number(row.timestamp),
                  type: row.type,
                  path: row.path,
                  userId: row.user_id,
                  userName: row.user_name,
                  userTier: row.user_tier,
                  country: row.country || 'Unknown',
                  countryCode: row.country_code || 'UN',
                  city: row.city || 'Unknown',
                  device: row.device || 'desktop',
                  browser: row.browser || 'Unknown',
                  dwellTimeSeconds: row.dwell_time_seconds || 0,
                  scrollDepthPct: row.scroll_depth_pct || 0,
                  metadata: row.metadata || {},
                };
                setEvents((prev) => {
                  if (prev.some((e) => e.id === incomingEvt.id)) return prev;
                  return [incomingEvt, ...prev.slice(0, 99)];
                });
              }
            }
          )
          .subscribe();
      });

      return () => {
        if (supabase && channel) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, []);

  const spikeRef = useRef(config.spikeActive);
  spikeRef.current = config.spikeActive;

  // Real-time loop
  useEffect(() => {
    if (config.isPaused) return;

    const intervalMs = Math.max(200, 1000 / config.speed);
    const interval = setInterval(() => {
      const now = Date.now();
      const country = getRandomItem(COUNTRIES);
      const randomUser = getRandomItem(activeSessions);
      const route = getRandomItem(routes);
      const isSpike = spikeRef.current;
      const eventType = isSpike && Math.random() > 0.6 ? 'checkout_started' : getRandomWeightedEvent();

      // Create new event
      const newEvent: EngagementEvent = {
        id: `evt_${now}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: now,
        type: eventType,
        path: route.path,
        userId: randomUser.userId,
        userName: randomUser.userName,
        userTier: randomUser.tier,
        country: country.name,
        countryCode: country.code,
        city: country.city,
        device: randomUser.device,
        browser: randomUser.browser,
        dwellTimeSeconds: Math.floor(Math.random() * 180) + 10,
        scrollDepthPct: Math.min(100, Math.floor(Math.random() * 40) + 60),
        metadata: {
          referrer: Math.random() > 0.4 ? 'https://news.ycombinator.com' : 'Direct Search',
          interactionLatencyMs: Math.floor(Math.random() * 35) + 15,
          componentId: eventType === 'button_click' ? 'cta_primary_pricing' : 'main_content',
        },
      };

      // Persist to Supabase asynchronously if configured
      if (isSupabaseConfigured()) {
        persistEventToSupabase(newEvent);
      }

      // If rage click, generate alert occasionally
      if (eventType === 'rage_click') {
        setAlerts((prev) => [
          {
            id: `alt_${now}`,
            timestamp: now,
            severity: 'critical',
            title: `Rage Click Detected on ${route.path}`,
            message: `User ${randomUser.userName} registered 5 rapid unhandled clicks on ${route.path}.`,
            category: 'UX Friction',
            metricImpact: 'Active friction alert',
            resolved: false,
          },
          ...prev.slice(0, 8),
        ]);
      }

      // Update events stream (keep max 100)
      setEvents((prev) => [newEvent, ...prev.slice(0, 99)]);

      // Update sessions state
      setActiveSessions((prev) => {
        return prev.map((s) => {
          if (s.userId === randomUser.userId) {
            const updatedHistory = s.history.some((h) => h.path === route.path)
              ? s.history
              : [...s.history.slice(-4), { path: route.path, dwellSec: 15, timestamp: now }];
            return {
              ...s,
              lastActiveAt: now,
              currentPath: route.path,
              totalEventsCount: s.totalEventsCount + 1,
              status: 'active',
              history: updatedHistory,
            };
          }
          if (now - s.lastActiveAt > 30000 && s.status === 'active') {
            return { ...s, status: 'idle' };
          }
          return s;
        });
      });

      // Update time series point every ~2s
      setTimeSeries((prev) => {
        const last = prev[prev.length - 1];
        if (now - last.timestamp < 1800) return prev;

        const baseMultiplier = isSpike ? 1.45 : 1.0;
        const delta = (Math.random() - 0.48) * 20;
        const nextUsers = Math.max(900, Math.floor((last.activeUsers + delta) * (isSpike ? 1.01 : 1.0)));
        const nextEventsSec = Math.floor((nextUsers * 0.15 + (Math.random() * 12 - 6)) * baseMultiplier);
        const nextDwell = Math.max(80, Math.floor(last.avgDwellSec + (Math.random() - 0.5) * 4));
        const nextBounce = Number(Math.max(12, Math.min(28, last.bounceRatePct + (Math.random() - 0.5) * 0.4)).toFixed(1));

        const nextPoint: TimePoint = {
          timestamp: now,
          label: new Date(now).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
          activeUsers: nextUsers,
          eventsPerSec: nextEventsSec,
          avgDwellSec: nextDwell,
          bounceRatePct: nextBounce,
        };

        return [...prev.slice(1), nextPoint];
      });

      // Fluctuate route active visitors subtly
      setRoutes((prev) =>
        prev.map((r) => {
          if (r.path === route.path) {
            const visitorDelta = Math.random() > 0.5 ? 1 : -1;
            return {
              ...r,
              activeVisitors: Math.max(20, r.activeVisitors + visitorDelta),
              interactionsPerMin: r.interactionsPerMin + (isSpike ? 8 : 2),
            };
          }
          return r;
        })
      );
    }, intervalMs);

    return () => clearInterval(interval);
  }, [config.isPaused, config.speed, routes, activeSessions]);

  // Turn off spike after 14 seconds automatically
  useEffect(() => {
    if (!config.spikeActive) return;
    const timer = setTimeout(() => {
      setConfig((c) => ({ ...c, spikeActive: false }));
      setAlerts((prev) => [
        {
          id: `alt_${Date.now()}`,
          timestamp: Date.now(),
          severity: 'nominal',
          title: 'Traffic Surge Stabilized',
          message: 'Concurrent user velocity normalized back to baseline production levels.',
          category: 'Traffic Spike',
          metricImpact: 'Normalized',
          resolved: false,
        },
        ...prev,
      ]);
    }, 14000);
    return () => clearTimeout(timer);
  }, [config.spikeActive]);

  const togglePause = useCallback(() => {
    setConfig((c) => ({ ...c, isPaused: !c.isPaused }));
  }, []);

  const setSpeed = useCallback((speed: 1 | 2 | 5) => {
    setConfig((c) => ({ ...c, speed }));
  }, []);

  const triggerTrafficSpike = useCallback(() => {
    setConfig((c) => ({ ...c, spikeActive: true }));
    setAlerts((prev) => [
      {
        id: `alt_spike_${Date.now()}`,
        timestamp: Date.now(),
        severity: 'warning',
        title: 'Real-Time Traffic Influx Surge Initiated',
        message: 'Concurrent active users increased by ~45%. Ingestion pipeline autoscaling triggered.',
        category: 'Traffic Spike',
        metricImpact: '+45% Active Sessions',
        resolved: false,
      },
      ...prev,
    ]);
  }, []);

  const injectCustomEvent = useCallback((partial: Partial<EngagementEvent>) => {
    const now = Date.now();
    const country = getRandomItem(COUNTRIES);
    const user = getRandomItem(activeSessions);
    const custom: EngagementEvent = {
      id: `evt_custom_${now}`,
      timestamp: now,
      type: partial.type || 'feature_used',
      path: partial.path || '/dashboard',
      userId: partial.userId || user.userId,
      userName: partial.userName || user.userName,
      userTier: partial.userTier || user.tier,
      country: partial.country || country.name,
      countryCode: partial.countryCode || country.code,
      city: partial.city || country.city,
      device: partial.device || user.device,
      browser: partial.browser || user.browser,
      dwellTimeSeconds: partial.dwellTimeSeconds || 45,
      scrollDepthPct: partial.scrollDepthPct || 85,
      metadata: partial.metadata || { source: 'manual_simulator_trigger' },
    };

    if (isSupabaseConfigured()) {
      persistEventToSupabase(custom);
    }

    setEvents((prev) => [custom, ...prev.slice(0, 99)]);
  }, [activeSessions]);

  const resolveAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const exportTelemetryData = useCallback((format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `pulsetrack_events_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      const headers = ['id', 'timestamp', 'type', 'path', 'userId', 'userName', 'userTier', 'country', 'device', 'dwellTimeSeconds', 'scrollDepthPct'];
      const rows = events.map((e) => [
        e.id,
        new Date(e.timestamp).toISOString(),
        e.type,
        e.path,
        e.userId,
        `"${e.userName}"`,
        e.userTier,
        e.country,
        e.device,
        e.dwellTimeSeconds,
        e.scrollDepthPct,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', encodeURI(csvContent));
      downloadAnchor.setAttribute('download', `pulsetrack_events_${Date.now()}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  }, [events]);

  const testConnection = useCallback(async () => {
    const res = await testSupabaseConnection();
    setSupabaseStatus(getSupabaseConfigStatus());
    return res;
  }, []);

  const latestPoint = timeSeries[timeSeries.length - 1] || {
    activeUsers: 1240,
    eventsPerSec: 182,
    avgDwellSec: 154,
    bounceRatePct: 18.2,
  };

  return (
    <AnalyticsContext.Provider
      value={{
        events,
        activeSessions,
        timeSeries,
        routes,
        funnel,
        alerts,
        config,
        selectedSegment,
        selectedTimeframe,
        currentActiveCount: latestPoint.activeUsers,
        currentEventsPerSec: latestPoint.eventsPerSec,
        currentAvgDwellSec: latestPoint.avgDwellSec,
        currentBounceRate: latestPoint.bounceRatePct,
        selectedEventForInspection,
        selectedSessionForInspection,
        supabaseStatus,
        testConnection,
        setSelectedEventForInspection,
        setSelectedSessionForInspection,
        setSelectedSegment,
        setSelectedTimeframe,
        togglePause,
        setSpeed,
        triggerTrafficSpike,
        injectCustomEvent,
        resolveAlert,
        clearEvents,
        exportTelemetryData,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
