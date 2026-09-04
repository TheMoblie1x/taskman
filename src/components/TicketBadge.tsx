import React from 'react';
import { TicketType, TicketPriority } from '../types';
import { GoogleIcon } from './GoogleIcon';

export const TicketTypeBadge: React.FC<{ type: TicketType; showLabel?: boolean; className?: string }> = ({
  type,
  showLabel = true,
  className = '',
}) => {
  switch (type) {
    case 'bug':
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/70 shrink-0 ${className}`}
          title="Bug"
        >
          <GoogleIcon name="bug_report" size={12} className="text-rose-600 shrink-0" />
          {showLabel && <span>Bug</span>}
        </span>
      );
    case 'feature':
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200/70 shrink-0 ${className}`}
          title="Feature"
        >
          <GoogleIcon name="auto_awesome" size={12} className="text-violet-600 shrink-0" />
          {showLabel && <span>Feature</span>}
        </span>
      );
    case 'story':
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 shrink-0 ${className}`}
          title="Story"
        >
          <GoogleIcon name="bookmark" size={12} className="text-emerald-600 shrink-0" />
          {showLabel && <span>Story</span>}
        </span>
      );
    case 'epic':
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/70 shrink-0 ${className}`}
          title="Epic"
        >
          <GoogleIcon name="bolt" size={12} className="text-amber-600 shrink-0" />
          {showLabel && <span>Epic</span>}
        </span>
      );
    case 'task':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/70 shrink-0 ${className}`}
          title="Task"
        >
          <GoogleIcon name="checklist" size={12} className="text-blue-600 shrink-0" />
          {showLabel && <span>Task</span>}
        </span>
      );
  }
};

export const PriorityBadge: React.FC<{ priority: TicketPriority; showLabel?: boolean; className?: string }> = ({
  priority,
  showLabel = true,
  className = '',
}) => {
  switch (priority) {
    case 'highest':
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200/60 shrink-0 ${className}`}
          title="Highest Priority"
        >
          <GoogleIcon name="keyboard_double_arrow_up" size={12} className="text-red-600 shrink-0" />
          {showLabel && <span>Highest</span>}
        </span>
      );
    case 'high':
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0 ${className}`}
          title="High Priority"
        >
          <GoogleIcon name="expand_less" size={12} className="text-amber-600 shrink-0" />
          {showLabel && <span>High</span>}
        </span>
      );
    case 'medium':
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-orange-50 text-orange-600 border border-orange-200/60 shrink-0 ${className}`}
          title="Medium Priority"
        >
          <GoogleIcon name="drag_handle" size={12} className="text-orange-500 shrink-0" />
          {showLabel && <span>Medium</span>}
        </span>
      );
    case 'low':
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200/60 shrink-0 ${className}`}
          title="Low Priority"
        >
          <GoogleIcon name="expand_more" size={12} className="text-blue-500 shrink-0" />
          {showLabel && <span>Low</span>}
        </span>
      );
    case 'lowest':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 shrink-0 ${className}`}
          title="Lowest Priority"
        >
          <GoogleIcon name="keyboard_double_arrow_down" size={12} className="text-slate-500 shrink-0" />
          {showLabel && <span>Lowest</span>}
        </span>
      );
  }
};
