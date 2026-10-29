import React, { useState } from 'react';
import { useAnalytics } from '../services/analyticsStore';
import { UserSession, UserTier } from '../types/analytics';
import { Users, Clock, Compass, Laptop, Smartphone, Tablet, Activity, ArrowRight } from 'lucide-react';

export const ActiveSessionsView: React.FC = () => {
  const { activeSessions, setSelectedSessionForInspection } = useAnalytics();
  const [tierFilter, setTierFilter] = useState<'all' | UserTier>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'idle'>('all');

  const filteredSessions = activeSessions.filter((s) => {
    if (tierFilter !== 'all' && s.tier !== tierFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    return true;
  });

  const getDeviceIcon = (device: string) => {
    if (device === 'mobile') return <Smartphone className="w-3.5 h-3.5 text-slate-400" />;
    if (device === 'tablet') return <Tablet className="w-3.5 h-3.5 text-slate-400" />;
    return <Laptop className="w-3.5 h-3.5 text-slate-400" />;
  };

  const getTierColor = (tier: UserTier) => {
    switch (tier) {
      case 'enterprise':
        return 'text-purple-400 border-purple-500/30 bg-purple-950/30';
      case 'pro':
        return 'text-indigo-400 border-indigo-500/30 bg-indigo-950/30';
      case 'free':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-900';
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Live Concurrent User Sessions
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active browser sessions with ongoing navigation paths and event histories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
            {(['all', 'active', 'idle'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                  statusFilter === st ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Tier filter */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
            {(['all', 'enterprise', 'pro', 'free'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t as any)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                  tierFilter === t ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.map((session: UserSession) => {
          const activeSec = Math.floor((Date.now() - session.startedAt) / 1000);
          const mins = Math.floor(activeSec / 60);

          return (
            <div
              key={session.sessionId}
              onClick={() => setSelectedSessionForInspection(session)}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-850 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Header: Name, Status & Tier */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-medium text-xs text-white">
                      {session.userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {session.userName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {session.userId} · {session.city}, {session.countryCode}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${getTierColor(
                        session.tier
                      )}`}
                    >
                      {session.tier}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        session.status === 'active' ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                      title={session.status === 'active' ? 'Actively typing/clicking' : 'Idle session'}
                    />
                  </div>
                </div>

                {/* Current Active Location */}
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 mb-3 text-xs">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                    <Compass className="w-3 h-3 text-slate-400" />
                    <span>Current Active Route</span>
                  </div>
                  <div className="font-mono text-indigo-300 font-medium truncate">
                    {session.currentPath}
                  </div>
                </div>

                {/* Metrics ribbon */}
                <div className="grid grid-cols-3 gap-2 text-xs font-mono py-2 border-y border-slate-800/60 mb-3 text-slate-300">
                  <div>
                    <div className="text-[10px] text-slate-500 font-sans">Session Dwell</div>
                    <div className="tabular-nums font-semibold mt-0.5">{mins}m {activeSec % 60}s</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-sans">Total Events</div>
                    <div className="tabular-nums font-semibold mt-0.5">{session.totalEventsCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-sans">Scroll Depth</div>
                    <div className="tabular-nums font-semibold mt-0.5">{session.currentScrollDepth}%</div>
                  </div>
                </div>
              </div>

              {/* Footer info & view journey link */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  {getDeviceIcon(session.device)}
                  <span>{session.browser}</span>
                </div>
                <div className="flex items-center gap-1 text-indigo-400 group-hover:text-indigo-300 font-medium">
                  <span>View Journey</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
