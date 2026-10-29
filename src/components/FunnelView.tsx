import React, { useState } from 'react';
import { useAnalytics } from '../services/analyticsStore';
import { FunnelStage } from '../types/analytics';
import { ChevronRight, ArrowDownRight, Clock, Users } from 'lucide-react';

export const FunnelView: React.FC = () => {
  const { funnel } = useAnalytics();
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const initialVisitors = funnel[0]?.visitors || 1;
  const activeStage = selectedStep !== null ? funnel.find((s) => s.step === selectedStep) : null;

  return (
    <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Live Onboarding & Conversion Funnel
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time stage-by-stage pipeline throughput and friction drop-offs.
          </p>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Overall Conversion:</span>
          <span className="font-mono tabular-nums font-semibold text-emerald-400">
            {funnel.length > 0 ? ((funnel[funnel.length - 1].visitors / initialVisitors) * 100).toFixed(1) : '0.0'}%
          </span>
        </div>
      </div>

      {/* Funnel visual bars and dropoff connectors */}
      <div className="space-y-3">
        {funnel.map((stage: FunnelStage, idx: number) => {
          const widthPct = Math.max(12, Math.round((stage.visitors / initialVisitors) * 100));
          const isSelected = selectedStep === stage.step;
          const isFinal = idx === funnel.length - 1;

          return (
            <div key={stage.step} className="group">
              <div
                onClick={() => setSelectedStep(isSelected ? null : stage.step)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-indigo-500/80 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 w-5">
                      0{stage.step}.
                    </span>
                    <span className="text-xs font-medium text-white group-hover:text-indigo-300 transition-colors">
                      {stage.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 hidden md:inline">
                      ({stage.path})
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right">
                      <span className="text-slate-400 font-sans text-[11px]">Visitors: </span>
                      <span className="tabular-nums font-semibold text-white">
                        {stage.visitors.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 font-sans text-[11px]">Pass-through: </span>
                      <span className="tabular-nums font-semibold text-emerald-400">
                        {stage.conversionRate}%
                      </span>
                    </div>

                    <div className="text-right text-slate-400 hidden sm:block">
                      <span className="font-sans text-[11px]">Dwell: </span>
                      <span className="tabular-nums text-slate-300">
                        {stage.avgTimeInStepSec}s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar representing remaining cohort */}
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stage.step === 1
                        ? 'bg-indigo-500'
                        : stage.step === 2
                        ? 'bg-blue-500'
                        : stage.step === 3
                        ? 'bg-cyan-500'
                        : stage.step === 4
                        ? 'bg-teal-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>

              {/* Drop-off connector below stage if not final */}
              {!isFinal && (
                <div className="flex items-center gap-2 px-6 py-1 text-[11px] text-slate-500">
                  <ChevronRight className="w-3.5 h-3.5 rotate-90 text-slate-600" />
                  <span className="font-mono tabular-nums text-rose-400/90 flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3 inline" />
                    -{stage.dropoffRate}% dropoff ({Math.round((stage.visitors * stage.dropoffRate) / 100).toLocaleString()} users abandoned)
                  </span>
                  <span aria-hidden="true" className="text-slate-700">·</span>
                  <span>Primary friction: High form fields dwell</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Stage Detail Drawer */}
      {activeStage && (
        <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-semibold text-white">
              Stage 0{activeStage.step} Diagnostic: {activeStage.name}
            </span>
            <button
              onClick={() => setSelectedStep(null)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80">
              <div className="text-slate-500 flex items-center gap-1 mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Cohort Retention</span>
              </div>
              <div className="font-mono text-base font-bold text-white tabular-nums">
                {activeStage.conversionRate}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {activeStage.conversions.toLocaleString()} proceeded to next step
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80">
              <div className="text-slate-500 flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Average Time-in-Step</span>
              </div>
              <div className="font-mono text-base font-bold text-white tabular-nums">
                {activeStage.avgTimeInStepSec}s
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Expected benchmark: ~45s
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80">
              <div className="text-slate-500 flex items-center gap-1 mb-1">
                <span>Optimization Recommendation</span>
              </div>
              <div className="text-slate-300 font-medium leading-relaxed">
                {activeStage.step === 2
                  ? 'Clarify annual discount pricing toggle to reduce bounce.'
                  : activeStage.step === 3
                  ? 'Enable 1-click Google Pay & Apple Pay autofill.'
                  : 'Streamline empty state guidance on initial project create.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
