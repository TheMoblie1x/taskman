import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DensityMode, KanbanCardSettings, PresetThemeName, SupportedFontFamily, SupportedFontSize, ThemeMode } from '../types';
import { GoogleIcon } from './GoogleIcon';
import { PRESET_THEMES, HIGH_CONTRAST_COLORS, SUPPORTED_FONT_FAMILIES, SUPPORTED_FONT_SIZES } from '../utils/themeTokens';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEME_MODE_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'system', label: 'System', icon: 'devices' },
  { value: 'light', label: 'Light', icon: 'light_mode' },
  { value: 'dark', label: 'Dark', icon: 'dark_mode' },
  { value: 'high_contrast', label: 'High Contrast', icon: 'contrast' },
];

const CUSTOM_COLOR_FIELDS: { key: keyof import('../types').CustomColors; label: string }[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'accent', label: 'Accent' },
  { key: 'background', label: 'Background' },
  { key: 'sidebar', label: 'Sidebar' },
  { key: 'card', label: 'Card' },
  { key: 'text', label: 'Text' },
];

type KanbanToggleKey = 'showTicketId' | 'showAssignee' | 'showPriority' | 'showLabels' | 'showDueDate' | 'showTicketType' | 'showSubtasksCount';

const KANBAN_TOGGLE_FIELDS: { key: KanbanToggleKey; label: string }[] = [
  { key: 'showTicketId', label: 'Ticket ID' },
  { key: 'showAssignee', label: 'Assignee' },
  { key: 'showPriority', label: 'Priority' },
  { key: 'showLabels', label: 'Labels' },
  { key: 'showDueDate', label: 'Due date' },
  { key: 'showTicketType', label: 'Ticket type' },
  { key: 'showSubtasksCount', label: 'Subtasks count' },
];

type TabId = 'appearance' | 'calendar' | 'notifications' | 'workspace' | 'account' | 'about' | 'storage';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'appearance', label: 'Appearance', icon: 'palette' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar_today' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'workspace', label: 'Workspace', icon: 'group' },
  { id: 'account', label: 'Account', icon: 'person' },
  { id: 'about', label: 'About', icon: 'info' },
  { id: 'storage', label: 'Data & Storage', icon: 'storage' },
];

type NotificationToggleKey = 'ticketAssigned' | 'mentionedInComment' | 'statusChanged' | 'dueDateApproaching' | 'overdueTicket' | 'boardInvitation' | 'calendarChanges';

const NOTIFICATION_TOGGLE_FIELDS: { key: NotificationToggleKey; label: string }[] = [
  { key: 'ticketAssigned', label: 'Ticket assigned to me' },
  { key: 'mentionedInComment', label: 'Mentioned in comment' },
  { key: 'statusChanged', label: 'Ticket status changed' },
  { key: 'dueDateApproaching', label: 'Due date approaching' },
  { key: 'overdueTicket', label: 'Overdue ticket' },
  { key: 'boardInvitation', label: 'Board invitation' },
  { key: 'calendarChanges', label: 'Calendar changes' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    activeWorkspace,
    workspaceMembers,
    calendarConnections,
    toggleCalendarConnection,
    currentUser,
    density,
    setDensity,
    theme,
    setTheme,
    presetTheme,
    setPresetTheme,
    customColors,
    setCustomColors,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    kanbanCardSettings,
    setKanbanCardSettings,
    customThemeProfiles,
    saveCustomTheme,
    applyCustomTheme,
    deleteCustomTheme,
    resetAppearance,
    notificationSettings,
    setNotificationSettings,
    calendarSettings,
    setCalendarSettings,
    signOutApp,
  } = useApp();

  const activeWorkspaceMembers = workspaceMembers.filter((m) => m.workspaceId === activeWorkspace?.id);

  const baseColors = theme === 'high_contrast'
    ? HIGH_CONTRAST_COLORS
    : PRESET_THEMES[presetTheme]?.colors || PRESET_THEMES.default.colors;
  const effectiveColors = { ...baseColors, ...customColors };

  const [activeTab, setActiveTab] = useState<TabId>('appearance');
  const [testSyncing, setTestSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');

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
    if (confirm("Reset this device's appearance, notification, and calendar preferences to their defaults? Shared workspace data is not affected.")) {
      localStorage.removeItem('kanban_collaborative_platform_v1');
      window.location.reload();
    }
  };

  const handleSignOut = () => {
    if (confirm('Sign out of your account?')) {
      onClose();
      signOutApp();
    }
  };

  const handleDeleteAccount = () => {
    alert('Account deletion requires a connected backend and is not available in this local demo.');
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
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 font-semibold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <GoogleIcon name={tab.icon} size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 text-xs space-y-6 max-h-[75vh] overflow-y-auto">
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              {/* Theme Mode */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Theme</h4>
                <div className="grid grid-cols-4 gap-2">
                  {THEME_MODE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className={`p-2 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                        theme === opt.value
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <GoogleIcon name={opt.icon} size={16} />
                      <span className="text-[10px] font-semibold">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preset Themes */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Preset Themes</h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(Object.keys(PRESET_THEMES) as PresetThemeName[]).map((key) => {
                    const preset = PRESET_THEMES[key];
                    const isActive = presetTheme === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setPresetTheme(key);
                          setCustomColors({});
                        }}
                        title={preset.name}
                        className={`p-1.5 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                          isActive ? 'border-blue-600 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className="w-full h-6 rounded flex items-center justify-center gap-0.5"
                          style={{ backgroundColor: preset.colors.background, border: `1px solid ${preset.colors.border}` }}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.colors.primary }} />
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.colors.accent }} />
                        </span>
                        <span className="text-[9px] font-semibold text-slate-600 truncate w-full text-center">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Colors */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-0.5">Custom Colors</h4>
                <p className="text-[10px] text-slate-400 mb-2">Overrides the selected preset. Applies globally.</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {CUSTOM_COLOR_FIELDS.map((field) => (
                    <label key={field.key} className="flex items-center gap-1.5 p-1.5 rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300">
                      <input
                        type="color"
                        value={effectiveColors[field.key]}
                        onChange={(e) => setCustomColors({ [field.key]: e.target.value })}
                        className="w-6 h-6 rounded border border-slate-200 shrink-0 cursor-pointer bg-transparent"
                      />
                      <span className="text-[10px] font-semibold text-slate-600 truncate">{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Typography */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Typography & Density</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Font</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value as SupportedFontFamily)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium"
                    >
                      {SUPPORTED_FONT_FAMILIES.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Size</label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value as SupportedFontSize)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium"
                    >
                      {SUPPORTED_FONT_SIZES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 mt-2.5">Density</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['compact', 'comfortable', 'spacious'] as DensityMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setDensity(mode)}
                      className={`py-1.5 rounded-lg border-2 text-[11px] font-semibold capitalize transition-all ${
                        density === mode
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kanban Card Display */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Kanban Card</h4>
                <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                  {KANBAN_TOGGLE_FIELDS.map((field) => (
                    <label key={field.key} className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={kanbanCardSettings[field.key]}
                        onChange={(e) => setKanbanCardSettings({ [field.key]: e.target.checked })}
                        className="rounded border-slate-300"
                      />
                      {field.label}
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Card Radius</label>
                    <select
                      value={kanbanCardSettings.cardRadius}
                      onChange={(e) => setKanbanCardSettings({ cardRadius: e.target.value as KanbanCardSettings['cardRadius'] })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium capitalize"
                    >
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Column Width</label>
                    <select
                      value={kanbanCardSettings.columnWidth}
                      onChange={(e) => setKanbanCardSettings({ columnWidth: e.target.value as KanbanCardSettings['columnWidth'] })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-medium capitalize"
                    >
                      <option value="narrow">Narrow</option>
                      <option value="normal">Normal</option>
                      <option value="wide">Wide</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* My Themes */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">My Themes</h4>
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    value={newThemeName}
                    onChange={(e) => setNewThemeName(e.target.value)}
                    placeholder="Name this theme..."
                    className="flex-1 border border-slate-200 rounded-lg p-1.5 text-xs"
                  />
                  <button
                    onClick={() => {
                      if (!newThemeName.trim()) return;
                      saveCustomTheme(newThemeName.trim());
                      setNewThemeName('');
                    }}
                    disabled={!newThemeName.trim()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-1 shrink-0"
                  >
                    <GoogleIcon name="add" size={12} />
                    Save Current
                  </button>
                </div>
                {customThemeProfiles.length > 0 && (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {customThemeProfiles.map((t) => (
                      <div key={t.id} className="p-2 flex items-center justify-between gap-2">
                        <button
                          onClick={() => applyCustomTheme(t.id)}
                          className="flex items-center gap-2 min-w-0 flex-1 text-left"
                        >
                          <span className="w-4 h-4 rounded-full shrink-0 border border-slate-200" style={{ backgroundColor: t.colors.primary }} />
                          <span className="font-semibold text-slate-700 truncate">{t.name}</span>
                        </button>
                        <button
                          onClick={() => deleteCustomTheme(t.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded shrink-0"
                          title={`Delete "${t.name}"`}
                        >
                          <GoogleIcon name="delete" size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-1 flex items-center justify-between">
                <p className="text-[10px] text-slate-400">Appearance settings are saved automatically.</p>
                <button
                  onClick={resetAppearance}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <GoogleIcon name="refresh" size={12} />
                  Reset to Default
                </button>
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

              {/* Sync Preferences */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <h4 className="text-sm font-bold text-slate-800">Sync Preferences</h4>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Default calendar</span>
                  <select
                    value={calendarSettings.defaultProvider}
                    onChange={(e) => setCalendarSettings({ defaultProvider: e.target.value as 'google' | 'microsoft' })}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-medium"
                  >
                    <option value="google">Google Calendar</option>
                    <option value="microsoft">Microsoft Outlook</option>
                  </select>
                </div>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-600">Automatically create calendar events</span>
                  <input
                    type="checkbox"
                    checked={calendarSettings.autoCreateEvents}
                    onChange={(e) => setCalendarSettings({ autoCreateEvents: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-600">Sync ticket changes to calendar</span>
                  <input
                    type="checkbox"
                    checked={calendarSettings.autoSyncChanges}
                    onChange={(e) => setCalendarSettings({ autoSyncChanges: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                </label>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Default event duration</span>
                  <select
                    value={calendarSettings.defaultDurationMinutes}
                    onChange={(e) => setCalendarSettings({ defaultDurationMinutes: Number(e.target.value) })}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-medium"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-600">Remove calendar event when ticket is deleted</span>
                  <input
                    type="checkbox"
                    checked={calendarSettings.removeOnTicketDelete}
                    onChange={(e) => setCalendarSettings({ removeOnTicketDelete: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Notify me when...</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {NOTIFICATION_TOGGLE_FIELDS.map((field) => (
                    <label key={field.key} className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/60">
                      <span className="text-slate-600">{field.label}</span>
                      <input
                        type="checkbox"
                        checked={notificationSettings[field.key]}
                        onChange={(e) => setNotificationSettings({ [field.key]: e.target.checked })}
                        className="rounded border-slate-300"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Delivery channels</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <label className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/60">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <GoogleIcon name="notifications" size={13} className="text-slate-400" />
                      In-app notifications
                    </span>
                    <input
                      type="checkbox"
                      checked={notificationSettings.inAppNotifications}
                      onChange={(e) => setNotificationSettings({ inAppNotifications: e.target.checked })}
                      className="rounded border-slate-300"
                    />
                  </label>
                  <label className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/60">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <GoogleIcon name="mail" size={13} className="text-slate-400" />
                      Email notifications
                    </span>
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({ emailNotifications: e.target.checked })}
                      className="rounded border-slate-300"
                    />
                  </label>
                </div>
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

          {activeTab === 'account' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white">
                <img src={currentUser.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                <div>
                  <div className="font-bold text-slate-800">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Google Account</h4>
                <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GoogleIcon name="account_circle" size={18} className="text-slate-400" />
                    <div>
                      <div className="font-semibold text-slate-700">{currentUser.email}</div>
                      <div className="text-[10px] text-slate-400">Google ID: {currentUser.googleId}</div>
                    </div>
                  </div>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <GoogleIcon name="check_circle" size={13} /> Connected
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Connected Calendars</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {calendarConnections.map((c) => (
                    <div key={c.id} className="p-2.5 flex items-center justify-between">
                      <span className="text-slate-600 capitalize flex items-center gap-1.5">
                        <GoogleIcon name="calendar_today" size={13} className="text-slate-400" />
                        {c.provider === 'google' ? 'Google Calendar' : 'Microsoft Outlook'}
                      </span>
                      <span className={c.connected ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
                        {c.connected ? 'Connected' : 'Not connected'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center justify-center gap-1.5"
                >
                  <GoogleIcon name="logout" size={14} />
                  Sign Out
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-lg flex items-center justify-center gap-1.5"
                >
                  <GoogleIcon name="delete_forever" size={14} />
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div>
                  <div className="font-bold text-slate-800 text-sm">FlowKanban</div>
                  <div className="text-[11px] text-slate-400">Version 1.0.0</div>
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-y-2 text-[11px]">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Licensed To</span>
                  <span className="text-slate-700 font-medium text-right">{currentUser.name}</span>

                  <span className="text-slate-400 font-semibold uppercase tracking-wider">License</span>
                  <span className="text-slate-700 font-medium text-right">Professional</span>

                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Status</span>
                  <span className="text-emerald-600 font-semibold text-right flex items-center justify-end gap-1">
                    <GoogleIcon name="check_circle" size={12} /> Active
                  </span>

                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Valid Until</span>
                  <span className="text-slate-700 font-medium text-right">September 4, 2027</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                © 2026 FlowKanban. All rights reserved.
                <br />
                License fields shown here are placeholders pending a connected licensing service.
              </p>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 leading-relaxed">
                Workspaces, projects, tickets, and goals are stored in Firestore and sync in real
                time across every device and collaborator. Appearance, notification, and calendar
                preferences are this device's own settings.
              </div>

              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
                <div className="font-bold text-rose-800">Reset This Device's Preferences</div>
                <p className="text-[11px] text-rose-700">
                  Restores appearance, notification, and calendar settings to their defaults on
                  this device only. Shared workspace data (projects, tickets, goals) is not affected.
                </p>
                <button
                  onClick={handleResetData}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
                >
                  Reset This Device
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
