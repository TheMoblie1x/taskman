import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkspaceRole } from '../types';
import { GoogleIcon } from './GoogleIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    activeWorkspace,
    workspaceMembers,
    calendarConnections,
    toggleCalendarConnection,
    currentUser,
    density,
    setDensity,
  } = useApp();

  const activeWorkspaceMembers = workspaceMembers.filter((m) => m.workspaceId === activeWorkspace?.id);

  const [activeTab, setActiveTab] = useState<'appearance' | 'calendar' | 'workspace' | 'storage'>('appearance');
  const [testSyncing, setTestSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  if (!isOpen) return null;

  const googleCal = calendarConnections.find((c) => c.provider === 'google');
  const msCal = calendarConnections.find((c) => c.provider === 'microsoft');

  const handleRunTestSync = () => {
    setTestSyncing(true);
    setTimeout(() => {
      setTestSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 1000);
  };

  const handleResetData = () => {
    if (confirm('Reset application to default initial seed data? Local changes will be reloaded.')) {
      localStorage.removeItem('kanban_collaborative_platform_v1');
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <GoogleIcon name="settings" size={16} />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Settings & Integrations</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <GoogleIcon name="close" size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 gap-5 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-3 font-semibold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'appearance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <GoogleIcon name="layers" size={14} />
            <span>Density & Display</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-3 font-semibold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <GoogleIcon name="calendar_today" size={14} />
            <span>Calendar Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`py-3 font-semibold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'workspace'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <GoogleIcon name="group" size={14} />
            <span>Workspace & Members</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`py-3 font-semibold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'storage'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <GoogleIcon name="storage" size={14} />
            <span>Data & Storage</span>
          </button>
        </div>

        <div className="p-6 text-xs space-y-6 max-h-[75vh] overflow-y-auto">
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Global Density Toggle</h4>
                <p className="text-slate-500 leading-relaxed text-xs">
                  Switch between Compact and Comfortable padding across all components to tailor the interface for high data density or relaxed spacing.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Compact Option */}
                <div
                  onClick={() => setDensity('compact')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    density === 'compact'
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${density === 'compact' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <GoogleIcon name="close_fullscreen" size={16} />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">Compact</span>
                          <span className="text-[10px] text-blue-600 font-semibold tracking-wide uppercase">High Density</span>
                        </div>
                      </div>
                      {density === 'compact' && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <GoogleIcon name="check" size={12} weight={700} />
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Dense information layout with tight 8px padding, compact cards, and maximum data visible on screen.
                    </p>

                    {/* Miniature Preview Mockup */}
                    <div className="bg-slate-100/90 rounded p-2 space-y-1 text-[10px] border border-slate-200">
                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                        <span>AND-102</span>
                        <span className="px-1 bg-red-100 text-red-700 rounded font-bold">HIGH</span>
                      </div>
                      <div className="font-semibold text-slate-800 text-[11px] truncate">Configure Bluetooth LE GATT</div>
                      <div className="flex gap-1">
                        <span className="px-1 py-0.2 bg-white rounded text-[8px] text-slate-600 border border-slate-200">BLE</span>
                        <span className="px-1 py-0.2 bg-white rounded text-[8px] text-slate-600 border border-slate-200">Core</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Padding: 8px compact</span>
                    <span className="font-semibold text-blue-600">{density === 'compact' ? 'Active' : 'Select'}</span>
                  </div>
                </div>

                {/* Comfortable Option */}
                <div
                  onClick={() => setDensity('comfortable')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    density === 'comfortable'
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${density === 'comfortable' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <GoogleIcon name="open_in_full" size={16} />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">Comfortable</span>
                          <span className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">Relaxed</span>
                        </div>
                      </div>
                      {density === 'comfortable' && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <GoogleIcon name="check" size={12} weight={700} />
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Spacious layout with generous 14px margins and padding. Relaxed reading experience with breathing room.
                    </p>

                    {/* Miniature Preview Mockup */}
                    <div className="bg-slate-100/90 rounded p-2.5 space-y-1.5 text-[10px] border border-slate-200">
                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                        <span>AND-102</span>
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-bold">HIGH</span>
                      </div>
                      <div className="font-semibold text-slate-800 text-xs truncate">Configure Bluetooth LE GATT</div>
                      <div className="flex gap-1 pt-0.5">
                        <span className="px-1.5 py-0.5 bg-white rounded text-[9px] text-slate-600 border border-slate-200">BLE</span>
                        <span className="px-1.5 py-0.5 bg-white rounded text-[9px] text-slate-600 border border-slate-200">Core</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Padding: 14px comfortable</span>
                    <span className="font-semibold text-blue-600">{density === 'comfortable' ? 'Active' : 'Select'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] flex items-center justify-between">
                <span>Current Mode: <strong className="text-slate-900 capitalize">{density}</strong></span>
                <span className="text-slate-400">Stored in preferences</span>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-blue-900 leading-relaxed">
                <span className="font-bold flex items-center gap-1 mb-1">
                  <GoogleIcon name="auto_awesome" size={14} className="text-blue-600" />
                  Calendar Integration Architecture (PRD Sec 25-28)
                </span>
                Sync ticket deadlines, schedule times, and reminders directly with your Google or Microsoft Outlook calendars with automatic event updates.
              </div>

              {/* Google Calendar */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <GoogleIcon name="calendar_today" size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Google Calendar</div>
                      <div className="text-[11px] text-slate-500">
                        {googleCal?.connected
                          ? `Connected as ${googleCal.accountEmail} (${googleCal.calendarName})`
                          : 'Not connected'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleCalendarConnection('google')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      googleCal?.connected
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {googleCal?.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>

                {googleCal?.connected && (
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Default Target Calendar:</span>
                      <select className="border border-slate-200 rounded px-2 py-0.5 text-xs bg-slate-50">
                        <option>Work Calendar (Primary)</option>
                        <option>Development Sprint</option>
                        <option>Reminders</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Two-Way Auto Sync:</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <GoogleIcon name="check" size={12} /> Enabled
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Microsoft Calendar */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                      <GoogleIcon name="calendar_today" size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Microsoft Outlook Calendar</div>
                      <div className="text-[11px] text-slate-500">
                        {msCal?.connected
                          ? `Connected as ${msCal.accountEmail} (${msCal.calendarName})`
                          : 'Not connected'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleCalendarConnection('microsoft')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      msCal?.connected
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {msCal?.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>

              {/* Run Test Sync */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={handleRunTestSync}
                  disabled={testSyncing}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-2 transition-colors"
                >
                  <GoogleIcon name="refresh" size={14} className={`${testSyncing ? 'animate-spin' : ''}`} />
                  <span>{testSyncing ? 'Syncing...' : 'Test Sync All Events'}</span>
                </button>
                {syncSuccess && (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <GoogleIcon name="check" size={14} /> Synced 12 events successfully
                  </span>
                )}
              </div>
            </div>
          )}

          {activeTab === 'workspace' && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  readOnly
                  value={activeWorkspace?.name}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-semibold"
                />
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Workspace Members ({activeWorkspaceMembers.length})
                </div>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {activeWorkspaceMembers.map((m) => (
                    <div key={m.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={m.user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{m.user.name}</span>
                            {m.user.id === currentUser.id && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded font-semibold">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{m.user.email}</div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium capitalize">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 leading-relaxed">
                All changes, tickets, projects, columns, and activities are saved locally in your browser storage with optimistic UI updates.
              </div>

              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
                <div className="font-bold text-rose-800">Reset Local State</div>
                <p className="text-[11px] text-rose-700">
                  Restore original mock projects, tickets, and user accounts.
                </p>
                <button
                  onClick={handleResetData}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
                >
                  Reset to Seed Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
