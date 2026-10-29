import React, { useState } from 'react';
import { useAnalytics } from '../services/analyticsStore';
import { X, Database, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, RefreshCw, Key, ShieldCheck } from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const { supabaseStatus, testConnection } = useAnalytics();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; tableReady?: boolean } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testConnection();
    setTestResult(result);
    setTesting(false);
  };

  const handleCopySql = () => {
    const sqlContent = `-- PulseTrack Real-Time Analytics - Supabase PostgreSQL Schema
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id TEXT PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  type TEXT NOT NULL,
  path TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_tier TEXT NOT NULL DEFAULT 'guest',
  country TEXT,
  country_code TEXT,
  city TEXT,
  device TEXT NOT NULL DEFAULT 'desktop',
  browser TEXT,
  dwell_time_seconds INTEGER DEFAULT 0,
  scroll_depth_pct INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_timestamp ON public.analytics_events (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_path ON public.analytics_events (path);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert on analytics_events" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on analytics_events" ON public.analytics_events FOR SELECT USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_events;`;

    navigator.clipboard.writeText(sqlContent);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyEnvTemplate = () => {
    const envSnippet = `VITE_SUPABASE_URL="https://your-project.supabase.co"\nVITE_SUPABASE_ANON_KEY="your-anon-public-key"\nSUPABASE_SERVICE_ROLE_KEY="your-service-role-key"`;
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Supabase Integration Status
              </h3>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>PostgreSQL Realtime Telemetry</span>
                <span aria-hidden="true">·</span>
                <span className={supabaseStatus.isConfigured ? 'text-emerald-400 font-mono font-medium' : 'text-amber-400 font-mono'}>
                  {supabaseStatus.isConfigured ? 'Connected & Active' : 'Waiting for Credentials'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              supabaseStatus.isConfigured
                ? 'bg-emerald-950/20 border-emerald-800/60'
                : 'bg-slate-900/70 border-slate-800'
            }`}
          >
            <div className="mt-0.5">
              {supabaseStatus.isConfigured ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Database className="w-5 h-5 text-indigo-400 shrink-0" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-semibold text-white">
                {supabaseStatus.isConfigured
                  ? 'Supabase Client Connected'
                  : 'Ready to Connect Your Supabase Project'}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {supabaseStatus.isConfigured
                  ? `Telemetry events are synchronized in real-time with your PostgreSQL instance at ${supabaseStatus.url}.`
                  : 'Provide your Project URL, anon public key, and service_role key to persist engagement events and enable multi-user WebSocket streaming.'}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1.5 font-medium"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-indigo-400' : ''}`} />
                  <span>{testing ? 'Testing Connection...' : 'Test Supabase Connectivity'}</span>
                </button>

                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedSql ? 'Schema Copied!' : 'Copy SQL Schema Script'}</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`mt-3 p-2.5 rounded-lg border font-mono text-[11px] flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Parameters Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              <span>Required Credentials Parameter Map</span>
            </h4>

            <div className="space-y-2">
              {/* VITE_SUPABASE_URL */}
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-mono text-white text-[11px]">VITE_SUPABASE_URL</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Your Supabase Project URL (e.g., https://xyzcompany.supabase.co)
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      supabaseStatus.url && !supabaseStatus.url.includes('your-project') && supabaseStatus.url.startsWith('http')
                        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {supabaseStatus.url && !supabaseStatus.url.includes('your-project') && supabaseStatus.url.startsWith('http')
                      ? 'Detected'
                      : 'Awaiting URL'}
                  </span>
                </div>
              </div>

              {/* VITE_SUPABASE_ANON_KEY */}
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-mono text-white text-[11px]">VITE_SUPABASE_ANON_KEY</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Public client key for queries and Realtime WebSocket subscriptions
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      supabaseStatus.hasAnonKey
                        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {supabaseStatus.hasAnonKey ? 'Detected' : 'Awaiting Anon Key'}
                  </span>
                </div>
              </div>

              {/* SUPABASE_SERVICE_ROLE_KEY */}
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-mono text-white text-[11px]">SUPABASE_SERVICE_ROLE_KEY</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Secret administrative key for backend high-velocity telemetry ingestion
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-slate-800 border-slate-700 text-slate-300">
                    Server-Side Only
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <h4 className="text-xs font-semibold text-white">
              How to Connect:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 text-xs">
              <li>
                <span className="font-medium text-white">Create Database Tables:</span> Open your Supabase Dashboard, go to{' '}
                <span className="font-mono text-indigo-300">SQL Editor</span>, click &quot;New query&quot;, paste the{' '}
                <span className="font-mono text-indigo-300">supabase-schema.sql</span> script (or click &quot;Copy SQL Schema Script&quot; above), and click <span className="font-medium text-white">Run</span>.
              </li>
              <li>
                <span className="font-medium text-white">Retrieve API Keys:</span> In your Supabase Dashboard, go to{' '}
                <span className="font-medium text-white">Project Settings &gt; API</span>. Copy your <span className="font-mono text-indigo-300">Project URL</span>,{' '}
                <span className="font-mono text-indigo-300">anon public key</span>, and{' '}
                <span className="font-mono text-indigo-300">service_role secret key</span>.
              </li>
              <li>
                <span className="font-medium text-white">Configure Environment:</span> Set these in your environment / Secrets panel:
                <div className="mt-1 flex items-center justify-between p-2 rounded bg-slate-950 font-mono text-[11px] text-slate-400 border border-slate-800">
                  <span>VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY</span>
                  <button
                    onClick={handleCopyEnvTemplate}
                    className="text-indigo-400 hover:text-indigo-300 font-sans text-xs flex items-center gap-1"
                  >
                    {copiedEnv ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEnv ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </li>
              <li>
                PulseTrack will automatically detect the connection, synchronize telemetry events to PostgreSQL, and subscribe to live changes via WebSockets!
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800/80 bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
