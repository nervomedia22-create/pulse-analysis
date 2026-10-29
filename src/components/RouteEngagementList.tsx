import React, { useState } from 'react';
import { useAnalytics } from '../services/analyticsStore';
import { ArrowUpDown, ExternalLink } from 'lucide-react';
import { RouteMetric } from '../types/analytics';

interface RouteEngagementListProps {
  onSelectRoute?: (path: string) => void;
}

export const RouteEngagementList: React.FC<RouteEngagementListProps> = ({ onSelectRoute }) => {
  const { routes } = useAnalytics();
  const [sortBy, setSortBy] = useState<'visitors' | 'dwell' | 'scroll'>('visitors');

  const sortedRoutes = [...routes].sort((a, b) => {
    if (sortBy === 'visitors') return b.activeVisitors - a.activeVisitors;
    if (sortBy === 'dwell') return b.avgDwellSec - a.avgDwellSec;
    return b.avgScrollDepthPct - a.avgScrollDepthPct;
  });

  const maxVisitors = Math.max(...routes.map((r) => r.activeVisitors), 1);

  return (
    <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Top Active Routes & Content Depth
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time participant presence and vertical scroll engagement.
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
          <button
            onClick={() => setSortBy('visitors')}
            className={`cursor-pointer px-2 py-0.5 rounded transition-colors ${
              sortBy === 'visitors' ? 'text-white bg-slate-800 font-medium' : 'hover:text-slate-200'
            }`}
          >
            Visitors
          </button>
          <button
            onClick={() => setSortBy('dwell')}
            className={`cursor-pointer px-2 py-0.5 rounded transition-colors ${
              sortBy === 'dwell' ? 'text-white bg-slate-800 font-medium' : 'hover:text-slate-200'
            }`}
          >
            Dwell
          </button>
          <button
            onClick={() => setSortBy('scroll')}
            className={`cursor-pointer px-2 py-0.5 rounded transition-colors ${
              sortBy === 'scroll' ? 'text-white bg-slate-800 font-medium' : 'hover:text-slate-200'
            }`}
          >
            Scroll
          </button>
        </div>
      </div>

      {/* High-density Route Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-medium">
              <th className="py-2.5 pl-2 font-medium">Route & Page Title</th>
              <th className="py-2.5 px-3 text-right font-medium">Active Now</th>
              <th className="py-2.5 px-3 text-right font-medium">Avg Dwell</th>
              <th className="py-2.5 px-3 text-right font-medium">Scroll Depth</th>
              <th className="py-2.5 pr-2 text-right font-medium">Actions/m</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {sortedRoutes.map((route: RouteMetric) => {
              const widthPct = Math.round((route.activeVisitors / maxVisitors) * 100);
              return (
                <tr
                  key={route.path}
                  onClick={() => onSelectRoute && onSelectRoute(route.path)}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                >
                  {/* Route title & path */}
                  <td className="py-3 pl-2 pr-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-indigo-300 font-medium group-hover:text-indigo-200 transition-colors">
                        {route.path}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span>{route.title}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-slate-500">{route.category}</span>
                    </div>
                  </td>

                  {/* Active visitors with subtle proportional bar */}
                  <td className="py-3 px-3 text-right">
                    <div className="font-mono tabular-nums font-semibold text-white">
                      {route.activeVisitors}
                    </div>
                    <div className="w-16 h-1 bg-slate-800 rounded-full ml-auto mt-1 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500/80 rounded-full transition-all duration-300"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </td>

                  {/* Avg Dwell Time */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                    {Math.floor(route.avgDwellSec / 60)}m {route.avgDwellSec % 60}s
                  </td>

                  {/* Scroll Depth */}
                  <td className="py-3 px-3 text-right">
                    <div className="font-mono tabular-nums text-slate-300">
                      {route.avgScrollDepthPct}%
                    </div>
                    <div className="w-12 h-1 bg-slate-800 rounded-full ml-auto mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          route.avgScrollDepthPct > 75
                            ? 'bg-emerald-500'
                            : route.avgScrollDepthPct > 50
                            ? 'bg-cyan-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${route.avgScrollDepthPct}%` }}
                      />
                    </div>
                  </td>

                  {/* Interactions per minute */}
                  <td className="py-3 pr-2 text-right font-mono tabular-nums text-slate-400">
                    {route.interactionsPerMin.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
