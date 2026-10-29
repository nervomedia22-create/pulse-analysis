import React, { useState } from 'react';
import { useAnalytics } from '../services/analyticsStore';
import { X, Copy, Check, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

export const EventInspectorModal: React.FC = () => {
  const { selectedEventForInspection, setSelectedEventForInspection } = useAnalytics();
  const [copied, setCopied] = useState(false);

  if (!selectedEventForInspection) return null;

  const evt = selectedEventForInspection;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(evt, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Event Telemetry Ingestion Payload
            </h3>
            <span className="text-xs font-mono text-slate-500">
              ({evt.id})
            </span>
          </div>

          <button
            onClick={() => setSelectedEventForInspection(null)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Key metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <span className="text-[11px] text-slate-500 font-sans">Event Type</span>
              <div className="font-mono text-white font-semibold mt-0.5">
                {evt.type}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <span className="text-[11px] text-slate-500 font-sans">Route Location</span>
              <div className="font-mono text-indigo-300 font-semibold mt-0.5 truncate">
                {evt.path}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <span className="text-[11px] text-slate-500 font-sans">Timestamp</span>
              <div className="font-mono text-slate-300 mt-0.5">
                {new Date(evt.timestamp).toISOString()}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <span className="text-[11px] text-slate-500 font-sans">User Entity</span>
              <div className="font-semibold text-white mt-0.5">{evt.userName}</div>
              <div className="font-mono text-[10px] text-slate-500">{evt.userId} · {evt.userTier}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <span className="text-[11px] text-slate-500 font-sans">Client Location</span>
              <div className="text-slate-300 mt-0.5">{evt.city}, {evt.country} ({evt.countryCode})</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <span className="text-[11px] text-slate-500 font-sans">Engagement Dwell</span>
              <div className="font-mono tabular-nums text-white mt-0.5">
                {evt.dwellTimeSeconds}s dwell · {evt.scrollDepthPct}% scroll
              </div>
            </div>
          </div>

          {/* Raw JSON viewer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-mono text-[11px]">Normalized JSON Payload</span>
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Payload'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400/90 overflow-x-auto leading-relaxed">
              {JSON.stringify(evt, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800/80 bg-slate-900/50">
          <button
            onClick={() => setSelectedEventForInspection(null)}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
