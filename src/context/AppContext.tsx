import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  Workspace,
  WorkspaceMember,
  Project,
  Board,
  BoardColumn,
  Ticket,
  TicketType,
  TicketPriority,
  WorkspaceRole,
  SharePermission,
  ShareLink,
  CalendarConnection,
  AppNotification,
  ActiveView,
  Comment,
  Subtask,
  ChecklistItem,
  Attachment,
  Activity,
  CalendarEventMapping,
  DensityMode,
  ThemeMode,
  PresetThemeName,
  CustomColors,
  SupportedFontFamily,
  SupportedFontSize,
  KanbanCardSettings,
  CustomThemeProfile,
  NotificationSettings,
  CalendarSettings,
  Goal,
  GoalMilestone,
  GoalCheckIn,
  GoalMeasurementType,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_WORKSPACES,
  INITIAL_PROJECTS,
  INITIAL_BOARDS,
  INITIAL_TICKETS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CALENDAR_CONNECTIONS,
  INITIAL_SHARE_LINKS,
  INITIAL_KANBAN_SETTINGS,
  INITIAL_NOTIFICATION_SETTINGS,
  INITIAL_CALENDAR_SETTINGS,
  INITIAL_GOALS,
} from '../data/seedData';
import { applyThemeTokensToDOM, PRESET_THEMES } from '../utils/themeTokens';
import { calculateGoalHealth, calculateGoalProgress, isGoalProgressDerived } from '../utils/goalUtils';

interface FilterState {
  assigneeId?: string | null;
  priority?: TicketPriority | null;
  type?: TicketType | null;
  status?: string | null;
  label?: string | null;
}

interface AppContextType {
  // Auth & Persona
  currentUser: User;
  allUsers: User[];
  setCurrentUser: (user: User) => void;
  isGuestViewer: boolean;
  setIsGuestViewer: (val: boolean) => void;

  // Workspaces
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  setActiveWorkspaceId: (id: string) => void;
  createWorkspace: (name: string, description?: string) => void;
  workspaceMembers: WorkspaceMember[];
  inviteMember: (email: string, role: WorkspaceRole) => void;
  updateMemberRole: (userId: string, role: WorkspaceRole) => void;

  // Projects
  projects: Project[];
  workspaceProjects: Project[];
  activeProject: Project | null;
  setActiveProjectId: (id: string) => void;
  createProject: (data: { name: string; key: string; description: string; color: string; icon: string }) => Project;

  // Boards
  boards: Board[];
  workspaceBoards: Board[];
  activeBoard: Board | null;
  addColumn: (name: string, status: string, wipLimit?: number | null) => void;
  updateColumn: (columnId: string, updates: Partial<BoardColumn>) => void;
  deleteColumn: (columnId: string) => void;

  // Tickets
  tickets: Ticket[];
  workspaceTickets: Ticket[];
  createTicket: (data: {
    title: string;
    description?: string;
    type: TicketType;
    priority: TicketPriority;
    status: string;
    assigneeId?: string | null;
    dueAt?: string | null;
    startAt?: string | null;
    estimatedEffort?: string | null;
    storyPoints?: number | null;
    labels?: string[];
  }) => Ticket;
  updateTicket: (ticketId: string, updates: Partial<Ticket>, logAction?: string) => void;
  moveTicket: (ticketId: string, targetStatus: string, newPosition?: number) => void;
  moveTickets: (ticketIds: string[], targetStatus: string) => void;
  deleteTicket: (ticketId: string) => void;

  // SMART Goals
  goals: Goal[];
  workspaceGoals: Goal[];
  createGoal: (data: {
    title: string;
    description: string;
    purpose: string;
    measurementType: GoalMeasurementType;
    targetValue: number;
    unit: string;
    startDate: string;
    targetDate: string;
    timeDedicatedHoursPerWeek?: number | null;
    projectId?: string | null;
    milestoneTitles?: string[];
    smartScore: number;
  }) => Goal;
  updateGoal: (goalId: string, updates: Partial<Goal>, logAction?: string) => void;
  deleteGoal: (goalId: string) => void;
  updateGoalProgress: (goalId: string, value: number) => void;
  addGoalMilestone: (goalId: string, title: string, targetDate?: string) => void;
  toggleGoalMilestone: (goalId: string, milestoneId: string) => void;
  deleteGoalMilestone: (goalId: string, milestoneId: string) => void;
  addGoalCheckIn: (goalId: string, data: { progressValue: number; notes: string; blockers?: string; nextStep?: string }) => void;
  linkTicketToGoal: (goalId: string, ticketId: string) => void;
  unlinkTicketFromGoal: (goalId: string, ticketId: string) => void;

  // Multi-select on Kanban
  selectedTicketIds: string[];
  setSelectedTicketIds: React.Dispatch<React.SetStateAction<string[]>>;
  toggleTicketSelection: (ticketId: string, isShift?: boolean) => void;
  clearTicketSelection: () => void;

  // Global Density Mode
  density: DensityMode;
  setDensity: (mode: DensityMode) => void;

  // Theme mode (light/dark/system/high_contrast)
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;

  // Appearance: preset theme, custom colors, typography, Kanban card display
  presetTheme: PresetThemeName;
  setPresetTheme: (preset: PresetThemeName) => void;
  customColors: Partial<CustomColors>;
  setCustomColors: (colors: Partial<CustomColors>) => void;
  fontFamily: SupportedFontFamily;
  setFontFamily: (font: SupportedFontFamily) => void;
  fontSize: SupportedFontSize;
  setFontSize: (size: SupportedFontSize) => void;
  kanbanCardSettings: KanbanCardSettings;
  setKanbanCardSettings: (settings: Partial<KanbanCardSettings>) => void;
  customThemeProfiles: CustomThemeProfile[];
  saveCustomTheme: (name: string) => void;
  applyCustomTheme: (id: string) => void;
  renameCustomTheme: (id: string, name: string) => void;
  deleteCustomTheme: (id: string) => void;
  resetAppearance: () => void;

  // Notification & Calendar preferences
  notificationSettings: NotificationSettings;
  setNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  calendarSettings: CalendarSettings;
  setCalendarSettings: (settings: Partial<CalendarSettings>) => void;

  // Ticket Detail Drawer
  selectedTicketId: string | null;
  selectedTicket: Ticket | null;
  setSelectedTicketId: (id: string | null) => void;

  // Subtasks, Checklist & Comments
  addSubtask: (ticketId: string, title: string) => void;
  toggleSubtask: (ticketId: string, subtaskId: string) => void;
  deleteSubtask: (ticketId: string, subtaskId: string) => void;
  addChecklistItem: (ticketId: string, text: string) => void;
  toggleChecklistItem: (ticketId: string, itemId: string) => void;
  deleteChecklistItem: (ticketId: string, itemId: string) => void;
  addComment: (ticketId: string, content: string) => void;
  addAttachment: (ticketId: string, file: { name: string; size: number; mimeType: string }) => void;
  syncCalendarEvent: (ticketId: string, provider: 'google' | 'microsoft') => void;

  // Views, Search & Filter
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;

  // Sharing
  shareLinks: ShareLink[];
  createShareLink: (boardId: string, permission: SharePermission) => ShareLink;
  revokeShareLink: (linkId: string) => void;

  // Calendar Connections
  calendarConnections: CalendarConnection[];
  toggleCalendarConnection: (provider: 'google' | 'microsoft') => void;

  // Notifications
  notifications: AppNotification[];
  workspaceNotifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Utilities
  resetToDefaults: () => void;
  userCanEdit: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'kanban_collaborative_platform_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or default
  const [initialized, setInitialized] = useState(false);

  const [currentUser, setCurrentUserState] = useState<User>(INITIAL_USERS[0]);
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [isGuestViewer, setIsGuestViewer] = useState<boolean>(false);

  const [workspaces, setWorkspaces] = useState<Workspace[]>(INITIAL_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceIdRaw] = useState<string>(INITIAL_WORKSPACES[0].id);

  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([
    { id: 'wm_1', workspaceId: 'ws_rahul_work', user: INITIAL_USERS[0], role: 'owner', status: 'active', joinedAt: '2026-08-01' },
    { id: 'wm_2', workspaceId: 'ws_rahul_work', user: INITIAL_USERS[1], role: 'admin', status: 'active', joinedAt: '2026-08-02' },
    { id: 'wm_3', workspaceId: 'ws_rahul_work', user: INITIAL_USERS[2], role: 'member', status: 'active', joinedAt: '2026-08-05' },
    { id: 'wm_4', workspaceId: 'ws_rahul_work', user: INITIAL_USERS[3], role: 'guest', status: 'active', joinedAt: '2026-08-10' },
  ]);

  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>(INITIAL_PROJECTS[0].id);

  const [boards, setBoards] = useState<Board[]>(INITIAL_BOARDS);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('kanban');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({});

  const [shareLinks, setShareLinks] = useState<ShareLink[]>(INITIAL_SHARE_LINKS);
  const [calendarConnections, setCalendarConnections] = useState<CalendarConnection[]>(INITIAL_CALENDAR_CONNECTIONS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Global Density Mode
  const [density, setDensityState] = useState<DensityMode>('compact');

  const setDensity = useCallback((mode: DensityMode) => {
    setDensityState(mode);
    try {
      localStorage.setItem('kanban_app_density', mode);
    } catch (e) {
      // ignore
    }
    document.documentElement.setAttribute('data-density', mode);
  }, []);

  // Appearance: theme mode, preset theme, custom color overrides, typography, Kanban card
  // display, and saved custom theme profiles. applyThemeTokensToDOM (below) is the single
  // place that turns this state into the CSS custom properties the app actually renders with.
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [presetTheme, setPresetThemeState] = useState<PresetThemeName>('default');
  const [customColors, setCustomColorsState] = useState<Partial<CustomColors>>({});
  const [fontFamily, setFontFamilyState] = useState<SupportedFontFamily>('Plus Jakarta Sans');
  const [fontSize, setFontSizeState] = useState<SupportedFontSize>('medium');
  const [kanbanCardSettings, setKanbanCardSettingsState] = useState<KanbanCardSettings>(INITIAL_KANBAN_SETTINGS);
  const [customThemeProfiles, setCustomThemeProfiles] = useState<CustomThemeProfile[]>([]);

  // Notification & Calendar preferences
  const [notificationSettings, setNotificationSettingsState] = useState<NotificationSettings>(INITIAL_NOTIFICATION_SETTINGS);
  const [calendarSettings, setCalendarSettingsState] = useState<CalendarSettings>(INITIAL_CALENDAR_SETTINGS);

  const setNotificationSettings = useCallback((settings: Partial<NotificationSettings>) => {
    setNotificationSettingsState((prev) => ({ ...prev, ...settings }));
  }, []);

  const setCalendarSettings = useCallback((settings: Partial<CalendarSettings>) => {
    setCalendarSettingsState((prev) => ({ ...prev, ...settings }));
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    try {
      localStorage.setItem('kanban_app_theme', mode);
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const isCurrentlyDark =
        prev === 'dark' ||
        (prev === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      const next: ThemeMode = isCurrentlyDark ? 'light' : 'dark';
      try {
        localStorage.setItem('kanban_app_theme', next);
      } catch (e) {
        // ignore
      }
      return next;
    });
  }, []);

  const setPresetTheme = useCallback((preset: PresetThemeName) => {
    setPresetThemeState(preset);
  }, []);

  const setCustomColors = useCallback((colors: Partial<CustomColors>) => {
    setCustomColorsState((prev) => ({ ...prev, ...colors }));
  }, []);

  const setFontFamily = useCallback((font: SupportedFontFamily) => {
    setFontFamilyState(font);
  }, []);

  const setFontSize = useCallback((size: SupportedFontSize) => {
    setFontSizeState(size);
  }, []);

  const setKanbanCardSettings = useCallback((settings: Partial<KanbanCardSettings>) => {
    setKanbanCardSettingsState((prev) => ({ ...prev, ...settings }));
  }, []);

  const saveCustomTheme = useCallback(
    (name: string) => {
      const baseColors = PRESET_THEMES[presetTheme]?.colors || PRESET_THEMES.default.colors;
      const newProfile: CustomThemeProfile = {
        id: `theme_${Date.now()}`,
        name,
        mode: theme,
        preset: presetTheme,
        colors: { ...baseColors, ...customColors },
        createdAt: new Date().toISOString(),
      };
      setCustomThemeProfiles((prev) => [...prev, newProfile]);
    },
    [theme, presetTheme, customColors]
  );

  const applyCustomTheme = useCallback(
    (id: string) => {
      const profile = customThemeProfiles.find((p) => p.id === id);
      if (!profile) return;
      setTheme(profile.mode);
      setPresetThemeState(profile.preset);
      setCustomColorsState(profile.colors);
    },
    [customThemeProfiles, setTheme]
  );

  const renameCustomTheme = useCallback((id: string, name: string) => {
    setCustomThemeProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }, []);

  const deleteCustomTheme = useCallback((id: string) => {
    setCustomThemeProfiles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const resetAppearance = useCallback(() => {
    setTheme('light');
    setPresetThemeState('default');
    setCustomColorsState({});
    setFontFamilyState('Plus Jakarta Sans');
    setFontSizeState('medium');
    setKanbanCardSettingsState(INITIAL_KANBAN_SETTINGS);
    setDensity('compact');
  }, [setTheme, setDensity]);

  // Apply the current appearance state to the DOM (CSS custom properties, dark class,
  // font family/size) whenever any part of it changes.
  useEffect(() => {
    applyThemeTokensToDOM(theme, presetTheme, customColors, fontFamily, fontSize);
  }, [theme, presetTheme, customColors, fontFamily, fontSize]);

  // Multi-select state
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);

  const toggleTicketSelection = useCallback((ticketId: string, isShift?: boolean) => {
    setSelectedTicketIds((prev) => {
      if (prev.includes(ticketId)) {
        return prev.filter((id) => id !== ticketId);
      } else {
        return [...prev, ticketId];
      }
    });
  }, []);

  const clearTicketSelection = useCallback(() => {
    setSelectedTicketIds([]);
  }, []);

  // Switching the active workspace is the single entry point for workspace changes.
  // It invalidates every workspace-scoped selection/derived-view so no state from the
  // previous workspace (open ticket, multi-select, filters, search) can leak into the next one.
  const setActiveWorkspaceId = useCallback((id: string) => {
    setActiveWorkspaceIdRaw(id);
    setActiveProjectId('');
    setSelectedTicketId(null);
    setSelectedTicketIds([]);
    setFilters({});
    setSearchQuery('');
  }, []);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.workspaces) setWorkspaces(data.workspaces);
        if (data.activeWorkspaceId) setActiveWorkspaceIdRaw(data.activeWorkspaceId);
        if (data.projects) setProjects(data.projects);
        if (data.activeProjectId) setActiveProjectId(data.activeProjectId);
        if (data.boards) setBoards(data.boards);
        if (data.tickets) setTickets(data.tickets);
        if (data.allUsers) setAllUsers(data.allUsers);
        if (data.workspaceMembers) setWorkspaceMembers(data.workspaceMembers);
        if (data.shareLinks) setShareLinks(data.shareLinks);
        if (data.calendarConnections) setCalendarConnections(data.calendarConnections);
        if (data.notifications) setNotifications(data.notifications);
        if (data.presetTheme) setPresetThemeState(data.presetTheme);
        if (data.customColors) setCustomColorsState(data.customColors);
        if (data.fontFamily) setFontFamilyState(data.fontFamily);
        if (data.fontSize) setFontSizeState(data.fontSize);
        if (data.kanbanCardSettings) setKanbanCardSettingsState({ ...INITIAL_KANBAN_SETTINGS, ...data.kanbanCardSettings });
        if (data.customThemeProfiles) setCustomThemeProfiles(data.customThemeProfiles);
        if (data.notificationSettings) setNotificationSettingsState({ ...INITIAL_NOTIFICATION_SETTINGS, ...data.notificationSettings });
        if (data.calendarSettings) setCalendarSettingsState({ ...INITIAL_CALENDAR_SETTINGS, ...data.calendarSettings });
        if (data.goals) setGoals(data.goals);
      }
    } catch (e) {
      console.warn('Could not load stored state:', e);
    } finally {
      // Density and theme mode each also get a small dedicated key so they're available
      // synchronously on next boot without waiting on the rest of app state to parse.
      try {
        const savedDensity = localStorage.getItem('kanban_app_density') as DensityMode | null;
        if (savedDensity === 'compact' || savedDensity === 'comfortable' || savedDensity === 'spacious') {
          setDensityState(savedDensity);
        }
        document.documentElement.setAttribute('data-density', savedDensity || 'compact');
      } catch (err) {
        document.documentElement.setAttribute('data-density', 'compact');
      }

      try {
        const savedTheme = localStorage.getItem('kanban_app_theme') as ThemeMode | null;
        if (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'system' || savedTheme === 'high_contrast') {
          setThemeState(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setThemeState('dark');
        }
      } catch (err) {
        // ignore — theme falls back to the 'light' default
      }
      setInitialized(true);
    }
  }, []);

  // Save to LocalStorage on changes
  useEffect(() => {
    if (!initialized) return;
    try {
      const dataToSave = {
        workspaces,
        activeWorkspaceId,
        projects,
        activeProjectId,
        boards,
        tickets,
        allUsers,
        workspaceMembers,
        shareLinks,
        calendarConnections,
        notifications,
        presetTheme,
        customColors,
        fontFamily,
        fontSize,
        kanbanCardSettings,
        customThemeProfiles,
        notificationSettings,
        calendarSettings,
        goals,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Failed saving to localStorage', e);
    }
  }, [
    initialized,
    workspaces,
    activeWorkspaceId,
    projects,
    activeProjectId,
    boards,
    tickets,
    allUsers,
    workspaceMembers,
    shareLinks,
    calendarConnections,
    notifications,
    presetTheme,
    customColors,
    fontFamily,
    fontSize,
    kanbanCardSettings,
    goals,
    customThemeProfiles,
    notificationSettings,
    calendarSettings,
  ]);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  // Workspace-scoped derived data. activeWorkspaceId is the single source of truth here —
  // every workspace-scoped view should read from these instead of the raw top-level arrays.
  const workspaceProjects = projects.filter((p) => p.workspaceId === activeWorkspace.id);
  const workspaceProjectIds = new Set(workspaceProjects.map((p) => p.id));
  const workspaceBoards = boards.filter((b) => workspaceProjectIds.has(b.projectId));
  const workspaceTickets = tickets.filter((t) => workspaceProjectIds.has(t.projectId));
  const workspaceNotifications = notifications.filter((n) => n.workspaceId === activeWorkspace.id);
  const workspaceGoals = goals.filter((g) => g.workspaceId === activeWorkspace.id);

  const activeProject = workspaceProjects.find((p) => p.id === activeProjectId) || workspaceProjects[0] || null;
  const activeBoard = activeProject ? boards.find((b) => b.projectId === activeProject.id) || null : null;

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  const userCanEdit = !isGuestViewer && currentUser.role !== 'guest';

  const setCurrentUser = useCallback((user: User) => {
    setCurrentUserState(user);
    if (user.role === 'guest') {
      setIsGuestViewer(true);
    } else {
      setIsGuestViewer(false);
    }
  }, []);

  // Create workspace
  const createWorkspace = useCallback(
    (name: string, description?: string) => {
      const newWs: Workspace = {
        id: `ws_${Date.now()}`,
        name,
        ownerId: currentUser.id,
        description,
        createdAt: new Date().toISOString(),
      };
      setWorkspaces((prev) => [...prev, newWs]);
      setActiveWorkspaceId(newWs.id);

      // Add default project for new workspace
      const newProj: Project = {
        id: `proj_${Date.now()}`,
        workspaceId: newWs.id,
        name: 'General Sprint',
        key: name.substring(0, 3).toUpperCase() || 'GEN',
        description: 'Main project sprint board',
        icon: 'Layout',
        color: '#3b82f6',
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
      };
      setProjects((prev) => [...prev, newProj]);
      setActiveProjectId(newProj.id);

      // Add default board
      const newBoard: Board = {
        id: `board_${Date.now()}`,
        projectId: newProj.id,
        name: 'Sprint Kanban',
        columns: [
          { id: `col_b_${Date.now()}`, boardId: `board_${Date.now()}`, name: 'Backlog', status: 'BACKLOG', position: 0 },
          { id: `col_t_${Date.now()}`, boardId: `board_${Date.now()}`, name: 'To Do', status: 'TO_DO', position: 1, wipLimit: 8 },
          { id: `col_p_${Date.now()}`, boardId: `board_${Date.now()}`, name: 'In Progress', status: 'IN_PROGRESS', position: 2, wipLimit: 4 },
          { id: `col_r_${Date.now()}`, boardId: `board_${Date.now()}`, name: 'Review', status: 'REVIEW', position: 3, wipLimit: 3 },
          { id: `col_d_${Date.now()}`, boardId: `board_${Date.now()}`, name: 'Done', status: 'DONE', position: 4, isDoneColumn: true },
        ],
        createdAt: new Date().toISOString(),
      };
      setBoards((prev) => [...prev, newBoard]);
    },
    [currentUser.id]
  );

  // Invite member
  const inviteMember = useCallback(
    (email: string, role: WorkspaceRole) => {
      const existingUser = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      const invitedUser: User = existingUser || {
        id: `usr_${Date.now()}`,
        googleId: `google_${Date.now()}`,
        email,
        name: email.split('@')[0],
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        role,
      };

      if (!existingUser) {
        setAllUsers((prev) => [...prev, invitedUser]);
      }

      setWorkspaceMembers((prev) => [
        ...prev,
        {
          id: `wm_${Date.now()}`,
          workspaceId: activeWorkspace.id,
          user: invitedUser,
          role,
          status: 'invited',
          joinedAt: new Date().toISOString(),
        },
      ]);

      // Add in-app notification
      setNotifications((prev) => [
        {
          id: `notif_${Date.now()}`,
          userId: currentUser.id,
          workspaceId: activeWorkspace.id,
          title: 'Invitation Sent',
          message: `Invited ${email} as ${role} to ${activeWorkspace.name}.`,
          type: 'invite',
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    [activeWorkspace, allUsers, currentUser.id]
  );

  const updateMemberRole = useCallback((userId: string, role: WorkspaceRole) => {
    setWorkspaceMembers((prev) =>
      prev.map((m) => (m.user.id === userId ? { ...m, role, user: { ...m.user, role } } : m))
    );
  }, []);

  // Create Project
  const createProject = useCallback(
    (data: { name: string; key: string; description: string; color: string; icon: string }) => {
      const newProj: Project = {
        id: `proj_${Date.now()}`,
        workspaceId: activeWorkspace.id,
        name: data.name,
        key: data.key.toUpperCase(),
        description: data.description,
        icon: data.icon,
        color: data.color,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
      };
      setProjects((prev) => [...prev, newProj]);
      setActiveProjectId(newProj.id);

      // Create default board for new project
      const newBoard: Board = {
        id: `board_${Date.now()}`,
        projectId: newProj.id,
        name: `${data.name} Board`,
        columns: [
          { id: `col_b_${Date.now()}`, boardId: `board_${Date.now()}`, name: 'Backlog', status: 'BACKLOG', position: 0 },
          { id: `col_t_${Date.now()}`, boardId: `board_${Date.now()}`, name: 'To Do', status: 'TO_DO', position: 1, wipLimit: 8 },
          { id: `col_p_${Date.now()}`, boardId: `board_${Date.now()}`, name: 'In Progress', status: 'IN_PROGRESS', position: 2, wipLimit: 4 },
          { id: `col_r_${Date.now()}`, boardId: `board_${Date.now()}`, name: 'Review', status: 'REVIEW', position: 3, wipLimit: 3 },
          { id: `col_d_${Date.now()}`, boardId: `board_${Date.now()}`, name: 'Done', status: 'DONE', position: 4, isDoneColumn: true },
        ],
        createdAt: new Date().toISOString(),
      };
      setBoards((prev) => [...prev, newBoard]);
      return newProj;
    },
    [activeWorkspace.id, currentUser.id]
  );

  // Column management
  const addColumn = useCallback(
    (name: string, status: string, wipLimit?: number | null) => {
      if (!activeBoard) return;
      const newCol: BoardColumn = {
        id: `col_${Date.now()}`,
        boardId: activeBoard.id,
        name,
        status: status.toUpperCase().replace(/\s+/g, '_'),
        position: activeBoard.columns.length,
        wipLimit: wipLimit ?? null,
      };
      setBoards((prev) =>
        prev.map((b) => (b.id === activeBoard.id ? { ...b, columns: [...b.columns, newCol] } : b))
      );
    },
    [activeBoard]
  );

  const updateColumn = useCallback(
    (columnId: string, updates: Partial<BoardColumn>) => {
      if (!activeBoard) return;
      setBoards((prev) =>
        prev.map((b) =>
          b.id === activeBoard.id
            ? {
                ...b,
                columns: b.columns.map((col) => (col.id === columnId ? { ...col, ...updates } : col)),
              }
            : b
        )
      );
    },
    [activeBoard]
  );

  const deleteColumn = useCallback(
    (columnId: string) => {
      if (!activeBoard) return;
      setBoards((prev) =>
        prev.map((b) =>
          b.id === activeBoard.id
            ? {
                ...b,
                columns: b.columns.filter((c) => c.id !== columnId),
              }
            : b
        )
      );
    },
    [activeBoard]
  );

  // Ticket creation
  const createTicket = useCallback(
    (data: {
      title: string;
      description?: string;
      type: TicketType;
      priority: TicketPriority;
      status: string;
      assigneeId?: string | null;
      dueAt?: string | null;
      startAt?: string | null;
      estimatedEffort?: string | null;
      storyPoints?: number | null;
      labels?: string[];
    }) => {
      if (!activeProject || !activeBoard) {
        throw new Error('No active project or board');
      }

      // Calculate next ticket number for this project
      const projectTickets = tickets.filter((t) => t.projectId === activeProject.id);
      const maxNumber = projectTickets.reduce((max, t) => Math.max(max, t.ticketNumber || 0), 0);
      const nextNumber = maxNumber + 1;

      // Position in column
      const colTickets = projectTickets.filter((t) => t.status === data.status);
      const nextPos = colTickets.length;

      const newTicket: Ticket = {
        id: `tkt_${Date.now()}`,
        projectId: activeProject.id,
        boardId: activeBoard.id,
        ticketNumber: nextNumber,
        title: data.title,
        description: data.description || '',
        type: data.type,
        status: data.status,
        priority: data.priority,
        reporterId: currentUser.id,
        assigneeId: data.assigneeId || null,
        position: nextPos,
        startAt: data.startAt || null,
        dueAt: data.dueAt || null,
        estimatedEffort: data.estimatedEffort || null,
        storyPoints: data.storyPoints || null,
        labels: data.labels || [],
        subtasks: [],
        checklist: [],
        attachments: [],
        comments: [],
        activity: [
          {
            id: `act_${Date.now()}`,
            ticketId: `tkt_${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatarUrl,
            action: 'created ticket',
            createdAt: new Date().toISOString(),
          },
        ],
        watchers: [currentUser.id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };

      if (data.assigneeId && data.assigneeId !== currentUser.id) {
        newTicket.activity.push({
          id: `act_assign_${Date.now()}`,
          ticketId: newTicket.id,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatarUrl,
          action: `assigned ticket to ${allUsers.find((u) => u.id === data.assigneeId)?.name || 'member'}`,
          createdAt: new Date().toISOString(),
        });

        // Trigger notification for assignee
        setNotifications((prev) => [
          {
            id: `notif_${Date.now()}`,
            userId: data.assigneeId!,
            workspaceId: activeWorkspace.id,
            title: 'New Ticket Assigned',
            message: `${currentUser.name} assigned ${activeProject.key}-${nextNumber} to you: "${data.title}"`,
            type: 'assigned',
            ticketId: newTicket.id,
            ticketKey: `${activeProject.key}-${nextNumber}`,
            projectId: activeProject.id,
            read: false,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }

      setTickets((prev) => [newTicket, ...prev]);
      return newTicket;
    },
    [activeBoard, activeProject, activeWorkspace, allUsers, currentUser, tickets]
  );

  // Update ticket with activity tracking
  const updateTicket = useCallback(
    (ticketId: string, updates: Partial<Ticket>, logAction?: string) => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id !== ticketId) return t;

          const updatedTicket = { ...t, ...updates, updatedAt: new Date().toISOString(), version: t.version + 1 };

          // Build activity item if action provided
          if (logAction) {
            const newAct: Activity = {
              id: `act_${Date.now()}`,
              ticketId,
              userId: currentUser.id,
              userName: currentUser.name,
              userAvatar: currentUser.avatarUrl,
              action: logAction,
              createdAt: new Date().toISOString(),
            };
            updatedTicket.activity = [...t.activity, newAct];
          }

          // If assignee changed, notify
          if (updates.assigneeId && updates.assigneeId !== t.assigneeId && updates.assigneeId !== currentUser.id) {
            const assignee = allUsers.find((u) => u.id === updates.assigneeId);
            setNotifications((n) => [
              {
                id: `notif_${Date.now()}`,
                userId: updates.assigneeId!,
                workspaceId: activeWorkspace.id,
                title: 'Ticket Assigned',
                message: `${currentUser.name} assigned ${activeProject?.key || 'TKT'}-${t.ticketNumber} to you`,
                type: 'assigned',
                ticketId: t.id,
                ticketKey: `${activeProject?.key || 'TKT'}-${t.ticketNumber}`,
                projectId: t.projectId,
                read: false,
                createdAt: new Date().toISOString(),
              },
              ...n,
            ]);
          }

          return updatedTicket;
        })
      );
    },
    [activeProject, activeWorkspace, allUsers, currentUser]
  );

  // Move ticket (Kanban drag & drop)
  const moveTicket = useCallback(
    (ticketId: string, targetStatus: string, newPosition?: number) => {
      setTickets((prev) => {
        const targetTicket = prev.find((t) => t.id === ticketId);
        if (!targetTicket) return prev;

        const oldStatus = targetTicket.status;
        const statusChanged = oldStatus !== targetStatus;

        return prev.map((t) => {
          if (t.id === ticketId) {
            const isCompleted = targetStatus === 'DONE';
            const acts = [...t.activity];
            if (statusChanged) {
              acts.push({
                id: `act_move_${Date.now()}`,
                ticketId: t.id,
                userId: currentUser.id,
                userName: currentUser.name,
                userAvatar: currentUser.avatarUrl,
                action: `moved ticket from ${oldStatus} to ${targetStatus}`,
                metadata: { from: oldStatus, to: targetStatus },
                createdAt: new Date().toISOString(),
              });
            }

            return {
              ...t,
              status: targetStatus,
              position: newPosition !== undefined ? newPosition : t.position,
              completedAt: isCompleted && !t.completedAt ? new Date().toISOString() : (!isCompleted ? null : t.completedAt),
              updatedAt: new Date().toISOString(),
              version: t.version + 1,
              activity: acts,
            };
          }
          return t;
        });
      });
    },
    [currentUser]
  );

  const moveTickets = useCallback(
    (ticketIds: string[], targetStatus: string) => {
      if (!ticketIds || ticketIds.length === 0) return;
      setTickets((prev) => {
        const now = new Date().toISOString();
        const isCompleted = targetStatus === 'DONE';
        return prev.map((t) => {
          if (ticketIds.includes(t.id)) {
            const oldStatus = t.status;
            const statusChanged = oldStatus !== targetStatus;
            const acts = [...t.activity];
            if (statusChanged) {
              acts.push({
                id: `act_bulk_move_${Date.now()}_${t.id}`,
                ticketId: t.id,
                userId: currentUser.id,
                userName: currentUser.name,
                userAvatar: currentUser.avatarUrl,
                action: `moved ticket from ${oldStatus} to ${targetStatus} (bulk move)`,
                metadata: { from: oldStatus, to: targetStatus },
                createdAt: now,
              });
            }
            return {
              ...t,
              status: targetStatus,
              completedAt: isCompleted && !t.completedAt ? now : (!isCompleted ? null : t.completedAt),
              updatedAt: now,
              version: t.version + 1,
              activity: acts,
            };
          }
          return t;
        });
      });
      setSelectedTicketIds([]);
    },
    [currentUser]
  );

  const deleteTicket = useCallback((ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    setSelectedTicketId((curr) => (curr === ticketId ? null : curr));
  }, []);

  // ---- SMART Goals ----
  // `health` is a stored, user-overridable field (not purely derived) so seed/authored
  // narratives aren't silently overwritten by a live calculation — it's recomputed here
  // at the moment something progress-relevant actually changes.
  const recalcHealth = useCallback(
    (goal: Goal): Goal => {
      const progress = calculateGoalProgress(goal, tickets);
      return { ...goal, health: calculateGoalHealth(goal, progress) };
    },
    [tickets]
  );

  const createGoal = useCallback(
    (data: {
      title: string;
      description: string;
      purpose: string;
      measurementType: GoalMeasurementType;
      targetValue: number;
      unit: string;
      startDate: string;
      targetDate: string;
      timeDedicatedHoursPerWeek?: number | null;
      projectId?: string | null;
      milestoneTitles?: string[];
      smartScore: number;
    }) => {
      const id = `goal_${Date.now()}`;
      const now = new Date().toISOString();
      const newGoal: Goal = {
        id,
        workspaceId: activeWorkspace.id,
        projectId: data.projectId ?? null,
        boardId: null,
        title: data.title,
        description: data.description,
        purpose: data.purpose,
        measurementType: data.measurementType,
        currentValue: 0,
        targetValue: data.targetValue,
        unit: data.unit,
        startDate: data.startDate,
        targetDate: data.targetDate,
        timeDedicatedHoursPerWeek: data.timeDedicatedHoursPerWeek || undefined,
        status: 'active',
        health: 'on_track',
        ownerId: currentUser.id,
        milestones: (data.milestoneTitles || [])
          .filter((t) => t.trim())
          .map((title, i) => ({ id: `ms_${Date.now()}_${i}`, goalId: id, title: title.trim(), completed: false })),
        linkedTicketIds: [],
        checkIns: [],
        activity: [{ id: `gact_${Date.now()}`, goalId: id, action: 'Goal created', createdAt: now }],
        smartScore: data.smartScore,
        createdAt: now,
        updatedAt: now,
      };
      setGoals((prev) => [recalcHealth(newGoal), ...prev]);
      return newGoal;
    },
    [activeWorkspace.id, currentUser.id, recalcHealth]
  );

  const updateGoal = useCallback(
    (goalId: string, updates: Partial<Goal>, logAction?: string) => {
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id !== goalId) return g;
          let updated: Goal = { ...g, ...updates, updatedAt: new Date().toISOString() };
          if (logAction) {
            updated.activity = [...g.activity, { id: `gact_${Date.now()}`, goalId, action: logAction, createdAt: new Date().toISOString() }];
          }
          return recalcHealth(updated);
        })
      );
    },
    [recalcHealth]
  );

  const deleteGoal = useCallback((goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }, []);

  const updateGoalProgress = useCallback(
    (goalId: string, value: number) => {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;
      const fromPct = calculateGoalProgress(goal, tickets);
      updateGoal(
        goalId,
        { currentValue: value },
        `Progress changed ${fromPct}% → ${calculateGoalProgress({ ...goal, currentValue: value }, tickets)}%`
      );
    },
    [goals, tickets, updateGoal]
  );

  const addGoalMilestone = useCallback(
    (goalId: string, title: string, targetDate?: string) => {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal || !title.trim()) return;
      const newMilestone: GoalMilestone = { id: `ms_${Date.now()}`, goalId, title: title.trim(), targetDate, completed: false };
      updateGoal(goalId, { milestones: [...goal.milestones, newMilestone] }, `Milestone "${title.trim()}" added`);
    },
    [goals, updateGoal]
  );

  const toggleGoalMilestone = useCallback(
    (goalId: string, milestoneId: string) => {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;
      const ms = goal.milestones.find((m) => m.id === milestoneId);
      const updatedMilestones = goal.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : undefined } : m
      );
      updateGoal(
        goalId,
        { milestones: updatedMilestones },
        `Milestone "${ms?.title}" ${ms?.completed ? 'reopened' : 'completed'}`
      );
    },
    [goals, updateGoal]
  );

  const deleteGoalMilestone = useCallback(
    (goalId: string, milestoneId: string) => {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;
      updateGoal(goalId, { milestones: goal.milestones.filter((m) => m.id !== milestoneId) });
    },
    [goals, updateGoal]
  );

  const addGoalCheckIn = useCallback(
    (goalId: string, data: { progressValue: number; notes: string; blockers?: string; nextStep?: string }) => {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;
      const newCheckIn: GoalCheckIn = {
        id: `chk_${Date.now()}`,
        goalId,
        userId: currentUser.id,
        progressValue: data.progressValue,
        notes: data.notes,
        blockers: data.blockers,
        nextStep: data.nextStep,
        createdAt: new Date().toISOString(),
      };
      // Only override currentValue when the goal isn't driven by milestones/linked tickets —
      // for those, progress is derived from completion, not a manually logged number.
      const isDerived = isGoalProgressDerived(goal);
      updateGoal(
        goalId,
        {
          checkIns: [...goal.checkIns, newCheckIn],
          ...(isDerived ? {} : { currentValue: data.progressValue }),
        },
        'Check-in added'
      );
    },
    [goals, currentUser.id, updateGoal]
  );

  const linkTicketToGoal = useCallback(
    (goalId: string, ticketId: string) => {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal || goal.linkedTicketIds.includes(ticketId)) return;
      const ticket = tickets.find((t) => t.id === ticketId);
      updateGoal(
        goalId,
        { linkedTicketIds: [...goal.linkedTicketIds, ticketId] },
        `Linked ticket ${ticket ? ticket.title : ticketId}`
      );
    },
    [goals, tickets, updateGoal]
  );

  const unlinkTicketFromGoal = useCallback(
    (goalId: string, ticketId: string) => {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;
      updateGoal(goalId, { linkedTicketIds: goal.linkedTicketIds.filter((id) => id !== ticketId) }, 'Unlinked ticket');
    },
    [goals, updateGoal]
  );

  // Subtasks
  const addSubtask = useCallback(
    (ticketId: string, title: string) => {
      const newSubtask: Subtask = {
        id: `sub_${Date.now()}`,
        title,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      updateTicket(ticketId, {
        subtasks: [...(tickets.find((t) => t.id === ticketId)?.subtasks || []), newSubtask],
      }, `added subtask "${title}"`);
    },
    [tickets, updateTicket]
  );

  const toggleSubtask = useCallback(
    (ticketId: string, subtaskId: string) => {
      const currentTicket = tickets.find((t) => t.id === ticketId);
      if (!currentTicket) return;
      const sub = currentTicket.subtasks.find((s) => s.id === subtaskId);
      const updatedSubtasks = currentTicket.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      );
      updateTicket(ticketId, { subtasks: updatedSubtasks }, `${sub?.completed ? 'unmarked' : 'completed'} subtask "${sub?.title}"`);
    },
    [tickets, updateTicket]
  );

  const deleteSubtask = useCallback(
    (ticketId: string, subtaskId: string) => {
      const currentTicket = tickets.find((t) => t.id === ticketId);
      if (!currentTicket) return;
      const updated = currentTicket.subtasks.filter((s) => s.id !== subtaskId);
      updateTicket(ticketId, { subtasks: updated });
    },
    [tickets, updateTicket]
  );

  // Checklists
  const addChecklistItem = useCallback(
    (ticketId: string, text: string) => {
      const newItem: ChecklistItem = {
        id: `chk_${Date.now()}`,
        text,
        completed: false,
      };
      updateTicket(ticketId, {
        checklist: [...(tickets.find((t) => t.id === ticketId)?.checklist || []), newItem],
      });
    },
    [tickets, updateTicket]
  );

  const toggleChecklistItem = useCallback(
    (ticketId: string, itemId: string) => {
      const currentTicket = tickets.find((t) => t.id === ticketId);
      if (!currentTicket) return;
      const updated = currentTicket.checklist.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      updateTicket(ticketId, { checklist: updated });
    },
    [tickets, updateTicket]
  );

  const deleteChecklistItem = useCallback(
    (ticketId: string, itemId: string) => {
      const currentTicket = tickets.find((t) => t.id === ticketId);
      if (!currentTicket) return;
      const updated = currentTicket.checklist.filter((item) => item.id !== itemId);
      updateTicket(ticketId, { checklist: updated });
    },
    [tickets, updateTicket]
  );

  // Comments with @mention notification
  const addComment = useCallback(
    (ticketId: string, content: string) => {
      const currentTicket = tickets.find((t) => t.id === ticketId);
      if (!currentTicket) return;

      const newComment: Comment = {
        id: `comm_${Date.now()}`,
        ticketId,
        user: currentUser,
        content,
        createdAt: new Date().toISOString(),
      };

      // Check for @mentions (e.g. @John, @Rahul, @Sarah, @Alex)
      const mentionMatches = content.match(/@(\w+)/g);
      if (mentionMatches) {
        mentionMatches.forEach((m) => {
          const mentionedName = m.substring(1).toLowerCase();
          const matchedUser = allUsers.find((u) => u.name.toLowerCase().includes(mentionedName));
          if (matchedUser && matchedUser.id !== currentUser.id) {
            setNotifications((prev) => [
              {
                id: `notif_ment_${Date.now()}`,
                userId: matchedUser.id,
                workspaceId: activeWorkspace.id,
                title: 'You were mentioned',
                message: `${currentUser.name} mentioned you in ${activeProject?.key || 'Ticket'}-${currentTicket.ticketNumber}`,
                type: 'mention',
                ticketId: currentTicket.id,
                ticketKey: `${activeProject?.key || 'TKT'}-${currentTicket.ticketNumber}`,
                projectId: currentTicket.projectId,
                read: false,
                createdAt: new Date().toISOString(),
              },
              ...prev,
            ]);
          }
        });
      }

      updateTicket(
        ticketId,
        {
          comments: [...currentTicket.comments, newComment],
        },
        'added a comment'
      );
    },
    [activeProject, activeWorkspace, allUsers, currentUser, tickets, updateTicket]
  );

  // Attachments
  const addAttachment = useCallback(
    (ticketId: string, file: { name: string; size: number; mimeType: string }) => {
      const currentTicket = tickets.find((t) => t.id === ticketId);
      if (!currentTicket) return;

      const newAtt: Attachment = {
        id: `att_${Date.now()}`,
        ticketId,
        fileName: file.name,
        fileUrl: '#',
        mimeType: file.mimeType,
        size: file.size,
        uploadedBy: currentUser,
        createdAt: new Date().toISOString(),
      };

      updateTicket(
        ticketId,
        {
          attachments: [...currentTicket.attachments, newAtt],
        },
        `attached file "${file.name}"`
      );
    },
    [currentUser, tickets, updateTicket]
  );

  // Sync Calendar Event
  const syncCalendarEvent = useCallback(
    (ticketId: string, provider: 'google' | 'microsoft') => {
      const currentTicket = tickets.find((t) => t.id === ticketId);
      if (!currentTicket) return;

      const mapping: CalendarEventMapping = {
        ticketId,
        provider,
        calendarName: provider === 'google' ? 'Work Calendar' : 'Engineering Calendar',
        externalEventId: `${provider}_evt_${currentTicket.ticketNumber}_${Date.now().toString().slice(-4)}`,
        lastSyncedAt: new Date().toISOString(),
      };

      updateTicket(
        ticketId,
        { calendarEvent: mapping },
        `synced ticket to ${provider === 'google' ? 'Google Calendar' : 'Microsoft Calendar'}`
      );
    },
    [tickets, updateTicket]
  );

  // Share links
  const createShareLink = useCallback(
    (boardId: string, permission: SharePermission) => {
      const token = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      const newLink: ShareLink = {
        id: `share_${Date.now()}`,
        boardId,
        token,
        permission,
        createdBy: currentUser.id,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setShareLinks((prev) => [newLink, ...prev]);
      return newLink;
    },
    [currentUser.id]
  );

  const revokeShareLink = useCallback((linkId: string) => {
    setShareLinks((prev) => prev.map((l) => (l.id === linkId ? { ...l, isActive: false } : l)));
  }, []);

  // Calendar connections toggle
  const toggleCalendarConnection = useCallback((provider: 'google' | 'microsoft') => {
    setCalendarConnections((prev) =>
      prev.map((c) =>
        c.provider === provider
          ? { ...c, connected: !c.connected, lastSyncedAt: new Date().toISOString() }
          : c
      )
    );
  }, []);

  // Notifications
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
  }, []);

  const resetToDefaults = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setWorkspaces(INITIAL_WORKSPACES);
    setActiveWorkspaceId(INITIAL_WORKSPACES[0].id);
    setProjects(INITIAL_PROJECTS);
    setActiveProjectId(INITIAL_PROJECTS[0].id);
    setBoards(INITIAL_BOARDS);
    setTickets(INITIAL_TICKETS);
    setGoals(INITIAL_GOALS);
    setAllUsers(INITIAL_USERS);
    setCurrentUserState(INITIAL_USERS[0]);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCalendarConnections(INITIAL_CALENDAR_CONNECTIONS);
    setShareLinks(INITIAL_SHARE_LINKS);
    setIsGuestViewer(false);
    resetAppearance();
    setCustomThemeProfiles([]);
    setNotificationSettingsState(INITIAL_NOTIFICATION_SETTINGS);
    setCalendarSettingsState(INITIAL_CALENDAR_SETTINGS);
  }, [resetAppearance]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        setCurrentUser,
        isGuestViewer,
        setIsGuestViewer,
        workspaces,
        activeWorkspace,
        setActiveWorkspaceId,
        createWorkspace,
        workspaceMembers,
        inviteMember,
        updateMemberRole,
        projects,
        workspaceProjects,
        activeProject,
        setActiveProjectId,
        createProject,
        boards,
        workspaceBoards,
        activeBoard,
        addColumn,
        updateColumn,
        deleteColumn,
        tickets,
        workspaceTickets,
        createTicket,
        updateTicket,
        moveTicket,
        moveTickets,
        deleteTicket,
        goals,
        workspaceGoals,
        createGoal,
        updateGoal,
        deleteGoal,
        updateGoalProgress,
        addGoalMilestone,
        toggleGoalMilestone,
        deleteGoalMilestone,
        addGoalCheckIn,
        linkTicketToGoal,
        unlinkTicketFromGoal,
        selectedTicketIds,
        setSelectedTicketIds,
        toggleTicketSelection,
        clearTicketSelection,
        density,
        setDensity,
        theme,
        setTheme,
        toggleTheme,
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
        renameCustomTheme,
        deleteCustomTheme,
        resetAppearance,
        notificationSettings,
        setNotificationSettings,
        calendarSettings,
        setCalendarSettings,
        selectedTicketId,
        selectedTicket,
        setSelectedTicketId,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        addChecklistItem,
        toggleChecklistItem,
        deleteChecklistItem,
        addComment,
        addAttachment,
        syncCalendarEvent,
        activeView,
        setActiveView,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        resetFilters,
        shareLinks,
        createShareLink,
        revokeShareLink,
        calendarConnections,
        toggleCalendarConnection,
        notifications,
        workspaceNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        resetToDefaults,
        userCanEdit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
