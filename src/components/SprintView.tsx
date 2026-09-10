import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { SprintStatus, Ticket } from '../types';
import { GoogleIcon } from './GoogleIcon';
import { statusColor } from '../utils/statusColor';
import { ChartCard, BurndownChart, VelocityChart, SegmentBars } from './SprintCharts';
import {
  burndown,
  velocity,
  groupPoints,
  sprintSummary,
  ticketPoints,
  formatDay,
} from '../utils/sprintMetrics';

const STATUS_BADGE: Record<SprintStatus, string> = {
  planned: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const addDaysISO = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

export const SprintView: React.FC = () => {
  const {
    activeProject,
    activeBoard,
    workspaceSprints,
    tickets,
    allUsers,
    createSprint,
    setSprintStatus,
    deleteSprint,
    setTicketSprint,
    setSelectedTicketId,
    userCanEdit,
  } = useApp();

  const projectSprints = useMemo(
    () =>
      workspaceSprints
        .filter((s) => s.projectId === activeProject?.id)
        .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()),
    [workspaceSprints, activeProject?.id]
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: '', goal: '', startAt: todayISO(), endAt: addDaysISO(14) });

  // Default to the active sprint (or the most recent) whenever the project or sprint list changes.
  useEffect(() => {
    if (selectedId && projectSprints.some((s) => s.id === selectedId)) return;
    const preferred = projectSprints.find((s) => s.status === 'active') ?? projectSprints[0];
    setSelectedId(preferred?.id ?? null);
  }, [projectSprints, selectedId]);

  const sprint = projectSprints.find((s) => s.id === selectedId) ?? null;
  const projectTickets = useMemo(
    () => tickets.filter((t) => t.projectId === activeProject?.id),
    [tickets, activeProject?.id]
  );
  const sprintTickets = useMemo(
    () => (sprint ? projectTickets.filter((t) => t.sprintId === sprint.id) : []),
    [projectTickets, sprint]
  );
  const backlog = useMemo(
    () => projectTickets.filter((t) => !t.sprintId && !t.completedAt),
    [projectTickets]
  );

  const columnName = (statusKey: string) =>
    activeBoard?.columns.find((c) => c.status === statusKey)?.name ?? statusKey;
  const userName = (id: string) =>
    id === 'unassigned' ? 'Unassigned' : allUsers.find((u) => u.id === id)?.name ?? 'Unknown';

  const summary = sprint ? sprintSummary(sprint, sprintTickets) : null;
  const burndownData = useMemo(() => (sprint ? burndown(sprint, sprintTickets) : []), [sprint, sprintTickets]);
  const velocityData = useMemo(
    () => velocity(projectSprints, (sid) => projectTickets.filter((t) => t.sprintId === sid)),
    [projectSprints, projectTickets]
  );
  const byStatus = useMemo(
    () => groupPoints(sprintTickets, (t) => t.status, columnName),
    [sprintTickets, activeBoard]
  );
  const byAssignee = useMemo(
    () => groupPoints(sprintTickets, (t) => t.assigneeId || 'unassigned', userName),
    [sprintTickets, allUsers]
  );

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
        Select a project to plan its sprints.
      </div>
    );
  }

  const submitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const created = createSprint({ projectId: activeProject.id, ...form, name: form.name.trim() });
    setSelectedId(created.id);
    setShowNew(false);
    setForm({ name: '', goal: '', startAt: todayISO(), endAt: addDaysISO(14) });
  };

  const cycleStatus: Record<SprintStatus, { next: SprintStatus; label: string; icon: string } | null> = {
    planned: { next: 'active', label: 'Start sprint', icon: 'play_arrow' },
    active: { next: 'completed', label: 'Complete sprint', icon: 'check_circle' },
    completed: { next: 'active', label: 'Reopen sprint', icon: 'restart_alt' },
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 sprint-report">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <GoogleIcon name="sprint" size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            {activeProject.name} · Sprint Planning
          </h2>
          {projectSprints.length > 0 && (
            <select
              value={selectedId ?? ''}
              onChange={(e) => setSelectedId(e.target.value)}
              className="no-print text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 font-medium text-slate-700 dark:text-slate-200"
            >
              {projectSprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.status}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-center gap-1.5 no-print">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <GoogleIcon name="print" size={14} />
            <span>Print report</span>
          </button>
          {userCanEdit && (
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              <GoogleIcon name="add" size={14} />
              <span>New sprint</span>
            </button>
          )}
        </div>
      </div>

      {projectSprints.length === 0 ? (
        <div className="p-10 text-center text-sm text-slate-400">
          No sprints for this project yet.
          {userCanEdit && (
            <button onClick={() => setShowNew(true)} className="ml-1 text-blue-600 font-semibold hover:underline">
              Create the first one
            </button>
          )}
        </div>
      ) : sprint && summary ? (
        <div className="p-4 space-y-4 max-w-6xl mx-auto">
          {/* Summary */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 p-3.5 break-inside-avoid">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white">{sprint.name}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${STATUS_BADGE[sprint.status]}`}>
                    {sprint.status}
                  </span>
                </div>
                {sprint.goal && <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{sprint.goal}</p>}
                <p className="text-[11px] text-slate-400 mt-1">
                  {formatDay(sprint.startAt)} – {formatDay(sprint.endAt)} · day {summary.daysElapsed}/{summary.daysTotal}
                  {sprint.status === 'active' && ` · ${summary.daysLeft} left`}
                </p>
              </div>
              {userCanEdit && (
                <div className="flex items-center gap-1.5 no-print">
                  {cycleStatus[sprint.status] && (
                    <button
                      onClick={() => setSprintStatus(sprint.id, cycleStatus[sprint.status]!.next)}
                      className="flex items-center gap-1 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
                    >
                      <GoogleIcon name={cycleStatus[sprint.status]!.icon} size={13} />
                      {cycleStatus[sprint.status]!.label}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${sprint.name}"? Its tickets return to the backlog.`)) deleteSprint(sprint.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600"
                    title="Delete sprint"
                  >
                    <GoogleIcon name="delete" size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Stat tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              {[
                ['Committed', `${summary.committed} pts`],
                ['Completed', `${summary.completed} pts`],
                ['Remaining', `${summary.remaining} pts`],
                ['Tickets', `${summary.doneCount}/${summary.ticketCount} done`],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 dark:bg-slate-800/60 rounded p-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{k}</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${summary.percentDone}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{summary.percentDone}% of committed points completed</p>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-3">
            <ChartCard title="Burndown" hint="ideal vs remaining points">
              <BurndownChart data={burndownData} />
            </ChartCard>
            <ChartCard title="Velocity" hint="last completed sprints">
              <VelocityChart bars={velocityData} />
            </ChartCard>
            <ChartCard title="Points by status">
              <SegmentBars segments={byStatus} dotOf={(key) => statusColor(key, columnName(key)).dot} />
            </ChartCard>
            <ChartCard title="Points by assignee">
              <SegmentBars segments={byAssignee} />
            </ChartCard>
          </div>

          {/* Planning */}
          <div className="grid md:grid-cols-2 gap-3">
            <SprintTicketList
              title={`In this sprint · ${sprintTickets.length}`}
              tickets={sprintTickets}
              empty="No tickets in this sprint yet."
              onOpen={setSelectedTicketId}
              action={
                userCanEdit
                  ? { icon: 'remove_circle_outline', label: 'Remove from sprint', run: (id) => setTicketSprint(id, null) }
                  : undefined
              }
              columnName={columnName}
            />
            <SprintTicketList
              title={`Project backlog · ${backlog.length}`}
              tickets={backlog}
              empty="Backlog is clear."
              onOpen={setSelectedTicketId}
              action={
                userCanEdit
                  ? { icon: 'add_circle_outline', label: 'Add to sprint', run: (id) => setTicketSprint(id, sprint.id) }
                  : undefined
              }
              columnName={columnName}
            />
          </div>
        </div>
      ) : null}

      {/* New sprint form */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 no-print" onClick={() => setShowNew(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitNew}
            className="bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-4 space-y-3"
          >
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">New sprint · {activeProject.name}</h3>
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Sprint name (e.g. Sprint 25)"
              className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <input
              value={form.goal}
              onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
              placeholder="Sprint goal (optional)"
              className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Start
                <input
                  type="date"
                  value={form.startAt}
                  onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))}
                  className="mt-0.5 w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded p-1.5 text-xs font-normal text-slate-700 dark:text-slate-200"
                />
              </label>
              <label className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                End
                <input
                  type="date"
                  value={form.endAt}
                  onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))}
                  className="mt-0.5 w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded p-1.5 text-xs font-normal text-slate-700 dark:text-slate-200"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setShowNew(false)} className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                Cancel
              </button>
              <button type="submit" disabled={!form.name.trim()} className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-semibold">
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

interface SprintTicketListProps {
  title: string;
  tickets: Ticket[];
  empty: string;
  onOpen: (id: string) => void;
  action?: { icon: string; label: string; run: (id: string) => void };
  columnName: (statusKey: string) => string;
}

const SprintTicketList: React.FC<SprintTicketListProps> = ({ title, tickets, empty, onOpen, action, columnName }) => (
  <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 break-inside-avoid">
    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {title}
    </div>
    <div className="divide-y divide-slate-50 dark:divide-slate-800/60 max-h-80 overflow-y-auto">
      {tickets.length === 0 ? (
        <p className="text-xs text-slate-400 px-3 py-4">{empty}</p>
      ) : (
        tickets.map((t) => {
          const c = statusColor(t.status, columnName(t.status));
          return (
            <div key={t.id} className="flex items-center gap-2 px-3 py-1.5 text-xs group">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} title={columnName(t.status)} />
              <button onClick={() => onOpen(t.id)} className="flex-1 min-w-0 text-left hover:text-blue-600 dark:hover:text-blue-400">
                <span className="font-mono text-[10px] text-slate-400 mr-1.5">#{t.ticketNumber}</span>
                <span className="text-slate-700 dark:text-slate-200 truncate">{t.title}</span>
              </button>
              <span className="text-[10px] font-semibold text-slate-400 shrink-0 tabular-nums">
                {ticketPoints(t)} pt
              </span>
              {action && (
                <button
                  onClick={() => action.run(t.id)}
                  title={action.label}
                  className="p-0.5 text-slate-300 hover:text-blue-600 shrink-0 no-print"
                >
                  <GoogleIcon name={action.icon} size={15} />
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  </div>
);
