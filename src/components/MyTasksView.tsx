import React from 'react';
import { useApp } from '../context/AppContext';
import { Ticket } from '../types';
import { TicketTypeBadge, PriorityBadge } from './TicketBadge';
import { GoogleIcon } from './GoogleIcon';

export const MyTasksView: React.FC = () => {
  const { currentUser, workspaceTickets, projects, setSelectedTicketId, moveTicket } = useApp();

  // Filter tickets assigned to currentUser, scoped to the active workspace
  const myTickets = workspaceTickets.filter((t) => t.assigneeId === currentUser.id);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const overdueTickets: Ticket[] = [];
  const todayTickets: Ticket[] = [];
  const upcomingTickets: Ticket[] = [];
  const completedTickets: Ticket[] = [];

  myTickets.forEach((t) => {
    if (t.status === 'DONE') {
      completedTickets.push(t);
      return;
    }

    if (!t.dueAt) {
      upcomingTickets.push(t);
      return;
    }

    const dueDate = new Date(t.dueAt);
    if (dueDate < now) {
      overdueTickets.push(t);
    } else if (dueDate <= todayEnd) {
      todayTickets.push(t);
    } else {
      upcomingTickets.push(t);
    }
  });

  const renderSection = (title: string, list: Ticket[], badgeColor: string, icon: React.ReactNode) => {
    return (
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200">
          {icon}
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</h3>
          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${badgeColor}`}>
            {list.length}
          </span>
        </div>

        {list.length === 0 ? (
          <div className="py-2 px-3 text-xs text-slate-400 italic bg-slate-50/60 rounded border border-dashed border-slate-200">
            No tasks in {title.toLowerCase()}
          </div>
        ) : (
          <div className="space-y-1">
            {list.map((t) => {
              const proj = projects.find((p) => p.id === t.projectId);
              const ticketKey = proj ? `${proj.key}-${t.ticketNumber}` : `TKT-${t.ticketNumber}`;
              const isDone = t.status === 'DONE';

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className="card p-2 rounded hover:border-blue-400 hover:shadow-2xs transition-all flex items-center justify-between gap-2.5 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Quick complete checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveTicket(t.id, isDone ? 'TO_DO' : 'DONE');
                      }}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-transparent'
                      }`}
                      title={isDone ? 'Mark as Incomplete' : 'Mark as Done'}
                    >
                      <GoogleIcon name="check" size={12} weight={700} />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className="px-1 py-0.2 rounded text-[9px] font-bold text-white shadow-2xs"
                          style={{ backgroundColor: proj?.color || '#3b82f6' }}
                        >
                          {ticketKey}
                        </span>
                        <TicketTypeBadge type={t.type} showLabel={false} />
                        <span className={`text-xs font-semibold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-800 group-hover:text-blue-600'}`}>
                          {t.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span>Project: {proj?.name || 'General'}</span>
                        <span>•</span>
                        <span className="capitalize">{t.status.toLowerCase().replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <PriorityBadge priority={t.priority} />
                    {t.dueAt && (
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <GoogleIcon name="calendar_today" size={12} />
                        {new Date(t.dueAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                    <GoogleIcon name="chevron_right" size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-2.75rem)] overflow-y-auto bg-slate-50">
      <div className="max-w-4xl w-full mx-auto p-4">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-base font-bold text-slate-900">My Tasks</h1>
            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[10px] font-semibold rounded-full">
              {currentUser.name}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Cross-project aggregated tasks assigned to you. Prioritized by schedule and urgency.
          </p>
        </div>

        {/* Sections */}
        {renderSection(
          'Overdue',
          overdueTickets,
          'bg-rose-100 text-rose-700',
          <GoogleIcon name="error" size={16} className="text-rose-600" />
        )}

        {renderSection(
          'Today',
          todayTickets,
          'bg-amber-100 text-amber-800',
          <GoogleIcon name="schedule" size={16} className="text-amber-600" />
        )}

        {renderSection(
          'Upcoming',
          upcomingTickets,
          'bg-blue-100 text-blue-700',
          <GoogleIcon name="calendar_today" size={16} className="text-blue-600" />
        )}

        {completedTickets.length > 0 &&
          renderSection(
            'Completed',
            completedTickets,
            'bg-emerald-100 text-emerald-800',
            <GoogleIcon name="task_alt" size={16} className="text-emerald-600" />
          )}
      </div>
    </div>
  );
};
