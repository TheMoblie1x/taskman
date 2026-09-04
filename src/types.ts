export type TicketType = 'task' | 'bug' | 'feature' | 'story' | 'epic';
export type TicketPriority = 'highest' | 'high' | 'medium' | 'low' | 'lowest';
export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest';
export type SharePermission = 'viewer' | 'editor';

export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: WorkspaceRole;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  description?: string;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  user: User;
  role: WorkspaceRole;
  status: 'active' | 'invited';
  joinedAt: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  key: string; // e.g. "AND", "API", "WEB"
  description: string;
  icon: string;
  color: string; // Tailwind color class or hex
  createdBy: string;
  createdAt: string;
}

export interface BoardColumn {
  id: string;
  boardId: string;
  name: string;
  status: string; // e.g., 'BACKLOG', 'TO_DO', 'IN_PROGRESS', 'REVIEW', 'DONE'
  position: number;
  wipLimit?: number | null; // e.g., 3
  isDoneColumn?: boolean;
}

export interface Board {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  columns: BoardColumn[];
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  ticketId: string;
  user: User;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Attachment {
  id: string;
  ticketId: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  size: number;
  uploadedBy: User;
  createdAt: string;
}

export interface Activity {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  metadata?: {
    field?: string;
    from?: string;
    to?: string;
  };
  createdAt: string;
}

export interface CalendarEventMapping {
  ticketId: string;
  provider: 'google' | 'microsoft';
  calendarName: string;
  externalEventId: string;
  lastSyncedAt: string;
  eventUrl?: string;
}

export interface Ticket {
  id: string;
  workspaceId?: string;
  projectId: string;
  boardId: string;
  ticketNumber: number; // e.g. 142 -> "AND-142"
  title: string;
  description: string;
  type: TicketType;
  status: string;
  priority: TicketPriority;
  reporterId: string;
  assigneeId?: string | null;
  parentTicketId?: string | null;
  position: number;
  startAt?: string | null;
  dueAt?: string | null;
  estimatedEffort?: string | null; // e.g., "4h", "2d"
  storyPoints?: number | null;
  labels: string[];
  subtasks: Subtask[];
  checklist: ChecklistItem[];
  attachments: Attachment[];
  comments: Comment[];
  activity: Activity[];
  calendarEvent?: CalendarEventMapping | null;
  watchers: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  version: number;
}

export interface CalendarConnection {
  id: string;
  provider: 'google' | 'microsoft';
  accountEmail: string;
  calendarName: string;
  connected: boolean;
  isDefault: boolean;
  lastSyncedAt: string;
}

export interface ShareLink {
  id: string;
  boardId: string;
  token: string;
  permission: SharePermission;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string | null;
}

export interface AppNotification {
  id: string;
  userId: string;
  workspaceId: string;
  title: string;
  message: string;
  type: 'assigned' | 'mention' | 'comment' | 'status_change' | 'due_soon' | 'invite';
  ticketId?: string;
  ticketKey?: string;
  projectId?: string;
  read: boolean;
  createdAt: string;
}

export type ActiveView = 'kanban' | 'list' | 'calendar' | 'my-tasks' | 'goals' | 'docs' | 'settings';

export type DensityMode = 'compact' | 'comfortable' | 'spacious';

export type ThemeMode = 'light' | 'dark' | 'system' | 'high_contrast';

export type PresetThemeName = 'default' | 'midnight' | 'slate' | 'forest' | 'ocean' | 'warm';

export interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  sidebar: string;
  card: string;
  header: string;
  text: string;
  textSecondary: string;
  border: string;
}

export type SupportedFontFamily = 'Plus Jakarta Sans' | 'Inter' | 'Roboto' | 'Outfit' | 'JetBrains Mono';
export type SupportedFontSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface KanbanCardSettings {
  showTicketId: boolean;
  showAssignee: boolean;
  showPriority: boolean;
  showLabels: boolean;
  showDueDate: boolean;
  showTicketType: boolean;
  showSubtasksCount: boolean;
  cardRadius: 'sm' | 'md' | 'lg';
  columnWidth: 'narrow' | 'normal' | 'wide';
}

export interface CustomThemeProfile {
  id: string;
  name: string;
  mode: ThemeMode;
  preset: PresetThemeName;
  colors: CustomColors;
  createdAt: string;
}

export interface WorkspaceAppearanceSettings {
  overrideGlobal: boolean;
  themeMode?: ThemeMode;
  presetTheme?: PresetThemeName;
  customThemeId?: string;
}

export interface NotificationSettings {
  ticketAssigned: boolean;
  mentionedInComment: boolean;
  statusChanged: boolean;
  dueDateApproaching: boolean;
  overdueTicket: boolean;
  boardInvitation: boolean;
  calendarChanges: boolean;
  inAppNotifications: boolean;
  emailNotifications: boolean;
}

export interface CalendarSettings {
  defaultProvider: 'google' | 'microsoft';
  autoCreateEvents: boolean;
  autoSyncChanges: boolean;
  defaultDurationMinutes: number;
  removeOnTicketDelete: boolean;
}

// SMART Goals Types
export type GoalMeasurementType =
  | 'number'
  | 'percentage'
  | 'count'
  | 'currency'
  | 'duration'
  | 'milestones'
  | 'binary'
  | 'custom';

export type GoalStatus = 'active' | 'completed' | 'paused';
export type GoalHealth = 'on_track' | 'at_risk' | 'behind' | 'completed' | 'overdue';

export interface GoalMilestone {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  targetDate?: string;
  completed: boolean;
  completedAt?: string;
  calendarEventId?: string;
}

export interface GoalCheckIn {
  id: string;
  goalId: string;
  userId: string;
  progressValue: number;
  notes: string;
  blockers?: string;
  nextStep?: string;
  createdAt: string;
}

export interface GoalActivity {
  id: string;
  goalId: string;
  action: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  workspaceId: string;
  projectId?: string | null;
  boardId?: string | null;
  title: string; // Specific
  description: string; // Specific details / context
  purpose: string; // Relevant (Why it matters)
  measurementType: GoalMeasurementType;
  currentValue: number;
  targetValue: number;
  unit: string;
  startDate: string;
  targetDate: string; // Time-bound
  timeDedicatedHoursPerWeek?: number; // Achievable context
  status: GoalStatus;
  health: GoalHealth;
  ownerId: string;
  milestones: GoalMilestone[];
  linkedTicketIds: string[];
  checkIns: GoalCheckIn[];
  activity: GoalActivity[];
  smartScore: number; // 1 to 5
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

// Documentation portal (workspace wiki)
export interface DocPage {
  id: string;
  workspaceId: string;
  projectId?: string | null; // optional — lets a page show up on a project's context
  title: string;
  content: string; // markdown source
  icon?: string; // single emoji, shown in the page list
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}
