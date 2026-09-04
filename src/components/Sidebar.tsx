import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PoweredByMobile1x } from './PoweredByMobile1x';
import { GoogleIcon } from './GoogleIcon';

interface SidebarProps {
  onOpenNewProject: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  onOpenShareModal: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenNewProject,
  onOpenSettings,
  onOpenShortcuts,
  onOpenShareModal,
  isOpen,
  onToggle,
}) => {
  const {
    workspaceProjects,
    activeProject,
    setActiveProjectId,
    activeView,
    setActiveView,
    workspaceTickets,
    currentUser,
    workspaceNotifications,
    calendarConnections,
    isGuestViewer,
  } = useApp();

  const unreadNotifs = workspaceNotifications.filter((n) => !n.read).length;

  // Tickets assigned to current user, scoped to the active workspace
  const myTasksCount = workspaceTickets.filter(
    (t) => t.assigneeId === currentUser.id && t.status !== 'DONE'
  ).length;

  const googleCal = calendarConnections.find((c) => c.provider === 'google');
  const msCal = calendarConnections.find((c) => c.provider === 'microsoft');

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-20 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`sidebar fixed md:static inset-y-0 left-0 z-20 w-56 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } top-11 h-[calc(100vh-2.75rem)]`}
      >
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          {/* View-only banner if guest */}
          {isGuestViewer && (
            <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center justify-between">
              <div>
                <span className="font-semibold block">View-Only Mode</span>
                <span className="text-[10px] text-amber-700">Previewing as Guest</span>
              </div>
              <span className="px-1.5 py-0.2 text-[9px] bg-amber-200 text-amber-900 rounded font-medium">
                Link View
              </span>
            </div>
          )}

          {/* Section: My Work */}
          <div>
            <div className="px-2 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              My Work
            </div>
            <nav className="space-y-0.5">
              <button
                id="sidebar-my-tasks-btn"
                onClick={() => {
                  setActiveView('my-tasks');
                  if (window.innerWidth < 768) onToggle();
                }}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs font-semibold transition-colors ${
                  activeView === 'my-tasks'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GoogleIcon name="task_alt" size={14} className={`${activeView === 'my-tasks' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>My Tasks</span>
                </div>
                {myTasksCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] rounded-full font-bold bg-blue-100 text-blue-700">
                    {myTasksCount}
                  </span>
                )}
              </button>

              <button
                id="sidebar-calendar-view-btn"
                onClick={() => {
                  setActiveView('calendar');
                  if (window.innerWidth < 768) onToggle();
                }}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs font-semibold transition-colors ${
                  activeView === 'calendar'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GoogleIcon name="calendar_today" size={14} className={`${activeView === 'calendar' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>Calendar</span>
                </div>
              </button>

              <button
                id="sidebar-board-view-btn"
                onClick={() => {
                  setActiveView('kanban');
                  if (window.innerWidth < 768) onToggle();
                }}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs font-semibold transition-colors ${
                  activeView === 'kanban' || activeView === 'list'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GoogleIcon name="view_kanban" size={14} className={`${activeView === 'kanban' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>Kanban & List</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Section: Projects */}
          <div>
            <div className="px-2 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projects</span>
              <button
                id="sidebar-add-project-btn"
                onClick={onOpenNewProject}
                className="p-0.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Create Project"
              >
                <GoogleIcon name="add" size={12} />
              </button>
            </div>
            <div className="space-y-0.5">
              {workspaceProjects.map((proj) => {
                const isActive = activeProject?.id === proj.id;
                return (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setActiveProjectId(proj.id);
                      if (activeView === 'my-tasks' || activeView === 'settings') {
                        setActiveView('kanban');
                      }
                      if (window.innerWidth < 768) onToggle();
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                      isActive && (activeView === 'kanban' || activeView === 'list')
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: proj.color || '#3b82f6' }}
                      >
                        {proj.key.substring(0, 2)}
                      </span>
                      <span className="truncate">{proj.name}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">{proj.key}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Shared With Me & Collaboration */}
          <div>
            <div className="px-2 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Collaboration
              </span>
            </div>
            <div className="space-y-0.5">
              <button
                id="sidebar-share-board-btn"
                onClick={onOpenShareModal}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <GoogleIcon name="share" size={14} className="text-slate-400" />
                  <span>Share Board & Links</span>
                </div>
                <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                  Live
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom footer: Calendar Sync Status, Settings, and Powered By Mobile1x */}
        <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 space-y-1.5">
          {/* Calendar Sync Quick Status */}
          <div className="p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px]">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-200 font-semibold mb-0.5">
              <span className="flex items-center gap-1">
                <GoogleIcon name="calendar_today" size={12} className="text-blue-600 dark:text-blue-400" />
                Calendar Sync
              </span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Google Calendar</span>
              <span className="font-mono text-slate-600 dark:text-slate-300">{googleCal?.connected ? 'Synced' : 'Ready'}</span>
            </div>
          </div>

          {/* Shortcuts & Settings */}
          <div className="flex items-center justify-between pt-0.5">
            <button
              onClick={onOpenShortcuts}
              className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Keyboard Shortcuts"
            >
              <GoogleIcon name="help" size={12} />
              <span>Shortcuts</span>
              <kbd className="px-1 text-[9px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-mono">?</kbd>
            </button>

            <button
              id="sidebar-settings-btn"
              onClick={onOpenSettings}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              title="Settings & Display"
            >
              <GoogleIcon name="settings" size={14} />
            </button>
          </div>

          {/* Powered by mobile1x badge */}
          <div className="pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
            <PoweredByMobile1x variant="compact" />
          </div>
        </div>
      </aside>
    </>
  );
};
