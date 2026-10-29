import React from 'react';
import { useAnalytics } from '../services/analyticsStore';
import { X, Download, FileText, Database } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { events, exportTelemetryData } = useAnalytics();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Export Telemetry Ingestion Data
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-300">
            Export the rolling live buffer containing{' '}
            <span className="font-mono text-white font-semibold">{events.length}</span> recorded
            user engagement telemetry events.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                exportTelemetryData('json');
                onClose();
              }}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-850 text-left transition-all flex flex-col justify-between group"
            >
              <div>
                <Database className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-105 transition-transform" />
                <div className="font-semibold text-white">JSON Format</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Full nested payload with event metadata, browser specs, and timestamps.
                </div>
              </div>
              <div className="mt-3 text-[11px] text-indigo-400 font-medium">
                Download .json
              </div>
            </button>

            <button
              onClick={() => {
                exportTelemetryData('csv');
                onClose();
              }}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-850 text-left transition-all flex flex-col justify-between group"
            >
              <div>
                <FileText className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-105 transition-transform" />
                <div className="font-semibold text-white">CSV Format</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Flattened tabular data ready for pandas, Excel, Snowflake, or BigQuery.
                </div>
              </div>
              <div className="mt-3 text-[11px] text-emerald-400 font-medium">
                Download .csv
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800/80 bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
