import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopNavbar } from './components/TopNavbar';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { CalendarView } from './components/CalendarView';
import { MyTasksView } from './components/MyTasksView';
import { TicketDrawer } from './components/TicketDrawer';
import { CreateTicketModal } from './components/CreateTicketModal';
import { CreateProjectModal } from './components/CreateProjectModal';
import { ShareModal } from './components/ShareModal';
import { SettingsModal } from './components/SettingsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { GoalsView } from './components/GoalsView';
import { CreateGoalModal } from './components/CreateGoalModal';
import { GoalDetailModal } from './components/GoalDetailModal';

const AppContent: React.FC = () => {
  const { activeView, setActiveView, selectedTicketId } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [createTicketStatus, setCreateTicketStatus] = useState('TO_DO');
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if inside input, textarea or select
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      if (!isInput) {
        if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          setCreateTicketStatus('TO_DO');
          setCreateTicketOpen(true);
        } else if (e.key === '/') {
          e.preventDefault();
          const searchInput = document.getElementById('topbar-search-input');
          searchInput?.focus();
        } else if (e.key === '?') {
          e.preventDefault();
          setShortcutsOpen(true);
        } else if (e.key === '1') {
          setActiveView('kanban');
        } else if (e.key === '2') {
          setActiveView('list');
        } else if (e.key === '3') {
          setActiveView('calendar');
        } else if (e.key === '4') {
          setActiveView('my-tasks');
        } else if (e.key === '5') {
          setActiveView('goals');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [setActiveView]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <TopNavbar
        onOpenCreateTicket={() => {
          setCreateTicketStatus('TO_DO');
          setCreateTicketOpen(true);
        }}
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((prev) => !prev)}
          onOpenNewProject={() => setCreateProjectOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
          onOpenShareModal={() => setShareModalOpen(true)}
        />

        {/* View Switcher Output */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeView === 'kanban' && (
            <KanbanBoard
              onOpenCreateTicket={(status) => {
                setCreateTicketStatus(status || 'TO_DO');
                setCreateTicketOpen(true);
              }}
              onOpenShareModal={() => setShareModalOpen(true)}
            />
          )}

          {activeView === 'list' && <ListView />}

          {activeView === 'calendar' && (
            <CalendarView
              onOpenCreateTicket={() => {
                setCreateTicketStatus('TO_DO');
                setCreateTicketOpen(true);
              }}
            />
          )}

          {activeView === 'my-tasks' && <MyTasksView />}

          {activeView === 'goals' && (
            <GoalsView
              onOpenCreateGoal={() => setCreateGoalOpen(true)}
              onOpenGoal={(goalId) => setSelectedGoalId(goalId)}
            />
          )}
        </main>
      </div>

      {/* Ticket Details Drawer */}
      {selectedTicketId && <TicketDrawer />}

      <CreateGoalModal
        isOpen={createGoalOpen}
        onClose={() => setCreateGoalOpen(false)}
        onCreated={(goalId) => {
          setCreateGoalOpen(false);
          setSelectedGoalId(goalId);
        }}
      />

      {selectedGoalId && <GoalDetailModal goalId={selectedGoalId} onClose={() => setSelectedGoalId(null)} />}

      {/* Modals */}
      <CreateTicketModal
        isOpen={createTicketOpen}
        onClose={() => setCreateTicketOpen(false)}
        defaultStatus={createTicketStatus}
      />

      <CreateProjectModal
        isOpen={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
