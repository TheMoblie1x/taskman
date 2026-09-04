import React from 'react';
import { motion } from 'motion/react';
import { Ticket, Project, User, DensityMode } from '../types';
import { TicketTypeBadge, PriorityBadge } from './TicketBadge';
import { GoogleIcon } from './GoogleIcon';

interface TicketCardProps {
  ticket: Ticket;
  project?: Project | null;
  assignee?: User | null;
  onClick: () => void;
  onQuickMove?: (targetStatus: string) => void;
  availableStatuses?: { status: string; name: string }[];
  isDragging?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (e: React.MouseEvent) => void;
  density?: DensityMode;
  selectedTicketIds?: string[];
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  project,
  assignee,
  onClick,
  onQuickMove,
  availableStatuses = [],
  isDragging = false,
  isSelected = false,
  onToggleSelect,
  density = 'compact',
  selectedTicketIds = [],
}) => {
  const ticketKey = project ? `${project.key}-${ticket.ticketNumber}` : `TKT-${ticket.ticketNumber}`;

  // Check if due date is overdue or today
  const isOverdue = ticket.dueAt && new Date(ticket.dueAt) < new Date() && ticket.status !== 'DONE';
  const isDueToday =
    ticket.dueAt &&
    new Date(ticket.dueAt).toDateString() === new Date().toDateString() &&
    ticket.status !== 'DONE';

  const completedSubtasks = ticket.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = ticket.subtasks.length;

  const handleDragStart = (e: React.DragEvent) => {
    // If this card is part of a multi-selection, drag all selected cards
    const dragTicketIds = isSelected && selectedTicketIds.length > 1
      ? selectedTicketIds
      : [ticket.id];

    e.dataTransfer.setData('application/json', JSON.stringify({
      ticketId: ticket.id,
      ticketIds: dragTicketIds,
      sourceStatus: ticket.status
    }));
    e.dataTransfer.setData('text/plain', ticket.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      onToggleSelect?.(e);
    } else {
      onClick();
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect?.(e);
  };

  const isComfortable = density === 'comfortable';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -1.5, transition: { duration: 0.12, ease: 'easeOut' } }}
      whileTap={{ scale: 0.99 }}
      transition={{
        layout: { type: 'spring', stiffness: 550, damping: 36 },
        duration: 0.18,
      }}
      id={`ticket-card-${ticket.id}`}
      draggable
      // Native HTML5 drag-and-drop (for Kanban column moves), not Framer Motion's own
      // pointer-based `drag` gesture — motion.div's typings only expect the latter, so
      // the native DragEvent handler needs a local cast past that prop-type collision.
      onDragStart={handleDragStart as any}
      onClick={handleCardClick}
      className={`group card density-card cursor-grab active:cursor-grabbing select-none relative dark:bg-slate-850 dark:border-slate-700/80 ${
        isComfortable ? 'p-3.5 space-y-2' : 'p-2.5'
      } ${
        isSelected
          ? 'ring-2 ring-blue-500 bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-500 shadow-2xs'
          : isDragging
          ? 'opacity-40 border-dashed border-blue-400 dark:border-blue-500'
          : 'hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs'
      }`}
    >
      {/* Top row: Checkbox (Multi-select) + Type + Ticket Key + Priority */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Card Multi-select Checkbox */}
          <button
            type="button"
            onClick={handleCheckboxClick}
            className={`w-3.5 h-3.5 rounded border transition-all shrink-0 flex items-center justify-center ${
              isSelected
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-white/90 dark:bg-slate-800 opacity-0 group-hover:opacity-100 focus:opacity-100'
            }`}
            title={isSelected ? 'Deselect ticket (Shift+Click)' : 'Select ticket (Shift+Click)'}
          >
            {isSelected && <GoogleIcon name="check" size={10} weight={700} />}
          </button>

          <TicketTypeBadge type={ticket.type} showLabel={false} />
          <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {ticketKey}
          </span>
        </div>
        <PriorityBadge priority={ticket.priority} showLabel={false} />
      </div>

      {/* Title */}
      <h4
        className={`font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 ${
          isComfortable ? 'text-[13px] mb-2.5' : 'text-xs mb-2'
        }`}
      >
        {ticket.title}
      </h4>

      {/* Labels */}
      {ticket.labels && ticket.labels.length > 0 && (
        <div className={`flex flex-wrap gap-1 ${isComfortable ? 'mb-2.5' : 'mb-2'}`}>
          {ticket.labels.slice(0, 3).map((lbl) => (
            <span
              key={lbl}
              className="px-1.5 py-0.2 text-[9px] rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-transparent dark:border-slate-700/60"
            >
              {lbl}
            </span>
          ))}
          {ticket.labels.length > 3 && (
            <span className="px-1 text-[9px] text-slate-400 dark:text-slate-500">+{ticket.labels.length - 3}</span>
          )}
        </div>
      )}

      {/* Bottom Metadata row: Due date, Subtask progress, Calendar badge, Comments, Assignee */}
      <div className={`flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 ${
        isComfortable ? 'pt-2' : 'pt-1.5'
      }`}>
        <div className="flex items-center gap-2">
          {/* Due date */}
          {ticket.dueAt && (
            <span
              className={`flex items-center gap-1 font-medium ${
                isOverdue
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : isDueToday
                  ? 'text-amber-600 dark:text-amber-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title={`Due: ${new Date(ticket.dueAt).toLocaleDateString()}`}
            >
              <GoogleIcon name="calendar_today" size={10} />
              <span>
                {new Date(ticket.dueAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </span>
          )}

          {/* Subtasks */}
          {totalSubtasks > 0 && (
            <span
              className={`flex items-center gap-0.5 ${
                completedSubtasks === totalSubtasks ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
              }`}
              title={`${completedSubtasks} of ${totalSubtasks} subtasks completed`}
            >
              <GoogleIcon name="checklist" size={10} />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </span>
          )}

          {/* Attachments & comments count */}
          {ticket.comments.length > 0 && (
            <span className="flex items-center gap-0.5" title={`${ticket.comments.length} comments`}>
              <GoogleIcon name="chat_bubble" size={10} />
              <span>{ticket.comments.length}</span>
            </span>
          )}

          {ticket.calendarEvent && (
            <span
              className="flex items-center text-blue-600 dark:text-blue-400"
              title={`Linked to ${ticket.calendarEvent.provider === 'google' ? 'Google' : 'Outlook'} Calendar`}
            >
              <GoogleIcon name="auto_awesome" size={10} />
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        <div className="flex items-center gap-1 shrink-0">
          {assignee ? (
            <img
              src={assignee.avatarUrl}
              alt={assignee.name}
              title={`Assigned to ${assignee.name}`}
              className="w-4.5 h-4.5 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <span
              className="w-4.5 h-4.5 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-[9px] text-slate-400 dark:text-slate-500"
              title="Unassigned"
            >
              ?
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

