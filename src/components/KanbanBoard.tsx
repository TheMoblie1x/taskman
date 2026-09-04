import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { BoardColumn, Ticket } from '../types';
import { TicketCard } from './TicketCard';
import { PoweredByMobile1x } from './PoweredByMobile1x';
import { GoogleIcon } from './GoogleIcon';

interface KanbanBoardProps {
  onOpenCreateTicket: (defaultStatus?: string) => void;
  onOpenShareModal: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  onOpenCreateTicket,
  onOpenShareModal,
}) => {
  const {
    activeProject,
    activeBoard,
    addColumn,
    updateColumn,
    deleteColumn,
    tickets,
    moveTicket,
    moveTickets,
    selectedTicketIds,
    setSelectedTicketIds,
    toggleTicketSelection,
    clearTicketSelection,
    density,
    allUsers,
    setSelectedTicketId,
    filters,
    setFilters,
    resetFilters,
    searchQuery,
    setSearchQuery,
    userCanEdit,
    activeView,
    setActiveView,
  } = useApp();

  const [activeDropColumn, setActiveDropColumn] = useState<string | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [columnMenuOpenId, setColumnMenuOpenId] = useState<string | null>(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [quickAddColumnStatus, setQuickAddColumnStatus] = useState<string | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');

  // Clear selection on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedTicketIds.length > 0) {
        clearTicketSelection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTicketIds, clearTicketSelection]);

  // Apply filters and search
  const filteredTickets = tickets.filter((t) => {
    if (activeProject && t.projectId !== activeProject.id) return false;
    if (filters.assigneeId && t.assigneeId !== filters.assigneeId) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.type && t.type !== filters.type) return false;
    if (filters.status && t.status !== filters.status) return false;
    if (filters.label && !t.labels.includes(filters.label)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const ticketKey = activeProject ? `${activeProject.key}-${t.ticketNumber}`.toLowerCase() : '';
      const matchKey = ticketKey.includes(q);
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchLabel = t.labels.some((l) => l.toLowerCase().includes(q));
      if (!matchKey && !matchTitle && !matchDesc && !matchLabel) return false;
    }

    return true;
  });

  const columns = activeBoard?.columns || [];

  const handleDragOver = (e: React.DragEvent, colStatus: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== colStatus) {
      setActiveDropColumn(colStatus);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only reset if leaving the column target
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setActiveDropColumn(null);

    // Check if JSON payload contains multiple ticket IDs
    try {
      const raw = e.dataTransfer.getData('application/json');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.ticketIds && Array.isArray(data.ticketIds) && data.ticketIds.length > 0) {
          moveTickets(data.ticketIds, targetStatus);
          return;
        }
      }
    } catch (err) {
      // ignore
    }

    const ticketId = e.dataTransfer.getData('text/plain');
    if (ticketId) {
      if (selectedTicketIds.includes(ticketId) && selectedTicketIds.length > 1) {
        moveTickets(selectedTicketIds, targetStatus);
      } else {
        moveTicket(ticketId, targetStatus);
      }
    }
  };

  const handleQuickAddSubmit = (e: React.FormEvent, status: string) => {
    e.preventDefault();
    if (!quickAddTitle.trim()) return;
    onOpenCreateTicket(status);
    setQuickAddColumnStatus(null);
    setQuickAddTitle('');
  };

  const handleAddColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newColumnName.trim()) {
      addColumn(newColumnName.trim(), newColumnName.trim().toUpperCase().replace(/\s+/g, '_'));
      setNewColumnName('');
      setIsAddingColumn(false);
    }
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length + (searchQuery ? 1 : 0);
  const isComfortable = density === 'comfortable';

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-2.75rem)] overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Top Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2.5 shrink-0 transition-colors">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* View Toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-semibold">
            <button
              onClick={() => setActiveView('kanban')}
              className={`px-2.5 py-0.5 rounded transition-all ${
                activeView === 'kanban' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`px-2.5 py-0.5 rounded transition-all ${
                activeView === 'list' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              List View
            </button>
          </div>

          <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 hidden sm:block" />

          {/* Assignee Filter */}
          <select
            value={filters.assigneeId || ''}
            onChange={(e) => setFilters((f) => ({ ...f, assigneeId: e.target.value || null }))}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Assignees</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority || ''}
            onChange={(e) => setFilters((f) => ({ ...f, priority: (e.target.value as any) || null }))}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="highest">Highest</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="lowest">Lowest</option>
          </select>

          {/* Type Filter */}
          <select
            value={filters.type || ''}
            onChange={(e) => setFilters((f) => ({ ...f, type: (e.target.value as any) || null }))}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="task">Task</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="story">Story</option>
            <option value="epic">Epic</option>
          </select>

          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium px-1.5 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <GoogleIcon name="close" size={14} />
              Reset filters ({activeFiltersCount})
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Powered by mobile1x badge */}
          <PoweredByMobile1x variant="badge" className="hidden lg:inline-flex" />

          {/* Share Board Button */}
          <button
            id="board-share-btn"
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors"
          >
            <GoogleIcon name="share" size={14} className="text-blue-600 dark:text-blue-400" />
            <span>Share Board</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns Canvas */}
      <div className={`flex-1 overflow-x-auto overflow-y-hidden ${isComfortable ? 'p-4 gap-4' : 'p-3 gap-2.5'} flex items-start select-none relative`}>
        {columns.map((col) => {
          const colTickets = filteredTickets.filter((t) => t.status === col.status);
          const isOverWip = col.wipLimit !== null && col.wipLimit !== undefined && colTickets.length > col.wipLimit;
          const isDropTarget = activeDropColumn === col.status;
          const colTicketIds = colTickets.map((t) => t.id);
          const allColTicketsSelected = colTicketIds.length > 0 && colTicketIds.every((id) => selectedTicketIds.includes(id));

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`kanban-column ${isComfortable ? 'w-76 sm:w-80' : 'w-68 sm:w-72'} shrink-0 rounded-md border flex flex-col max-h-full transition-all dark:bg-slate-900/90 ${
                isDropTarget
                  ? 'border-blue-400 ring-2 ring-blue-100 dark:ring-blue-900/50 bg-blue-50/40 dark:bg-blue-950/30'
                  : isOverWip
                  ? 'border-amber-300 dark:border-amber-600 ring-1 ring-amber-200/70 dark:ring-amber-900/50'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Column Header: Highlighting in Amber when WIP exceeded */}
              <div
                className={`p-2 pb-1.5 flex items-center justify-between border-b transition-colors ${
                  isOverWip
                    ? 'bg-amber-100/95 dark:bg-amber-950/80 border-amber-300 dark:border-amber-600 text-amber-950 dark:text-amber-200 shadow-2xs'
                    : 'border-slate-200/80 dark:border-slate-800/90 bg-slate-100/80 dark:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className={`text-xs font-bold uppercase tracking-wider truncate ${isOverWip ? 'text-amber-950 dark:text-amber-200 font-black' : 'text-slate-800 dark:text-slate-200'}`}>
                    {col.name}
                  </h3>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    isOverWip ? 'bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100 font-black' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {colTickets.length}
                  </span>
                  {col.wipLimit !== null && col.wipLimit !== undefined && (
                    <button
                      type="button"
                      onClick={() => {
                        const newLimit = prompt(
                          `Set WIP Limit for "${col.name}" (leave empty for none):`,
                          col.wipLimit ? String(col.wipLimit) : ''
                        );
                        if (newLimit !== null) {
                          const trimmed = newLimit.trim();
                          const parsed = parseInt(trimmed, 10);
                          updateColumn(col.id, { wipLimit: trimmed === '' || isNaN(parsed) ? null : Math.max(1, parsed) });
                        }
                      }}
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold flex items-center gap-1 border transition-all ${
                        isOverWip
                          ? 'bg-amber-200/90 text-amber-900 border-amber-400 hover:bg-amber-300 shadow-2xs'
                          : 'bg-slate-200/70 text-slate-600 border-slate-300 hover:bg-slate-300/80'
                      }`}
                      title={isOverWip ? `⚠️ WIP limit exceeded (${colTickets.length}/${col.wipLimit})! Click to edit limit.` : `WIP Limit: ${col.wipLimit}. Click to edit.`}
                    >
                      {isOverWip && <GoogleIcon name="warning" size={10} className="text-amber-700 shrink-0" />}
                      Limit {col.wipLimit}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-0.5">
                  {/* Select all in column button */}
                  {colTickets.length > 0 && (
                    <button
                      onClick={() => {
                        if (allColTicketsSelected) {
                          setSelectedTicketIds((prev) => prev.filter((id) => !colTicketIds.includes(id)));
                        } else {
                          setSelectedTicketIds((prev) => Array.from(new Set([...prev, ...colTicketIds])));
                        }
                      }}
                      className={`p-1 rounded transition-colors ${
                        allColTicketsSelected
                          ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                      }`}
                      title={allColTicketsSelected ? `Deselect all ${colTickets.length} tickets in ${col.name}` : `Select all ${colTickets.length} tickets in ${col.name}`}
                    >
                      <GoogleIcon name="checklist" size={14} />
                    </button>
                  )}

                  <button
                    onClick={() => onOpenCreateTicket(col.status)}
                    className="p-1 text-slate-500 hover:text-blue-600 hover:bg-white rounded transition-colors"
                    title="Add ticket in this column"
                  >
                    <GoogleIcon name="add" size={14} />
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setColumnMenuOpenId(columnMenuOpenId === col.id ? null : col.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 hover:bg-white rounded transition-colors"
                    >
                      <GoogleIcon name="more_vert" size={14} />
                    </button>

                    {columnMenuOpenId === col.id && (
                      <div className="absolute right-0 mt-1 w-44 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-30">
                        <button
                          onClick={() => {
                            const newLimit = prompt(
                              `Set WIP Limit for "${col.name}" (leave empty for none):`,
                              col.wipLimit ? String(col.wipLimit) : ''
                            );
                            if (newLimit !== null) {
                              const trimmed = newLimit.trim();
                              const parsed = parseInt(trimmed, 10);
                              updateColumn(col.id, { wipLimit: trimmed === '' || isNaN(parsed) ? null : Math.max(1, parsed) });
                            }
                            setColumnMenuOpenId(null);
                          }}
                          className="w-full text-left px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                        >
                          <span>Set WIP Limit</span>
                          <span className="text-[10px] text-slate-400 font-mono">{col.wipLimit ? col.wipLimit : 'None'}</span>
                        </button>
                        {colTickets.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedTicketIds((prev) => Array.from(new Set([...prev, ...colTicketIds])));
                              setColumnMenuOpenId(null);
                            }}
                            className="w-full text-left px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            Select all tickets ({colTickets.length})
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const newName = prompt('Rename Column:', col.name);
                            if (newName && newName.trim()) {
                              updateColumn(col.id, { name: newName.trim() });
                            }
                            setColumnMenuOpenId(null);
                          }}
                          className="w-full text-left px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          Rename
                        </button>
                        {columns.length > 2 && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete column "${col.name}"?`)) {
                                deleteColumn(col.id);
                              }
                              setColumnMenuOpenId(null);
                            }}
                            className="w-full text-left px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50"
                          >
                            Delete Column
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tickets List inside Column */}
              <div className={`flex-1 overflow-y-auto p-1.5 min-h-[120px] ${isComfortable ? 'space-y-2.5' : 'space-y-2'}`}>
                {colTickets.length === 0 ? (
                  <div className="h-20 border border-dashed border-slate-300 dark:border-slate-800 rounded-md flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                    No tickets in {col.name}
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout" initial={false}>
                    {colTickets.map((t) => {
                      const assignee = allUsers.find((u) => u.id === t.assigneeId);
                      return (
                        <TicketCard
                          key={t.id}
                          ticket={t}
                          project={activeProject}
                          assignee={assignee}
                          onClick={() => setSelectedTicketId(t.id)}
                          availableStatuses={columns.map((c) => ({ status: c.status, name: c.name }))}
                          onQuickMove={(newStatus) => moveTicket(t.id, newStatus)}
                          isSelected={selectedTicketIds.includes(t.id)}
                          onToggleSelect={() => toggleTicketSelection(t.id)}
                          density={density}
                          selectedTicketIds={selectedTicketIds}
                        />
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>

              {/* Column Bottom Action: Fast Ticket Capture */}
              <div className="p-1.5 border-t border-slate-200/60 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50">
                {quickAddColumnStatus === col.status ? (
                  <div className="bg-white p-2 rounded-md border border-slate-300 shadow-2xs space-y-1.5">
                    <input
                      type="text"
                      value={quickAddTitle}
                      onChange={(e) => setQuickAddTitle(e.target.value)}
                      placeholder="What needs to be done?"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleQuickAddSubmit(e, col.status);
                        if (e.key === 'Escape') setQuickAddColumnStatus(null);
                      }}
                      className="w-full text-xs px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => onOpenCreateTicket(col.status)}
                        className="text-[11px] text-blue-600 hover:underline"
                      >
                        More details...
                      </button>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setQuickAddColumnStatus(null)}
                          className="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={(e) => handleQuickAddSubmit(e, col.status)}
                          className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenCreateTicket(col.status)}
                    className="w-full text-left py-1 px-1.5 rounded text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-colors flex items-center gap-1"
                  >
                    <GoogleIcon name="add" size={14} className="text-slate-400" />
                    <span>Add ticket</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Column Button */}
        <div className={`${isComfortable ? 'w-76 sm:w-80' : 'w-68 sm:w-72'} shrink-0`}>
          {!isAddingColumn ? (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="w-full py-2.5 px-3 rounded-md border border-dashed border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all flex items-center justify-center gap-1.5"
            >
              <GoogleIcon name="add" size={14} className="text-slate-400" />
              <span>Add column</span>
            </button>
          ) : (
            <form onSubmit={handleAddColumnSubmit} className="bg-white dark:bg-slate-800 p-2.5 rounded-md border border-slate-300 dark:border-slate-700 shadow-2xs space-y-1.5">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Column title (e.g. QA, Blocked)..."
                autoFocus
                className="w-full text-xs px-2 py-1 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => setIsAddingColumn(false)}
                  className="px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newColumnName.trim()}
                  className="px-2.5 py-0.5 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Column
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Floating Multi-Select Bulk Actions Bar with Buttery Smooth Animation */}
      <AnimatePresence>
        {selectedTicketIds.length > 0 && (
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 dark:bg-slate-850/95 backdrop-blur-md text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700/80 flex items-center gap-3 max-w-[94vw] overflow-x-auto"
          >
            <div className="flex items-center gap-2 pr-3 border-r border-slate-700 shrink-0">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
                {selectedTicketIds.length}
              </span>
              <span className="text-xs font-semibold whitespace-nowrap">
                {selectedTicketIds.length === 1 ? '1 ticket selected' : `${selectedTicketIds.length} tickets selected`}
              </span>
            </div>

            {/* Move to columns */}
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

            {/* Select all / Deselect */}
            <button
              onClick={() => {
                const visibleIds = filteredTickets.map((t) => t.id);
                setSelectedTicketIds(visibleIds);
              }}
              className="text-xs text-slate-400 hover:text-white transition-colors whitespace-nowrap px-1 shrink-0"
              title="Select all visible tickets"
            >
              Select all ({filteredTickets.length})
            </button>

            <button
              onClick={clearTicketSelection}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
              title="Clear selection (Esc)"
            >
              <GoogleIcon name="close" size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
