/**
 * Firestore repository layer — the ONLY module that talks to Firestore directly.
 * AppContext calls these functions and otherwise doesn't know or care that the data
 * lives in Firestore; UI components never import this file at all.
 *
 * Collection shape: flat, top-level collections (workspaces, projects, boards, tickets,
 * goals, workspaceMembers, notifications, shareLinks, calendarConnections, users), each
 * workspace-scoped entity carrying a `workspaceId` field and queried with `where(...)`.
 * requirements.txt suggests nesting (workspaces/{id}/projects/{id}/tickets/{id}) but also
 * says "the exact structure can be adjusted based on Firestore query requirements" — flat
 * collections avoid Firestore's collection-group-query ceremony and map directly onto the
 * app's existing workspaceProjects/workspaceTickets/... selectors. Ticket/Goal sub-entities
 * (comments, subtasks, milestones, check-ins, activity) stay embedded arrays on the parent
 * document, exactly as they already are in memory — small, always read together with their
 * parent, well under Firestore's 1MB doc limit for a project this size.
 */
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  type Unsubscribe,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  User,
  Workspace,
  WorkspaceMember,
  Project,
  Board,
  Ticket,
  Goal,
  AppNotification,
  ShareLink,
  CalendarConnection,
} from '../types';

// Fields persisted on users/{userId} beyond the base profile — everything the Settings
// screens let a user customize, so it follows them across devices per requirements.txt.
export interface UserPreferences {
  theme?: string;
  density?: string;
  presetTheme?: string;
  customColors?: Record<string, string>;
  fontFamily?: string;
  fontSize?: string;
  kanbanCardSettings?: Record<string, unknown>;
  customThemeProfiles?: unknown[];
  notificationSettings?: Record<string, boolean>;
  calendarSettings?: Record<string, unknown>;
}

export type UserDoc = User & { preferences?: UserPreferences };

function requireDb() {
  if (!db) throw new Error('Firestore is not configured — missing VITE_FIREBASE_* env vars.');
  return db;
}

function subscribeCollection<T extends { id: string }>(
  collectionName: string,
  constraints: QueryConstraint[],
  onData: (rows: T[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const database = requireDb();
  const col = collection(database, collectionName);
  const q = constraints.length ? query(col, ...constraints) : query(col);
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })) as T[];
      onData(rows);
    },
    (err) => {
      console.error(`[firestore] ${collectionName} subscription error:`, err);
      onError?.(err);
    }
  );
}

// ---- Workspaces (not workspace-scoped themselves — every workspace the user can see) ----
export const subscribeWorkspaces = (onData: (rows: Workspace[]) => void, onError?: (e: unknown) => void) =>
  subscribeCollection<Workspace>('workspaces', [], onData, onError);

export const saveWorkspace = (workspace: Workspace) => setDoc(doc(requireDb(), 'workspaces', workspace.id), workspace);

// ---- Users (profiles + synced preferences) ----
export const subscribeUsers = (onData: (rows: UserDoc[]) => void, onError?: (e: unknown) => void) =>
  subscribeCollection<UserDoc>('users', [], onData, onError);

export const saveUser = (user: UserDoc) => setDoc(doc(requireDb(), 'users', user.id), user, { merge: true });

export const saveUserPreferences = (userId: string, preferences: Partial<UserPreferences>) =>
  setDoc(doc(requireDb(), 'users', userId), { preferences }, { merge: true });

// ---- Workspace members ----
export const subscribeWorkspaceMembers = (
  workspaceId: string,
  onData: (rows: WorkspaceMember[]) => void,
  onError?: (e: unknown) => void
) => subscribeCollection<WorkspaceMember>('workspaceMembers', [where('workspaceId', '==', workspaceId)], onData, onError);

export const subscribeAllWorkspaceMembers = (onData: (rows: WorkspaceMember[]) => void, onError?: (e: unknown) => void) =>
  subscribeCollection<WorkspaceMember>('workspaceMembers', [], onData, onError);

export const saveWorkspaceMember = (member: WorkspaceMember) =>
  setDoc(doc(requireDb(), 'workspaceMembers', member.id), member);

// ---- Projects ----
export const subscribeAllProjects = (onData: (rows: Project[]) => void, onError?: (e: unknown) => void) =>
  subscribeCollection<Project>('projects', [], onData, onError);

export const saveProject = (project: Project) => setDoc(doc(requireDb(), 'projects', project.id), project);

// ---- Boards ----
export const subscribeAllBoards = (onData: (rows: Board[]) => void, onError?: (e: unknown) => void) =>
  subscribeCollection<Board>('boards', [], onData, onError);

export const saveBoard = (board: Board) => setDoc(doc(requireDb(), 'boards', board.id), board);
export const updateBoard = (boardId: string, updates: Partial<Board>) =>
  updateDoc(doc(requireDb(), 'boards', boardId), updates);

// ---- Tickets ----
export const subscribeWorkspaceTickets = (
  workspaceId: string,
  onData: (rows: Ticket[]) => void,
  onError?: (e: unknown) => void
) => subscribeCollection<Ticket>('tickets', [where('workspaceId', '==', workspaceId)], onData, onError);

export const saveTicket = (ticket: Ticket) => setDoc(doc(requireDb(), 'tickets', ticket.id), ticket);
export const updateTicketDoc = (ticketId: string, updates: Partial<Ticket>) =>
  updateDoc(doc(requireDb(), 'tickets', ticketId), updates as DocumentData);
export const deleteTicketDoc = (ticketId: string) => deleteDoc(doc(requireDb(), 'tickets', ticketId));

// ---- Goals ----
export const subscribeWorkspaceGoals = (
  workspaceId: string,
  onData: (rows: Goal[]) => void,
  onError?: (e: unknown) => void
) => subscribeCollection<Goal>('goals', [where('workspaceId', '==', workspaceId)], onData, onError);

export const saveGoal = (goal: Goal) => setDoc(doc(requireDb(), 'goals', goal.id), goal);
export const updateGoalDoc = (goalId: string, updates: Partial<Goal>) =>
  updateDoc(doc(requireDb(), 'goals', goalId), updates as DocumentData);
export const deleteGoalDoc = (goalId: string) => deleteDoc(doc(requireDb(), 'goals', goalId));

// ---- Notifications ----
export const subscribeWorkspaceNotifications = (
  workspaceId: string,
  onData: (rows: AppNotification[]) => void,
  onError?: (e: unknown) => void
) => subscribeCollection<AppNotification>('notifications', [where('workspaceId', '==', workspaceId)], onData, onError);

export const saveNotification = (notification: AppNotification) =>
  setDoc(doc(requireDb(), 'notifications', notification.id), notification);
export const updateNotificationDoc = (id: string, updates: Partial<AppNotification>) =>
  updateDoc(doc(requireDb(), 'notifications', id), updates as DocumentData);

// ---- Share links ----
export const subscribeAllShareLinks = (onData: (rows: ShareLink[]) => void, onError?: (e: unknown) => void) =>
  subscribeCollection<ShareLink>('shareLinks', [], onData, onError);

export const saveShareLink = (link: ShareLink) => setDoc(doc(requireDb(), 'shareLinks', link.id), link);
export const updateShareLinkDoc = (id: string, updates: Partial<ShareLink>) =>
  updateDoc(doc(requireDb(), 'shareLinks', id), updates as DocumentData);

// ---- Calendar connections ----
export const subscribeAllCalendarConnections = (
  onData: (rows: CalendarConnection[]) => void,
  onError?: (e: unknown) => void
) => subscribeCollection<CalendarConnection>('calendarConnections', [], onData, onError);

export const saveCalendarConnection = (conn: CalendarConnection) =>
  setDoc(doc(requireDb(), 'calendarConnections', conn.id), conn);

/**
 * One-time seed: if the `workspaces` collection is empty (a brand-new Firestore database),
 * write the app's local seed dataset into it so the app has real backing data on first run.
 * Uses a handful of batched writes (Firestore batches cap at 500 ops each).
 */
export async function seedFirestoreIfEmpty(seed: {
  workspaces: Workspace[];
  workspaceMembers: WorkspaceMember[];
  projects: Project[];
  boards: Board[];
  tickets: Ticket[];
  goals: Goal[];
  notifications: AppNotification[];
  shareLinks: ShareLink[];
  calendarConnections: CalendarConnection[];
  users: User[];
}): Promise<boolean> {
  const database = requireDb();
  const existing = await getDocs(collection(database, 'workspaces'));
  if (!existing.empty) return false;

  const allWrites: { col: string; id: string; data: DocumentData }[] = [
    ...seed.users.map((u) => ({ col: 'users', id: u.id, data: u as DocumentData })),
    ...seed.workspaces.map((w) => ({ col: 'workspaces', id: w.id, data: w as DocumentData })),
    ...seed.workspaceMembers.map((m) => ({ col: 'workspaceMembers', id: m.id, data: m as DocumentData })),
    ...seed.projects.map((p) => ({ col: 'projects', id: p.id, data: p as DocumentData })),
    ...seed.boards.map((b) => ({ col: 'boards', id: b.id, data: b as DocumentData })),
    ...seed.tickets.map((t) => ({ col: 'tickets', id: t.id, data: t as DocumentData })),
    ...seed.goals.map((g) => ({ col: 'goals', id: g.id, data: g as DocumentData })),
    ...seed.notifications.map((n) => ({ col: 'notifications', id: n.id, data: n as DocumentData })),
    ...seed.shareLinks.map((s) => ({ col: 'shareLinks', id: s.id, data: s as DocumentData })),
    ...seed.calendarConnections.map((c) => ({ col: 'calendarConnections', id: c.id, data: c as DocumentData })),
  ];

  const BATCH_SIZE = 400;
  for (let i = 0; i < allWrites.length; i += BATCH_SIZE) {
    const batch = writeBatch(database);
    for (const w of allWrites.slice(i, i + BATCH_SIZE)) {
      batch.set(doc(database, w.col, w.id), w.data);
    }
    await batch.commit();
  }
  return true;
}
