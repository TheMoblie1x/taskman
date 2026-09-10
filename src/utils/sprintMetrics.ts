import { Sprint, Ticket } from '../types';

// All sprint math lives here as pure functions so SprintView stays presentational and the
// numbers are easy to reason about / test. Story points are the unit throughout; a ticket
// with no points counts as 0.

export const ticketPoints = (t: Ticket): number =>
  typeof t.storyPoints === 'number' && isFinite(t.storyPoints) ? t.storyPoints : 0;

export const sumPoints = (tickets: Ticket[]): number => tickets.reduce((n, t) => n + ticketPoints(t), 0);

const DAY_MS = 24 * 60 * 60 * 1000;

/** Midnight (local) of the given date, as a timestamp. */
const startOfDay = (d: Date | string): number => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};

/** Inclusive list of day timestamps from sprint start to sprint end. */
export const sprintDays = (sprint: Sprint): number[] => {
  const start = startOfDay(sprint.startAt);
  const end = startOfDay(sprint.endAt);
  if (!isFinite(start) || !isFinite(end) || end < start) return [];
  const days: number[] = [];
  for (let t = start; t <= end; t += DAY_MS) days.push(t);
  return days;
};

export interface BurndownPoint {
  day: number; // timestamp (midnight)
  ideal: number; // ideal remaining points
  remaining: number | null; // actual remaining; null for days still in the future
}

/**
 * Burndown for one sprint, derived purely from each ticket's `completedAt` against the sprint
 * date range (no historical snapshots). Committed scope is the sprint's current ticket set, so
 * mid-sprint scope changes are approximated rather than tracked.
 */
export const burndown = (sprint: Sprint, sprintTickets: Ticket[]): BurndownPoint[] => {
  const days = sprintDays(sprint);
  if (days.length === 0) return [];
  const committed = sumPoints(sprintTickets);
  const lastIdx = days.length - 1;
  const todayStart = startOfDay(new Date());

  return days.map((day, i) => {
    const ideal = committed * (1 - i / lastIdx);
    if (day > todayStart) return { day, ideal, remaining: null };
    const endOfDay = day + DAY_MS;
    const donePoints = sprintTickets.reduce((n, t) => {
      if (!t.completedAt) return n;
      const c = new Date(t.completedAt).getTime();
      return isFinite(c) && c < endOfDay ? n + ticketPoints(t) : n;
    }, 0);
    return { day, ideal, remaining: Math.max(0, committed - donePoints) };
  });
};

export interface VelocityBar {
  sprintId: string;
  name: string;
  committed: number;
  completed: number;
}

/** Committed vs completed points for each finished sprint, oldest first, capped to `limit`. */
export const velocity = (
  sprints: Sprint[],
  ticketsBySprint: (sprintId: string) => Ticket[],
  limit = 6
): VelocityBar[] =>
  sprints
    .filter((s) => s.status === 'completed')
    .sort((a, b) => new Date(a.endAt).getTime() - new Date(b.endAt).getTime())
    .slice(-limit)
    .map((s) => {
      const ts = ticketsBySprint(s.id);
      return {
        sprintId: s.id,
        name: s.name,
        committed: sumPoints(ts),
        completed: sumPoints(ts.filter((t) => !!t.completedAt)),
      };
    });

export interface Segment {
  key: string;
  label: string;
  points: number;
  count: number;
}

/** Points and ticket count grouped by a key extractor (status, assignee, type, ...). */
export const groupPoints = (
  tickets: Ticket[],
  keyOf: (t: Ticket) => string,
  labelOf: (key: string) => string
): Segment[] => {
  const map = new Map<string, Segment>();
  for (const t of tickets) {
    const key = keyOf(t);
    const seg = map.get(key) ?? { key, label: labelOf(key), points: 0, count: 0 };
    seg.points += ticketPoints(t);
    seg.count += 1;
    map.set(key, seg);
  }
  return [...map.values()].sort((a, b) => b.points - a.points);
};

export interface SprintSummary {
  committed: number;
  completed: number;
  remaining: number;
  ticketCount: number;
  doneCount: number;
  percentDone: number;
  daysTotal: number;
  daysElapsed: number;
  daysLeft: number;
}

export const sprintSummary = (sprint: Sprint, sprintTickets: Ticket[]): SprintSummary => {
  const committed = sumPoints(sprintTickets);
  const doneTickets = sprintTickets.filter((t) => !!t.completedAt);
  const completed = sumPoints(doneTickets);
  const days = sprintDays(sprint);
  const daysTotal = days.length;
  const todayStart = startOfDay(new Date());
  const daysElapsed = Math.min(daysTotal, Math.max(0, days.filter((d) => d <= todayStart).length));
  return {
    committed,
    completed,
    remaining: Math.max(0, committed - completed),
    ticketCount: sprintTickets.length,
    doneCount: doneTickets.length,
    percentDone: committed > 0 ? Math.round((completed / committed) * 100) : 0,
    daysTotal,
    daysElapsed,
    daysLeft: Math.max(0, daysTotal - daysElapsed),
  };
};

export const formatDay = (ts: number | string): string =>
  new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
