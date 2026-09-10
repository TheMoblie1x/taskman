// Color coding for a ticket's workflow state, so the same status reads the same everywhere
// (board card, list row, detail drawer, shared-link view). Columns are user-defined and carry
// an arbitrary `status` key, so we match the seeded keys first and fall back to keyword
// matching on the key/name before defaulting to neutral slate.

export interface StatusColor {
  /** Small solid dot / accent — a literal Tailwind class so it survives purge. */
  dot: string;
  /** Pill background + text, light and dark. */
  pill: string;
}

type Palette = 'slate' | 'blue' | 'amber' | 'violet' | 'emerald' | 'rose';

const PALETTE: Record<Palette, StatusColor> = {
  slate: { dot: 'bg-slate-400', pill: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  blue: { dot: 'bg-blue-500', pill: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
  amber: { dot: 'bg-amber-500', pill: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
  violet: { dot: 'bg-violet-500', pill: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300' },
  emerald: { dot: 'bg-emerald-500', pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
  rose: { dot: 'bg-rose-500', pill: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' },
};

const KNOWN: Record<string, Palette> = {
  BACKLOG: 'slate',
  TO_DO: 'blue',
  TODO: 'blue',
  IN_PROGRESS: 'amber',
  REVIEW: 'violet',
  DONE: 'emerald',
  BLOCKED: 'rose',
};

const KEYWORDS: [RegExp, Palette][] = [
  [/BLOCK|HOLD|WAIT/, 'rose'],
  [/DONE|COMPLETE|CLOSED|SHIP|RESOLVED|MERGED/, 'emerald'],
  [/REVIEW|QA|TEST|APPROVAL|VERIFY/, 'violet'],
  [/PROGRESS|DOING|ACTIVE|WIP|STARTED|DEV/, 'amber'],
  [/TODO|READY|OPEN|NEXT|SELECTED/, 'blue'],
  [/BACKLOG|ICEBOX|IDEA|LATER|TRIAGE/, 'slate'],
];

export const statusColor = (statusKey: string, statusName?: string): StatusColor => {
  const key = (statusKey || '').toUpperCase();
  if (KNOWN[key]) return PALETTE[KNOWN[key]];
  const haystack = `${key} ${(statusName || '').toUpperCase()}`.replace(/[^A-Z]/g, '');
  for (const [re, palette] of KEYWORDS) {
    if (re.test(haystack)) return PALETTE[palette];
  }
  return PALETTE.slate;
};
