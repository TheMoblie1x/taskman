import { Goal, GoalHealth, GoalMeasurementType, Ticket } from '../types';

/**
 * Derives a goal's progress percentage from its measurement type.
 * Milestones and linked tickets are the source of truth when present — completing
 * them contributes to progress automatically, with no separate sync step needed.
 * Otherwise progress comes from the goal's own currentValue/targetValue (set via
 * check-ins or a manual update), which is how non-task-based goals stay adjustable.
 */
export function calculateGoalProgress(goal: Goal, tickets: Ticket[]): number {
  if (goal.status === 'completed') return 100;

  if (goal.measurementType === 'binary') {
    return goal.currentValue >= goal.targetValue ? 100 : 0;
  }

  // Only goals actually *measured* by milestones/tickets derive their progress from
  // completion. A percentage/number/count goal that merely has a milestone checklist
  // alongside its numeric target still reports the numeric progress, not the
  // milestone ratio — otherwise "78% done, 1 of 4 milestones checked" would show 25%.
  if (goal.measurementType === 'milestones') {
    if (goal.milestones.length > 0) {
      const completed = goal.milestones.filter((m) => m.completed).length;
      return Math.round((completed / goal.milestones.length) * 100);
    }
    if (goal.linkedTicketIds.length > 0) {
      const linked = tickets.filter((t) => goal.linkedTicketIds.includes(t.id));
      if (linked.length > 0) {
        const done = linked.filter((t) => t.status === 'DONE').length;
        return Math.round((done / linked.length) * 100);
      }
    }
  }

  if (!goal.targetValue) return 0;
  return Math.max(0, Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)));
}

/**
 * Health = how actual progress compares to the pace expected at this point in the
 * goal's timeframe. Deliberately simple (a linear expected-progress line) per the
 * "avoid making health calculation overly complicated in the MVP" requirement.
 */
export function calculateGoalHealth(goal: Goal, progressPercent: number): GoalHealth {
  if (goal.status === 'completed' || progressPercent >= 100) return 'completed';

  const now = Date.now();
  const start = new Date(goal.startDate).getTime();
  const target = new Date(goal.targetDate).getTime();

  if (now > target) return 'overdue';

  const totalMs = target - start;
  const elapsedMs = now - start;
  const expectedPercent = totalMs > 0 ? Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100)) : 100;
  const diff = progressPercent - expectedPercent;

  if (diff >= -15) return 'on_track';
  if (diff >= -30) return 'at_risk';
  return 'behind';
}

/** True when progress is derived from milestone/ticket completion rather than a manually-tracked number. */
export function isGoalProgressDerived(goal: Goal): boolean {
  return goal.measurementType === 'milestones' && (goal.milestones.length > 0 || goal.linkedTicketIds.length > 0);
}

export function daysRemaining(targetDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

export const GOAL_HEALTH_LABEL: Record<GoalHealth, string> = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  behind: 'Behind',
  completed: 'Completed',
  overdue: 'Overdue',
};

export const GOAL_HEALTH_COLOR: Record<GoalHealth, string> = {
  on_track: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  at_risk: 'text-amber-600 bg-amber-50 border-amber-200',
  behind: 'text-rose-600 bg-rose-50 border-rose-200',
  completed: 'text-blue-600 bg-blue-50 border-blue-200',
  overdue: 'text-rose-700 bg-rose-100 border-rose-300',
};

export const GOAL_MEASUREMENT_OPTIONS: { value: GoalMeasurementType; label: string; unitPlaceholder: string }[] = [
  { value: 'number', label: 'Number', unitPlaceholder: 'e.g. users' },
  { value: 'percentage', label: 'Percentage', unitPlaceholder: '%' },
  { value: 'count', label: 'Count', unitPlaceholder: 'e.g. articles' },
  { value: 'currency', label: 'Currency', unitPlaceholder: 'e.g. USD' },
  { value: 'duration', label: 'Duration', unitPlaceholder: 'e.g. hours' },
  { value: 'milestones', label: 'Milestones', unitPlaceholder: 'milestones' },
  { value: 'binary', label: 'Complete / Not Complete', unitPlaceholder: '' },
  { value: 'custom', label: 'Custom', unitPlaceholder: '' },
];

export interface SmartCheck {
  key: 'specific' | 'measurable' | 'achievable' | 'relevant' | 'timeBound';
  label: string;
  passed: boolean;
}

export function computeSmartChecks(input: {
  title: string;
  purpose: string;
  measurementType: GoalMeasurementType;
  targetValue: number;
  timeDedicatedHoursPerWeek?: number | null;
  startDate: string;
  targetDate: string;
}): SmartCheck[] {
  return [
    { key: 'specific', label: 'Specific', passed: input.title.trim().length >= 10 },
    {
      key: 'measurable',
      label: 'Measurable',
      passed: input.measurementType === 'binary' ? input.targetValue > 0 : input.targetValue > 0,
    },
    { key: 'achievable', label: 'Achievable', passed: !!input.timeDedicatedHoursPerWeek && input.timeDedicatedHoursPerWeek > 0 },
    { key: 'relevant', label: 'Relevant', passed: input.purpose.trim().length >= 10 },
    {
      key: 'timeBound',
      label: 'Time-bound',
      passed: !!input.startDate && !!input.targetDate && new Date(input.targetDate) > new Date(input.startDate),
    },
  ];
}

export function computeSmartScore(checks: SmartCheck[]): number {
  return checks.filter((c) => c.passed).length;
}
