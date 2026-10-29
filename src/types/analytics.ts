export type EventType = 
  | 'page_view'
  | 'button_click'
  | 'scroll_depth'
  | 'feature_used'
  | 'signup_completed'
  | 'checkout_started'
  | 'checkout_completed'
  | 'rage_click'
  | 'search_performed'
  | 'video_milestone';

export type UserTier = 'guest' | 'free' | 'pro' | 'enterprise';
export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export interface EngagementEvent {
  id: string;
  timestamp: number;
  type: EventType;
  path: string;
  userId: string;
  userName: string;
  userTier: UserTier;
  country: string;
  countryCode: string;
  city: string;
  device: DeviceType;
  browser: string;
  dwellTimeSeconds: number;
  scrollDepthPct: number;
  metadata: Record<string, string | number | boolean>;
}

export interface UserSession {
  sessionId: string;
  userId: string;
  userName: string;
  tier: UserTier;
  avatarSeed: string;
  city: string;
  country: string;
  countryCode: string;
  currentPath: string;
  startedAt: number;
  lastActiveAt: number;
  device: DeviceType;
  browser: string;
  totalEventsCount: number;
  totalDwellTimeSec: number;
  currentScrollDepth: number;
  status: 'active' | 'idle';
  history: { path: string; dwellSec: number; timestamp: number }[];
}

export interface TimePoint {
  timestamp: number;
  label: string;
  activeUsers: number;
  eventsPerSec: number;
  avgDwellSec: number;
  bounceRatePct: number;
}

export interface RouteMetric {
  path: string;
  title: string;
  category: string;
  activeVisitors: number;
  avgDwellSec: number;
  avgScrollDepthPct: number;
  bounceRatePct: number;
  interactionsPerMin: number;
}

export interface FunnelStage {
  step: number;
  name: string;
  path: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  dropoffRate: number;
  avgTimeInStepSec: number;
}

export interface EngagementAlert {
  id: string;
  timestamp: number;
  severity: 'nominal' | 'warning' | 'critical';
  title: string;
  message: string;
  category: 'Conversion' | 'UX Friction' | 'Traffic Spike' | 'Retention';
  metricImpact: string;
  resolved: boolean;
}

export interface SimulationConfig {
  speed: 1 | 2 | 5;
  isPaused: boolean;
  spikeActive: boolean;
  autoScrollStream: boolean;
}
