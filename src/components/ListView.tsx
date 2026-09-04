import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Ticket, TicketPriority } from '../types';
import { TicketTypeBadge, PriorityBadge } from './TicketBadge';
import { GoogleIcon } from './GoogleIcon';

export const ListView: React.FC = () => {
  const {
    activeProject,
    tickets,
    allUsers,
    setSelectedTicketId,
    activeBoard,
    moveTicket,
    moveTickets,
    selectedTicketIds,
    setSelectedTicketIds,
    toggleTicketSelection,
    clearTicketSelection,
    density,
    filters,
    searchQuery,
  } = useApp();

  const [sortField, setSortField] = useState<'ticketNumber' | 'priority' | 'status' | 'dueAt'>('ticketNumber');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const columns = activeBoard?.columns || [];
  const isComfortable = density === 'comfortable';

  // Filter tickets
  const filteredTickets = tickets.filter((t) => {
    if (activeProject && t.projectId !== activeProject.id) return false;
    if (filters.assigneeId && t.assigneeId !== filters.assigneeId) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.type && t.type !== filters.type) return false;
    if (filters.status && t.status !== filters.status) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const ticketKey = activeProject ? `${activeProject.key}-${t.ticketNumber}`.toLowerCase() : '';
      return ticketKey.includes(q) || t.title.toLowerCase().includes(q);
    }
    return true;
  });

  const priorityWeight: Record<TicketPriority, number> = {
    highest: 5,
    high: 4,
    medium: 3,
    low: 2,
    lowest: 1,
  };

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'ticketNumber') {
      cmp = a.ticketNumber - b.ticketNumber;
    } else if (sortField === 'priority') {
      cmp = priorityWeight[a.priority] - priorityWeight[b.priority];
    } else if (sortField === 'status') {
      cmp = a.status.localeCompare(b.status);
    } else if (sortField === 'dueAt') {
      const d1 = a.dueAt ? new Date(a.dueAt).getTime() : 0;
      const d2 = b.dueAt ? new Date(b.dueAt).getTime() : 0;
      cmp = d1 - d2;
    }
    return sortAsc ? cmp : -cmp;
  });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-2.75rem)] overflow-hidden bg-white dark:bg-slate-950 transition-colors">
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {activeProject?.name || 'Project'} Issues List
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {filteredTickets.length} issues in Jira-style tabular view
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[9px]">
            <tr>
              <th className={`w-8 ${isComfortable ? 'py-2 px-2.5' : 'py-1 px-2'}`}>
                <input
                  type="checkbox"
                  checked={sortedTickets.length > 0 && sortedTickets.every((t) => selectedTicketIds.includes(t.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTicketIds(sortedTickets.map((t) => t.id));
                    } else {
                      clearTicketSelection();
                    }
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                />
              </th>
              <th className={`${isComfortable ? 'py-2.5 px-3' : 'py-1.5 px-2.5'} w-12`}>Type</th>
              <th
                onClick={() => toggleSort('ticketNumber')}
                className={`${isComfortable ? 'py-2.5 px-3' : 'py-1.5 px-2.5'} cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 w-24`}
              >
                <div className="flex items-center gap-1">
                  <span>Key</span>
                  <GoogleIcon name="swap_vert" size={10} />
                </div>
              </th>
              <th className={`${isComfortable ? 'py-2.5 px-3' : 'py-1.5 px-2.5'}`}>Summary</th>
              <th
                onClick={() => toggleSort('status')}
                className={`${isComfortable ? 'py-2.5 px-3' : 'py-1.5 px-2.5'} cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 w-32`}
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <GoogleIcon name="swap_vert" size={10} />
                </div>
              </th>
              <th
                onClick={() => toggleSort('priority')}
                className={`${isComfortable ? 'py-2.5 px-3' : 'py-1.5 px-2.5'} cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 w-24`}
              >
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  <GoogleIcon name="swap_vert" size={10} />
                </div>
              </th>
              <th className={`${isComfortable ? 'py-2.5 px-3' : 'py-1.5 px-2.5'} w-36`}>Assignee</th>
              <th
                onClick={() => toggleSort('dueAt')}
                className={`${isComfortable ? 'py-2.5 px-3' : 'py-1.5 px-2.5'} cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 w-28`}
              >
                <div className="flex items-center gap-1">
                  <span>Due Date</span>
                  <GoogleIcon name="swap_vert" size={10} />
                </div>
              </th>
              <th className={`${isComfortable ? 'py-2.5 px-3' : 'py-1.5 px-2.5'} w-24`}>Subtasks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {sortedTickets.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  No issues found matching your filters.
                </td>
              </tr>
            ) : (
              sortedTickets.map((t) => {
                const assignee = allUsers.find((u) => u.id === t.assigneeId);
                const ticketKey = activeProject ? `${activeProject.key}-${t.ticketNumber}` : `TKT-${t.ticketNumber}`;
                const completedSubs = t.subtasks.filter((s) => s.completed).length;
                const isSelected = selectedTicketIds.includes(t.id);
                const cellPad = isComfortable ? 'py-2.5 px-3' : 'py-1 px-2.5';

                return (
                  <tr
                    key={t.id}
                    onClick={(e) => {
                      if (e.shiftKey) {
                        toggleTicketSelection(t.id);
                      } else {
                        setSelectedTicketId(t.id);
                      }
                    }}
                    className={`cursor-pointer transition-colors group ${
                      isSelected ? 'bg-blue-50/80 dark:bg-blue-950/50 font-medium' : 'hover:bg-blue-50/30 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <td className={`w-8 ${isComfortable ? 'py-2 px-2.5' : 'py-1 px-2'}`} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleTicketSelection(t.id)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                    </td>
                    <td className={cellPad}>
                      <TicketTypeBadge type={t.type} showLabel={false} />
                    </td>
                    <td className={`${cellPad} font-mono font-bold text-[11px] text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400`}>
                      {ticketKey}
                    </td>
                    <td className={`${cellPad} font-medium text-slate-800 dark:text-slate-200`}>
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-md text-xs">{t.title}</span>
                        {t.calendarEvent && (
                          <span title="Synced to Calendar" className="text-blue-600 dark:text-blue-400">
                            <GoogleIcon name="auto_awesome" size={10} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={cellPad}>
                      <select
                        value={t.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => moveTicket(t.id, e.target.value)}
                        className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 font-medium text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-blue-500"
                      >
                        {columns.map((col) => (
                          <option key={col.id} value={col.status}>
                            {col.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className={cellPad}>
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className={cellPad}>
                      {assignee ? (
                        <div className="flex items-center gap-1.5">
                          <img src={assignee.avatarUrl} alt="" className="w-4.5 h-4.5 rounded-full object-cover" />
                          <span className="truncate text-xs text-slate-800 dark:text-slate-200">{assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className={`${cellPad} text-slate-500 dark:text-slate-400 text-xs`}>
                      {t.dueAt ? (
                        new Date(t.dueAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                      )}
                    </td>
                    <td className={`${cellPad} text-slate-500 dark:text-slate-400 text-xs`}>
                      {t.subtasks.length > 0 ? (
                        <span className="flex items-center gap-1">
                          <GoogleIcon name="checklist" size={10} className="text-slate-400" />
                          <span>
                            {completedSubs}/{t.subtasks.length}
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Floating Bulk Action Bar in List View */}
        <AnimatePresence>
          {selectedTicketIds.length > 0 && (
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700/80 flex items-center gap-3 max-w-[94vw] overflow-x-auto"
            >
              <div className="flex items-center gap-2 pr-3 border-r border-slate-700 shrink-0">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
                  {selectedTicketIds.length}
                </span>
                <span className="text-xs font-semibold whitespace-nowrap">
                  {selectedTicketIds.length === 1 ? '1 ticket selected' : `${selectedTicketIds.length} tickets selected`}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-slate-400 font-medium">Move to:</span>
                <div className="flex items-center gap-1">
                  {columns.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => moveTickets(selectedTicketIds, c.status)}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-blue-600 rounded-md border border-slate-700 hover:border-blue-500 text-slate-200 hover:text-white transition-all whitespace-nowrap shadow-2xs"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-4 w-px bg-slate-700 mx-1 shrink-0" />

              <button
                onClick={clearTicketSelection}
                className="text-xs text-slate-400 hover:text-white transition-colors whitespace-nowrap px-1 shrink-0"
              >
                Clear
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
