import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GoogleIcon } from './GoogleIcon';
import { isFirebaseConfigured } from '../lib/firebase';

interface TopNavbarProps {
  onOpenCreateTicket: () => void;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenCreateTicket,
  onOpenSettings,
  onToggleSidebar,
}) => {
  const {
    currentUser,
    signOutApp,
    workspaces,
    activeWorkspace,
    setActiveWorkspaceId,
    createWorkspace,
    workspaceNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    setSelectedTicketId,
    setActiveView,
    isGuestViewer,
    setIsGuestViewer,
    density,
    setDensity,
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [showNewWsInput, setShowNewWsInput] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const wsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = workspaceNotifications.filter((n) => !n.read).length;

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wsRef.current && !wsRef.current.contains(e.target as Node)) {
        setWorkspaceDropdownOpen(false);
        setShowNewWsInput(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateWsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorkspaceName.trim()) {
      createWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName('');
      setShowNewWsInput(false);
      setWorkspaceDropdownOpen(false);
    }
  };

  return (
    <header className="h-11 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 flex items-center justify-between z-30 sticky top-0 shadow-2xs transition-colors">
      {/* Left: Brand + Workspace Selector */}
      <div className="flex items-center gap-2.5">
        {/* Mobile sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 -ml-1 text-slate-600 hover:bg-slate-100 rounded md:hidden"
          title="Toggle Navigation"
        >
          <GoogleIcon name="menu" size={18} />
        </button>

        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveView('kanban')}>
          <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold shadow-2xs">
            <GoogleIcon name="view_kanban" size={14} />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight hidden sm:inline">
            FlowKanban
          </span>
        </div>

        <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 hidden sm:block" />

        {/* Workspace Dropdown */}
        <div className="relative" ref={wsRef}>
          <button
            id="workspace-selector-btn"
            onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors"
          >
            <GoogleIcon name="layers" size={14} className="text-slate-500" />
            <span className="max-w-[130px] truncate">{activeWorkspace?.name || 'Workspace'}</span>
            <GoogleIcon name="expand_more" size={12} className="text-slate-400" />
          </button>

          {workspaceDropdownOpen && (
            <div className="absolute left-0 mt-1 w-60 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Workspaces
              </div>
              <div className="max-h-48 overflow-y-auto py-0.5">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspaceId(ws.id);
                      setWorkspaceDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      ws.id === activeWorkspace?.id ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {ws.id === activeWorkspace?.id && <GoogleIcon name="task_alt" size={14} className="text-blue-600 shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 mt-1 pt-1 px-1.5">
                {!showNewWsInput ? (
                  <button
                    onClick={() => setShowNewWsInput(true)}
                    className="w-full text-left px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1.5"
                  >
                    <GoogleIcon name="add" size={14} />
                    Create New Workspace
                  </button>
                ) : (
                  <form onSubmit={handleCreateWsSubmit} className="space-y-1.5 p-1">
                    <input
                      type="text"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      placeholder="Workspace name..."
                      autoFocus
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowNewWsInput(false)}
                        className="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!newWorkspaceName.trim()}
                        className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Search input — filters the active board/list/my-tasks by title, key, or assignee */}
      <div className="flex-1 max-w-sm mx-4 hidden md:block">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500 text-slate-500 text-xs transition-colors">
          <GoogleIcon name="search" size={14} className="text-slate-400 shrink-0" />
          <input
            id="topbar-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets (e.g. AND-142), assignees..."
            className="flex-1 min-w-0 bg-transparent text-[11px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          {searchQuery ? (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-700 shrink-0">
              <GoogleIcon name="close" size={12} />
            </button>
          ) : (
            <kbd className="px-1 py-0.2 text-[9px] font-mono bg-white border border-slate-300 rounded text-slate-400 shadow-2xs shrink-0">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Right: Actions & User Menu */}
      <div className="flex items-center gap-2">
        {/* Mobile search toggle */}
        <button
          onClick={() => setMobileSearchOpen((v) => !v)}
          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded md:hidden"
          title="Search"
        >
          <GoogleIcon name="search" size={16} />
        </button>

        {mobileSearchOpen && (
          <div className="absolute top-11 left-0 right-0 p-2 bg-white border-b border-slate-200 shadow-sm md:hidden z-40">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-slate-200 bg-slate-50">
              <GoogleIcon name="search" size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets, assignees..."
                className="flex-1 min-w-0 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Create Ticket Button */}
        <button
          id="topbar-create-ticket-btn"
          onClick={onOpenCreateTicket}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors"
        >
          <GoogleIcon name="add" size={14} />
          <span>Create</span>
          <kbd className="hidden lg:inline-block ml-0.5 px-1 py-0.2 text-[9px] font-mono bg-blue-500/80 rounded">
            C
          </kbd>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-bell-btn"
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
            title="Notifications"
          >
            <GoogleIcon name="notifications" size={14} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-80 bg-white rounded-md shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-800">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-blue-50 text-blue-600 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {workspaceNotifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">No notifications yet</div>
                ) : (
                  workspaceNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.ticketId) {
                          setSelectedTicketId(n.ticketId);
                          setNotifDropdownOpen(false);
                        }
                      }}
                      className={`p-2.5 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                        !n.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <span className="font-semibold text-slate-800 text-[11px]">{n.title}</span>
                        <span className="text-[9px] text-slate-400 flex items-center gap-1 shrink-0">
                          <GoogleIcon name="schedule" size={10} />
                          Just now
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Density Quick Toggle */}
        <button
          id="navbar-density-toggle-btn"
          onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}
          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors flex items-center gap-1"
          title={`Density Mode: ${density}. Click to switch to ${density === 'compact' ? 'comfortable' : 'compact'}`}
        >
          {density === 'compact' ? (
            <GoogleIcon name="close_fullscreen" size={14} className="text-blue-600" />
          ) : (
            <GoogleIcon name="open_in_full" size={14} className="text-slate-500" />
          )}
          <span className="text-[10px] font-bold text-slate-600 capitalize hidden md:inline">
            {density}
          </span>
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          id="navbar-theme-toggle-btn"
          onClick={toggleTheme}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors flex items-center justify-center"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <GoogleIcon name="light_mode" size={14} className="text-amber-400 animate-in spin-in-180 duration-200" />
          ) : (
            <GoogleIcon name="dark_mode" size={14} className="text-slate-600 hover:text-slate-900" />
          )}
        </button>

        {/* Settings button */}
        <button
          id="navbar-settings-btn"
          onClick={onOpenSettings}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          title="Settings & Display"
        >
          <GoogleIcon name="settings" size={14} />
        </button>

        {/* User Account & Persona Switcher */}
        <div className="relative" ref={userRef}>
          <button
            id="user-profile-btn"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-slate-200 transition-all"
            title={`${currentUser.name} (${currentUser.email})`}
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full object-cover border border-slate-300"
            />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-68 bg-white rounded-md shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in duration-150">
              {/* Signed in user header */}
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div className="overflow-hidden">
                    <div className="font-semibold text-xs text-slate-900 truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{currentUser.email}</div>
                    <div className="mt-0.5 inline-flex items-center gap-1 px-1 py-0.2 rounded text-[9px] font-medium bg-blue-50 text-blue-700 capitalize">
                      <GoogleIcon name="shield" size={10} />
                      {currentUser.role}
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest / Public Link view toggle */}
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-700">Simulate View-Only Link</div>
                  <div className="text-[9px] text-slate-400">Test shared guest viewer access</div>
                </div>
                <input
                  type="checkbox"
                  checked={isGuestViewer}
                  onChange={(e) => setIsGuestViewer(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                />
              </div>

              {/* Settings link */}
              <div className="px-1.5 pt-1">
                <button
                  onClick={() => {
                    onOpenSettings();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded flex items-center gap-2"
                >
                  <GoogleIcon name="settings" size={14} className="text-slate-500" />
                  Workspace Settings & Integrations
                </button>
                {isFirebaseConfigured && (
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      signOutApp();
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded flex items-center gap-2"
                  >
                    <GoogleIcon name="logout" size={14} />
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
