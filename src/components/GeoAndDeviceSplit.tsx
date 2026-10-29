import React from 'react';
import { COUNTRIES } from '../services/mockData';
import { Laptop, Smartphone, Tablet, Globe } from 'lucide-react';
import { useAnalytics } from '../services/analyticsStore';

export const GeoAndDeviceSplit: React.FC = () => {
  const { currentActiveCount } = useAnalytics();

  const devices = [
    { name: 'Desktop', icon: Laptop, share: 64, color: 'bg-indigo-500' },
    { name: 'Mobile', icon: Smartphone, share: 31, color: 'bg-cyan-500' },
    { name: 'Tablet', icon: Tablet, share: 5, color: 'bg-amber-500' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* 2-col Geographic breakdown */}
      <div className="lg:col-span-2 p-6 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Active Regional Distribution
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {COUNTRIES.length} primary territories
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COUNTRIES.map((country) => {
            const calculatedUsers = Math.round((currentActiveCount * country.share) / 100);
            return (
              <div
                key={country.code}
                className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70 hover:border-slate-700/80 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 font-semibold">{country.code}</span>
                    <span className="text-slate-200 font-medium">{country.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums text-white font-semibold">
                      {calculatedUsers}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      ({country.share}%)
                    </span>
                  </div>
                </div>

                {/* Regional volume bar */}
                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500/80 rounded-full"
                    style={{ width: `${country.share * 2.2}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 1-col Device & Client Fleet Breakdown */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight mb-1">
            Client Device Modality
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Hardware viewport and client distribution.
          </p>

          <div className="space-y-4">
            {devices.map((device) => {
              const Icon = device.icon;
              return (
                <div key={device.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{device.name}</span>
                    </div>
                    <span className="font-mono tabular-nums text-white font-semibold">
                      {device.share}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${device.color} rounded-full`}
                      style={{ width: `${device.share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/60 mt-4 text-xs text-slate-400">
          <div className="text-[11px] text-slate-500 mb-1">Top Browser Engines</div>
          <div className="flex items-center justify-between font-mono text-slate-300 text-xs">
            <span>Chrome (68%)</span>
            <span>Safari (22%)</span>
            <span>Firefox (7%)</span>
            <span>Other (3%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
