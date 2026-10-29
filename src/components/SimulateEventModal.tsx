import React, { useState } from 'react';
import { useAnalytics } from '../services/analyticsStore';
import { EventType, UserTier } from '../types/analytics';
import { X, Play, Zap, CheckCircle2, Flame, Layers, MousePointer, Eye } from 'lucide-react';

interface SimulateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulateEventModal: React.FC<SimulateEventModalProps> = ({ isOpen, onClose }) => {
  const { injectCustomEvent, triggerTrafficSpike } = useAnalytics();

  const [eventType, setEventType] = useState<EventType>('feature_used');
  const [routePath, setRoutePath] = useState<string>('/dashboard');
  const [userTier, setUserTier] = useState<UserTier>('pro');
  const [dwellTime, setDwellTime] = useState<number>(45);
  const [scrollDepth, setScrollDepth] = useState<number>(85);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    injectCustomEvent({
      type: eventType,
      path: routePath,
      userTier,
      dwellTimeSeconds: dwellTime,
      scrollDepthPct: scrollDepth,
      metadata: {
        source: 'interactive_simulator',
        emittedAt: new Date().toISOString(),
      },
    });

    setFeedbackMsg(`Emitted ${eventType} on ${routePath}`);
    setTimeout(() => {
      setFeedbackMsg(null);
      onClose();
    }, 800);
  };

  const handleQuickPreset = (type: EventType, path: string, tier: UserTier, dwell: number) => {
    injectCustomEvent({
      type,
      path,
      userTier: tier,
      dwellTimeSeconds: dwell,
      scrollDepthPct: 90,
      metadata: { preset: 'quick_action', emittedAt: new Date().toISOString() },
    });
    setFeedbackMsg(`Dispatched preset ${type} on ${path}`);
    setTimeout(() => {
      setFeedbackMsg(null);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Interactive Event Ingestion Simulator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Quick Preset Buttons */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
              Quick Test Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset('checkout_completed', '/checkout', 'enterprise', 180)}
                className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/50 hover:bg-emerald-900/40 text-emerald-300 text-left transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <div>
                  <div className="font-semibold text-[11px]">Enterprise Checkout</div>
                  <div className="text-[10px] text-emerald-400/70 font-mono">/checkout · Success</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset('rage_click', '/pricing', 'free', 210)}
                className="p-2 rounded-lg bg-rose-950/30 border border-rose-800/50 hover:bg-rose-900/40 text-rose-300 text-left transition-colors flex items-center gap-2"
              >
                <Flame className="w-3.5 h-3.5 shrink-0" />
                <div>
                  <div className="font-semibold text-[11px]">Rage Click Anomaly</div>
                  <div className="text-[10px] text-rose-400/70 font-mono">/pricing · Friction</div>
                </div>
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-800/80 my-2" />

          {/* Event Type selector */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
              Telemetry Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="feature_used">feature_used (Action execution)</option>
              <option value="page_view">page_view (Route view)</option>
              <option value="button_click">button_click (Interactive tap)</option>
              <option value="checkout_started">checkout_started (Cart initiated)</option>
              <option value="checkout_completed">checkout_completed (Conversion)</option>
              <option value="signup_completed">signup_completed (User registration)</option>
              <option value="rage_click">rage_click (Frustration interaction)</option>
              <option value="search_performed">search_performed (Query filter)</option>
            </select>
          </div>

          {/* Route Path input */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
              Route Path
            </label>
            <input
              type="text"
              value={routePath}
              onChange={(e) => setRoutePath(e.target.value)}
              placeholder="/dashboard"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* User Tier & Dwell Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
                User Tier
              </label>
              <select
                value={userTier}
                onChange={(e) => setUserTier(e.target.value as UserTier)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 capitalize"
              >
                <option value="guest">Guest</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
                Dwell Time (Seconds): <span className="font-mono text-white">{dwellTime}s</span>
              </label>
              <input
                type="range"
                min="5"
                max="360"
                value={dwellTime}
                onChange={(e) => setDwellTime(Number(e.target.value))}
                className="w-full mt-2 accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Scroll Depth Slider */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
              Scroll Depth: <span className="font-mono text-white">{scrollDepth}%</span>
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={scrollDepth}
              onChange={(e) => setScrollDepth(Number(e.target.value))}
              className="w-full mt-1 accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Feedback message */}
          {feedbackMsg && (
            <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-800 text-indigo-300 font-mono text-[11px] flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Emit Event Telemetry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
