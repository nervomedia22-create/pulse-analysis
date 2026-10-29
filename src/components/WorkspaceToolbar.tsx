import React from 'react';
import { Play, Pause, Zap, Download, RefreshCw } from 'lucide-react';
import { useAnalytics } from '../services/analyticsStore';
import { UserTier } from '../types/analytics';

import { Database } from 'lucide-react';

interface WorkspaceToolbarProps {
  onOpenExportModal: () => void;
  onOpenSupabaseModal: () => void;
}

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({
  onOpenExportModal,
  onOpenSupabaseModal,
}) => {
  const {
    config,
    togglePause,
    setSpeed,
    triggerTrafficSpike,
    selectedSegment,
    setSelectedSegment,
    selectedTimeframe,
    setSelectedTimeframe,
    clearEvents,
    supabaseStatus,
  } = useAnalytics();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-3.5 px-6 border-b border-slate-800/60 bg-slate-900/40">
      {/* Left: Breadcrumbs & Cluster info & Supabase pill */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span>Analytics</span>
        <span aria-hidden="true" className="text-slate-600">/</span>
        <span>Real-Time Stream</span>
        <span aria-hidden="true" className="text-slate-600">/</span>
        <span className="text-slate-200 font-medium">Production Cluster</span>

        <span aria-hidden="true" className="text-slate-600">·</span>
        <button
          onClick={onOpenSupabaseModal}
          className={`cursor-pointer font-mono text-[11px] px-2 py-0.5 rounded border transition-colors flex items-center gap-1.5 ${
            supabaseStatus.isConfigured
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Click to view Supabase connection details and SQL schema"
        >
          <Database className="w-3 h-3 text-slate-400" />
          <span>{supabaseStatus.isConfigured ? 'Supabase: Active' : 'Supabase: Connect'}</span>
        </button>

        {config.spikeActive && (
          <>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-amber-400 font-mono text-[11px] animate-pulse">
              [Traffic Influx Active]
            </span>
          </>
        )}
      </div>

      {/* Right: Functional Segment & Stream Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* User Segment Filter */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
          {(['all', 'free', 'pro', 'enterprise'] as const).map((seg) => (
            <button
              key={seg}
              onClick={() => setSelectedSegment(seg as 'all' | UserTier)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                selectedSegment === seg
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {seg === 'all' ? 'All Tiers' : seg}
            </button>
          ))}
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
          {(['live', '15m', '1h'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors uppercase ${
                selectedTimeframe === tf
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        {/* Play / Pause Toggle */}
        <button
          onClick={togglePause}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
            config.isPaused
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
          title={config.isPaused ? 'Resume real-time telemetry stream' : 'Pause telemetry stream'}
        >
          {config.isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </>
          )}
        </button>

        {/* Speed Controls */}
        <div className="flex items-center gap-0.5 p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
          {([1, 2, 5] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                config.speed === s
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Traffic Spike simulator trigger */}
        <button
          onClick={triggerTrafficSpike}
          disabled={config.spikeActive}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
            config.spikeActive
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 cursor-not-allowed'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-amber-400'
          }`}
          title="Simulate sudden viral surge (+45% traffic)"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Surge</span>
        </button>

        {/* Export Data */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          title="Export telemetry events (JSON/CSV)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Reset / Clear */}
        <button
          onClick={clearEvents}
          className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          title="Clear Event Log"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
