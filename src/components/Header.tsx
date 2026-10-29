import React from 'react';
import { Activity } from 'lucide-react';

interface HeaderProps {
  activeTab: 'monitor' | 'stream' | 'sessions' | 'funnels' | 'alerts';
  onTabChange: (tab: 'monitor' | 'stream' | 'sessions' | 'funnels' | 'alerts') => void;
  onOpenSimulateModal: () => void;
  onOpenSupabaseModal: () => void;
  unresolvedAlertsCount: number;
  isSupabaseConfigured: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenSimulateModal,
  onOpenSupabaseModal,
  unresolvedAlertsCount,
  isSupabaseConfigured,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/95 sticky top-0 z-40 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
          <Activity className="w-4 h-4" />
        </div>
        <span className="text-base font-semibold tracking-tight text-white whitespace-nowrap">
          PulseTrack
        </span>
      </div>

      {/* Zone 2: 4-5 single-line clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => onTabChange('monitor')}
          className={`cursor-pointer transition-colors whitespace-nowrap pb-1 pt-0.5 border-b-2 ${
            activeTab === 'monitor'
              ? 'text-white border-indigo-500'
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          Live Monitor
        </button>
        <button
          onClick={() => onTabChange('stream')}
          className={`cursor-pointer transition-colors whitespace-nowrap pb-1 pt-0.5 border-b-2 ${
            activeTab === 'stream'
              ? 'text-white border-indigo-500'
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          Event Stream
        </button>
        <button
          onClick={() => onTabChange('sessions')}
          className={`cursor-pointer transition-colors whitespace-nowrap pb-1 pt-0.5 border-b-2 ${
            activeTab === 'sessions'
              ? 'text-white border-indigo-500'
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          Active Sessions
        </button>
        <button
          onClick={() => onTabChange('funnels')}
          className={`cursor-pointer transition-colors whitespace-nowrap pb-1 pt-0.5 border-b-2 ${
            activeTab === 'funnels'
              ? 'text-white border-indigo-500'
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          Conversion Funnels
        </button>
        <button
          onClick={() => onTabChange('alerts')}
          className={`cursor-pointer transition-colors whitespace-nowrap pb-1 pt-0.5 border-b-2 flex items-center gap-1.5 ${
            activeTab === 'alerts'
              ? 'text-white border-indigo-500'
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          <span>Friction Alerts</span>
          {unresolvedAlertsCount > 0 && (
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.2 rounded">
              {unresolvedAlertsCount}
            </span>
          )}
        </button>
      </nav>

      {/* Zone 3: Primary actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenSupabaseModal}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 border flex items-center gap-1.5 ${
            isSupabaseConfigured
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white'
          }`}
          title="Supabase PostgreSQL Integration"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span>Supabase</span>
        </button>

        <button
          onClick={onOpenSimulateModal}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0 border border-indigo-400/30 shadow-sm"
        >
          Simulate Event
        </button>
      </div>
    </header>
  );
};
