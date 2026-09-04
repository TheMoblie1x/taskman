import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { GoalHealth } from '../types';
import { GoogleIcon } from './GoogleIcon';
import { GoalCard } from './GoalCard';
import { calculateGoalProgress, daysRemaining } from '../utils/goalUtils';

type GoalFilter = 'all' | 'active' | GoalHealth | 'overdue';

const FILTERS: { value: GoalFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'on_track', label: 'On Track' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'behind', label: 'Behind' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
];

interface GoalsViewProps {
  onOpenCreateGoal: () => void;
  onOpenGoal: (goalId: string) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ onOpenCreateGoal, onOpenGoal }) => {
  const { workspaceGoals, tickets, currentUser } = useApp();
  const [filter, setFilter] = useState<GoalFilter>('all');

  const filteredGoals = useMemo(() => {
    return workspaceGoals.filter((g) => {
      if (filter === 'all') return true;
      if (filter === 'active') return g.status === 'active';
      if (filter === 'overdue') return daysRemaining(g.targetDate) < 0 && g.status !== 'completed';
      return g.health === filter;
    });
  }, [workspaceGoals, filter]);

  const activeGoals = workspaceGoals.filter((g) => g.status === 'active');
  const overdueCount = workspaceGoals.filter((g) => daysRemaining(g.targetDate) < 0 && g.status !== 'completed').length;
  const atRiskCount = workspaceGoals.filter((g) => g.health === 'at_risk' || g.health === 'behind').length;
  const avgProgress = activeGoals.length
    ? Math.round(activeGoals.reduce((sum, g) => sum + calculateGoalProgress(g, tickets), 0) / activeGoals.length)
    : 0;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-2.75rem)] overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-5xl w-full mx-auto p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-base font-bold text-slate-900 dark:text-white">Goals</h1>
              <span className="px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[10px] font-semibold rounded-full">
                {currentUser.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              High-level objectives connected to the actual work required to achieve them.
            </p>
          </div>
          <button
            onClick={onOpenCreateGoal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0"
          >
            <GoogleIcon name="add" size={14} />
            <span>New Goal</span>
          </button>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          <div className="card p-3">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Active</div>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{activeGoals.length}</div>
          </div>
          <div className="card p-3">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Avg Progress</div>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{avgProgress}%</div>
          </div>
          <div className="card p-3">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">At Risk / Behind</div>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{atRiskCount}</div>
          </div>
          <div className="card p-3">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Overdue</div>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{overdueCount}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                filter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Goal grid */}
        {filteredGoals.length === 0 ? (
          <div className="py-10 px-3 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            No goals match this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onClick={() => onOpenGoal(goal.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
