import React from 'react';
import { Users, Activity, Clock, ArrowUpRight, ArrowDownRight, MousePointerClick, ShieldCheck } from 'lucide-react';
import { useAnalytics } from '../services/analyticsStore';

export const MetricCards: React.FC = () => {
  const {
    currentActiveCount,
    currentEventsPerSec,
    currentAvgDwellSec,
    currentBounceRate,
    timeSeries,
    config,
  } = useAnalytics();

  // Calculate subtle trend against 5 points ago
  const prevPoint = timeSeries.length > 6 ? timeSeries[timeSeries.length - 6] : timeSeries[0];
  const userDelta = prevPoint ? currentActiveCount - prevPoint.activeUsers : 0;
  const userDeltaPct = prevPoint && prevPoint.activeUsers > 0 ? ((userDelta / prevPoint.activeUsers) * 100).toFixed(1) : '0.0';

  const formatDwellTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      {/* 1. Concurrent Active Users */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-medium text-slate-300">Active Visitors Now</span>
          <Users className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-3xl font-bold font-mono tabular-nums text-white tracking-tight">
            {currentActiveCount.toLocaleString()}
          </span>
          <div className="flex items-center text-xs font-mono tabular-nums text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5 inline mr-0.5" />
            <span>+{Math.abs(Number(userDeltaPct))}%</span>
          </div>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <span>Concurrent sessions</span>
          <span aria-hidden="true">·</span>
          <span>{config.spikeActive ? 'High traffic burst' : 'Nominal capacity'}</span>
        </div>
      </div>

      {/* 2. Event Ingestion Velocity */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-medium text-slate-300">Event Velocity</span>
          <Activity className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-3xl font-bold font-mono tabular-nums text-white tracking-tight">
            {currentEventsPerSec.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-mono">events / sec</span>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <span>~{(currentEventsPerSec * 60).toLocaleString()} ev/min</span>
          <span aria-hidden="true">·</span>
          <span>Sub-20ms latency</span>
        </div>
      </div>

      {/* 3. Average Active Dwell Time */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-medium text-slate-300">Average Dwell Time</span>
          <Clock className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-3xl font-bold font-mono tabular-nums text-white tracking-tight">
            {formatDwellTime(currentAvgDwellSec)}
          </span>
          <div className="flex items-center text-xs font-mono tabular-nums text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5 inline mr-0.5" />
            <span>+8.4s</span>
          </div>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <span>Active focus duration</span>
          <span aria-hidden="true">·</span>
          <span>Tab visible</span>
        </div>
      </div>

      {/* 4. Live Session Engagement & Bounce Rate */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-medium text-slate-300">Instant Bounce Rate</span>
          <MousePointerClick className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-3xl font-bold font-mono tabular-nums text-white tracking-tight">
            {currentBounceRate}%
          </span>
          <div className="flex items-center text-xs font-mono tabular-nums text-emerald-400">
            <ArrowDownRight className="w-3.5 h-3.5 inline mr-0.5" />
            <span>-1.2%</span>
          </div>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <span>Sessions &lt; 10s</span>
          <span aria-hidden="true">·</span>
          <span>Healthy range (&lt;25%)</span>
        </div>
      </div>
    </div>
  );
};
