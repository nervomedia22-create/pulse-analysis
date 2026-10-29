import React from 'react';
import { useAnalytics } from '../services/analyticsStore';
import { EngagementAlert } from '../types/analytics';
import { AlertTriangle, CheckCircle, ShieldAlert, Sparkles, Check, ArrowRight } from 'lucide-react';

export const FrictionAlertsView: React.FC = () => {
  const { alerts, resolveAlert, injectCustomEvent } = useAnalytics();

  const handleTriggerTestAnomaly = () => {
    injectCustomEvent({
      type: 'rage_click',
      path: '/checkout',
      dwellTimeSeconds: 190,
      metadata: { error: 'payment_gateway_timeout_504', clickStreak: 6 },
    });
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header and action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Real-Time UX Friction & Behavioral Anomalies
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Algorithmic anomaly detection scanning for rage clicks, sudden drop-offs, and checkout bottlenecks.
          </p>
        </div>

        <button
          onClick={handleTriggerTestAnomaly}
          className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 hover:bg-rose-900/40 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Simulate Rage Click Incident</span>
        </button>
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-slate-900/60 border border-slate-800/80">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">All telemetry pipelines healthy</h3>
            <p className="text-xs text-slate-400 mt-1">
              Zero unhandled rage clicks or funnel anomalies detected in the active window.
            </p>
          </div>
        ) : (
          alerts.map((alert: EngagementAlert) => {
            const timeAgo = Math.floor((Date.now() - alert.timestamp) / 1000);
            const timeStr =
              timeAgo < 60
                ? `${timeAgo}s ago`
                : `${Math.floor(timeAgo / 60)}m ago`;

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  alert.resolved
                    ? 'bg-slate-950/40 border-slate-800/40 opacity-60'
                    : alert.severity === 'critical'
                    ? 'bg-rose-950/20 border-rose-800/60'
                    : alert.severity === 'warning'
                    ? 'bg-amber-950/20 border-amber-800/60'
                    : 'bg-emerald-950/20 border-emerald-800/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {alert.severity === 'critical' ? (
                        <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                      ) : alert.severity === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          {alert.title}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-[11px] text-slate-400">
                          {alert.category}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {timeStr}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {alert.message}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[11px] font-mono">
                        <span className="text-slate-400">Impact: </span>
                        <span
                          className={`font-semibold ${
                            alert.severity === 'critical'
                              ? 'text-rose-400'
                              : alert.severity === 'warning'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {alert.metricImpact}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {!alert.resolved ? (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Acknowledge & Resolve</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-500">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
