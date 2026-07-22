import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { CollapsibleSidebar } from './CollapsibleSidebar';
import { TopHeader } from './TopHeader';
import { SystemStatusFooter } from './SystemStatusFooter';
import { HackathonDemoBar } from '../experience/HackathonDemoBar';
import { MissionReplayBar } from '../experience/MissionReplayBar';
import { AiThinkingModeModal } from '../experience/AiThinkingModeModal';
import { AiCopilotDrawer } from '../experience/AiCopilotDrawer';

export const AppLayout: React.FC = () => {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isThinkingModalOpen, setIsThinkingModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-navy-900 overflow-hidden select-none">
      {/* Collapsible Left Navigation Sidebar */}
      <CollapsibleSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Hackathon Demo Showcase Banner */}
        <HackathonDemoBar
          onStartThinkingModal={() => setIsThinkingModalOpen(true)}
          onNavigateToCompoundRisk={() => navigate('/compound-risk')}
        />

        {/* Top Header Navigation */}
        <TopHeader
          onOpenCopilot={() => setIsCopilotOpen(true)}
          onOpenThinkingModal={() => setIsThinkingModalOpen(true)}
        />

        {/* Dynamic Page Outlet with Mission Replay Timeline Bar */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950/60 space-y-6">
          <Outlet />

          {/* Persistent Mission Control Timeline Replay Bar */}
          <MissionReplayBar />
        </main>

        {/* Real-time System Status Footer */}
        <SystemStatusFooter />
      </div>

      {/* Slide-Over AI Copilot Assistant Drawer */}
      <AiCopilotDrawer isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />

      {/* Step-by-Step AI Thinking Mode Modal */}
      <AiThinkingModeModal
        isOpen={isThinkingModalOpen}
        onClose={() => setIsThinkingModalOpen(false)}
        onComplete={() => navigate('/compound-risk')}
      />
    </div>
  );
};
