import React, { useState } from 'react';
import { AnalyticsProvider, useAnalytics } from './services/analyticsStore';
import { Header } from './components/Header';
import { WorkspaceToolbar } from './components/WorkspaceToolbar';
import { MetricCards } from './components/MetricCards';
import { LiveChart } from './components/LiveChart';
import { RouteEngagementList } from './components/RouteEngagementList';
import { FunnelView } from './components/FunnelView';
import { GeoAndDeviceSplit } from './components/GeoAndDeviceSplit';
import { LiveEventStream } from './components/LiveEventStream';
import { ActiveSessionsView } from './components/ActiveSessionsView';
import { FrictionAlertsView } from './components/FrictionAlertsView';
import { EventInspectorModal } from './components/EventInspectorModal';
import { SessionJourneyModal } from './components/SessionJourneyModal';
import { SimulateEventModal } from './components/SimulateEventModal';
import { ExportModal } from './components/ExportModal';
import { SupabaseModal } from './components/SupabaseModal';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<'monitor' | 'stream' | 'sessions' | 'funnels' | 'alerts'>('monitor');
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const { alerts, supabaseStatus } = useAnalytics();
  const unresolvedAlertsCount = alerts.filter((a) => !a.resolved).length;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Bar adhering to the 3-Zone Contract */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        unresolvedAlertsCount={unresolvedAlertsCount}
        isSupabaseConfigured={supabaseStatus.isConfigured}
      />

      {/* Contextual Workspace Toolbar */}
      <WorkspaceToolbar
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto pb-12">
        {activeTab === 'monitor' && (
          <div className="space-y-2">
            {/* KPI Stat Cards */}
            <MetricCards />

            {/* Smooth Real-Time Curve */}
            <LiveChart />

            {/* 2-Column Split: Active Routes & Conversion Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 mb-6">
              <RouteEngagementList onSelectRoute={() => setActiveTab('stream')} />
              <FunnelView />
            </div>

            {/* Geographic & Device Distribution */}
            <GeoAndDeviceSplit />
          </div>
        )}

        {activeTab === 'stream' && <LiveEventStream />}

        {activeTab === 'sessions' && <ActiveSessionsView />}

        {activeTab === 'funnels' && (
          <div className="p-6 max-w-5xl mx-auto">
            <FunnelView />
          </div>
        )}

        {activeTab === 'alerts' && <FrictionAlertsView />}
      </main>

      {/* Clean quiet footer */}
      <footer className="border-t border-slate-800/60 py-5 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-[1440px] w-full mx-auto">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">PulseTrack</span>
          <span aria-hidden="true">·</span>
          <span>Real-time user engagement telemetry</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
          <span>UTC {new Date().toISOString().substring(11, 19)}</span>
          <span aria-hidden="true">·</span>
          <span>Sampling 100% telemetry</span>
        </div>
      </footer>

      {/* Interactive Modals */}
      <EventInspectorModal />
      <SessionJourneyModal />
      <SimulateEventModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AnalyticsProvider>
      <DashboardContent />
    </AnalyticsProvider>
  );
}
