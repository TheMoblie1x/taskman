import React from 'react';
import { Goal } from '../types';
import { useApp } from '../context/AppContext';
import { GoogleIcon } from './GoogleIcon';
import { calculateGoalProgress, daysRemaining, GOAL_HEALTH_COLOR, GOAL_HEALTH_LABEL } from '../utils/goalUtils';

interface GoalCardProps {
  goal: Goal;
  onClick: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onClick }) => {
  const { tickets } = useApp();
  const progress = calculateGoalProgress(goal, tickets);
  const days = daysRemaining(goal.targetDate);
  const isOverdue = days < 0 && goal.status !== 'completed';

  return (
    <button
      onClick={onClick}
      className="card w-full text-left p-3.5 space-y-2.5 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug line-clamp-2">{goal.title}</h4>
        <span
          className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold border flex items-center gap-1 ${GOAL_HEALTH_COLOR[goal.health]}`}
        >
          {GOAL_HEALTH_LABEL[goal.health]}
        </span>
      </div>

      <div className="space-y-1">
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              goal.health === 'behind' || goal.health === 'overdue'
                ? 'bg-rose-500'
                : goal.health === 'at_risk'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          <span>
            {goal.currentValue}/{goal.targetValue} {goal.unit}
          </span>
          <span>{progress}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1">
          <GoogleIcon name="calendar_today" size={11} />
          {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        {goal.milestones.length > 0 && (
          <span className="flex items-center gap-1">
            <GoogleIcon name="flag" size={11} />
            {goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length}
          </span>
        )}
        <span className={isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
          {goal.status === 'completed' ? 'Completed' : isOverdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
        </span>
      </div>
    </button>
  );
};
