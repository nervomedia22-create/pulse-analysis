import React from 'react';
import { useAnalytics } from '../services/analyticsStore';
import { X, User, MapPin, Laptop, Clock, ArrowRight, Activity } from 'lucide-react';

export const SessionJourneyModal: React.FC = () => {
  const { selectedSessionForInspection, setSelectedSessionForInspection } = useAnalytics();

  if (!selectedSessionForInspection) return null;

  const session = selectedSessionForInspection;
  const sessionDurationSec = Math.floor((Date.now() - session.startedAt) / 1000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-300">
              {session.userName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                {session.userName}
              </h3>
              <div className="text-[11px] font-mono text-slate-400">
                {session.userId} · {session.city}, {session.country} ({session.countryCode})
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedSessionForInspection(null)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <span className="text-[11px] text-slate-500">Session Length</span>
              <div className="font-mono text-sm font-semibold text-white mt-0.5 tabular-nums">
                {Math.floor(sessionDurationSec / 60)}m {sessionDurationSec % 60}s
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <span className="text-[11px] text-slate-500">Interactions</span>
              <div className="font-mono text-sm font-semibold text-white mt-0.5 tabular-nums">
                {session.totalEventsCount} events
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <span className="text-[11px] text-slate-500">Tier / Device</span>
              <div className="font-mono text-sm font-semibold text-white mt-0.5 capitalize">
                {session.tier} · {session.device}
              </div>
            </div>
          </div>

          {/* Sequential Path Navigation Journey */}
          <div>
            <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Route Traversal Timeline</span>
            </h4>

            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800">
              {session.history.map((h, i) => (
                <div key={i} className="relative flex items-start gap-4 pl-8">
                  {/* Step bullet */}
                  <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-indigo-500 -translate-x-1/2" />

                  <div className="flex-1 p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-medium text-indigo-300">
                        {h.path}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {h.dwellSec}s dwell
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Step 0{i + 1} of session exploration · Active reading focus
                    </div>
                  </div>
                </div>
              ))}

              {/* Current live route */}
              <div className="relative flex items-start gap-4 pl-8">
                <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-emerald-300 -translate-x-1/2 animate-ping" />
                <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 -translate-x-1/2" />

                <div className="flex-1 p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/50">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-medium text-emerald-300">
                      {session.currentPath} (Currently Viewing)
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {session.currentScrollDepth}% depth
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Active participant with tab in foreground focus
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800/80 bg-slate-900/50">
          <button
            onClick={() => setSelectedSessionForInspection(null)}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
