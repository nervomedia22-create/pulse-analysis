import React, { useState, useMemo } from 'react';
import { useAnalytics } from '../services/analyticsStore';
import { EngagementEvent, EventType } from '../types/analytics';
import { Search, Filter, ShieldAlert, CheckCircle2, Eye, MousePointer, Flame, Layers } from 'lucide-react';

export const LiveEventStream: React.FC = () => {
  const { events, setSelectedEventForInspection } = useAnalytics();
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterTabs = [
    { id: 'all', label: 'All Telemetry', count: events.length },
    { id: 'page_view', label: 'Page Views', count: events.filter((e) => e.type === 'page_view').length },
    { id: 'button_click', label: 'Interactions', count: events.filter((e) => e.type === 'button_click').length },
    { id: 'feature_used', label: 'Feature Invocations', count: events.filter((e) => e.type === 'feature_used').length },
    {
      id: 'conversions',
      label: 'Conversions',
      count: events.filter((e) => e.type === 'checkout_completed' || e.type === 'signup_completed').length,
    },
    { id: 'rage_click', label: 'Rage Clicks', count: events.filter((e) => e.type === 'rage_click').length },
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Type filtering
      if (selectedTypeFilter !== 'all') {
        if (selectedTypeFilter === 'conversions') {
          if (evt.type !== 'checkout_completed' && evt.type !== 'signup_completed') return false;
        } else if (evt.type !== selectedTypeFilter) {
          return false;
        }
      }

      // Query filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPath = evt.path.toLowerCase().includes(q);
        const matchesUser = evt.userName.toLowerCase().includes(q) || evt.userId.toLowerCase().includes(q);
        const matchesCountry = evt.country.toLowerCase().includes(q);
        const matchesType = evt.type.toLowerCase().includes(q);
        return matchesPath || matchesUser || matchesCountry || matchesType;
      }

      return true;
    });
  }, [events, selectedTypeFilter, searchQuery]);

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'page_view':
        return <Eye className="w-3.5 h-3.5 text-blue-400" />;
      case 'button_click':
        return <MousePointer className="w-3.5 h-3.5 text-indigo-400" />;
      case 'feature_used':
        return <Layers className="w-3.5 h-3.5 text-cyan-400" />;
      case 'checkout_completed':
      case 'signup_completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'rage_click':
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <MousePointer className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const formatEventName = (type: EventType) => {
    switch (type) {
      case 'page_view':
        return 'PAGE_VIEW';
      case 'button_click':
        return 'CLICK';
      case 'scroll_depth':
        return 'SCROLL_DEPTH';
      case 'feature_used':
        return 'FEATURE_EXEC';
      case 'checkout_started':
        return 'CHECKOUT_START';
      case 'checkout_completed':
        return 'PURCHASE_SUCCESS';
      case 'signup_completed':
        return 'SIGNUP_SUCCESS';
      case 'rage_click':
        return 'RAGE_CLICK';
      case 'search_performed':
        return 'SEARCH_QUERY';
      case 'video_milestone':
        return 'MEDIA_PROGRESS';
      default:
        return type;
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Event Type Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTypeFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                selectedTypeFilter === tab.id
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="font-mono text-[11px] opacity-75 tabular-nums">
                ({tab.count})
              </span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by user, route, or event..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stream Table */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-200">Continuous Event Ingestion</span>
            <span aria-hidden="true">·</span>
            <span>Showing {filteredEvents.length} live records</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Click any row for JSON schema and user journey payload
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Filter className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-medium text-slate-300">No events matching filter criteria</p>
            <p className="text-slate-500 mt-1">Adjust search terms or reset the category filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-400 font-medium bg-slate-950/40">
                  <th className="py-2.5 pl-4 font-medium">Timestamp</th>
                  <th className="py-2.5 px-3 font-medium">Event Type</th>
                  <th className="py-2.5 px-3 font-medium">Route Path</th>
                  <th className="py-2.5 px-3 font-medium">User Profile</th>
                  <th className="py-2.5 px-3 font-medium">Location</th>
                  <th className="py-2.5 px-3 font-medium">Client Specs</th>
                  <th className="py-2.5 pr-4 text-right font-medium">Dwell & Scroll</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredEvents.map((evt: EngagementEvent) => {
                  const timeStr = new Date(evt.timestamp).toLocaleTimeString([], {
                    hour12: false,
                    minute: '2-digit',
                    second: '2-digit',
                  });
                  const msStr = (evt.timestamp % 1000).toString().padStart(3, '0');

                  return (
                    <tr
                      key={evt.id}
                      onClick={() => setSelectedEventForInspection(evt)}
                      className={`hover:bg-slate-800/40 transition-colors cursor-pointer group ${
                        evt.type === 'rage_click' ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="py-3 pl-4 pr-3 font-mono tabular-nums text-slate-400 text-[11px] whitespace-nowrap">
                        {timeStr}.{msStr}
                      </td>

                      {/* Event Type */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {getEventIcon(evt.type)}
                          <span
                            className={`font-mono text-[11px] font-semibold ${
                              evt.type === 'rage_click'
                                ? 'text-rose-400'
                                : evt.type === 'checkout_completed' || evt.type === 'signup_completed'
                                ? 'text-emerald-400'
                                : 'text-slate-300'
                            }`}
                          >
                            {formatEventName(evt.type)}
                          </span>
                        </div>
                      </td>

                      {/* Path */}
                      <td className="py-3 px-3 font-mono text-indigo-300 font-medium group-hover:text-indigo-200">
                        {evt.path}
                      </td>

                      {/* User */}
                      <td className="py-3 px-3">
                        <div className="text-white font-medium">{evt.userName}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                          <span>{evt.userId}</span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize text-slate-400">{evt.userTier}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-slate-400">{evt.countryCode}</span>
                          <span>{evt.city}</span>
                        </div>
                      </td>

                      {/* Client Specs */}
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        <span className="capitalize">{evt.device}</span>
                        <span className="text-slate-600 mx-1">·</span>
                        <span>{evt.browser}</span>
                      </td>

                      {/* Dwell & Scroll */}
                      <td className="py-3 pr-4 text-right font-mono tabular-nums text-slate-300 text-[11px]">
                        <div>{evt.dwellTimeSeconds}s dwell</div>
                        <div className="text-slate-500">{evt.scrollDepthPct}% scroll</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
