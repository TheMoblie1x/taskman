import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TicketPriority, TicketType } from '../types';
import { GoogleIcon } from './GoogleIcon';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: string;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  defaultStatus = 'TO_DO',
}) => {
  const {
    activeProject,
    workspaceProjects,
    setActiveProjectId,
    activeBoard,
    allUsers,
    createTicket,
    setSelectedTicketId,
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TicketType>('task');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [status, setStatus] = useState<string>(defaultStatus);
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueAt, setDueAt] = useState('');
  const [storyPoints, setStoryPoints] = useState('');
  const [estimatedEffort, setEstimatedEffort] = useState('');
  const [labelsInput, setLabelsInput] = useState('');

  if (!isOpen) return null;

  const columns = activeBoard?.columns || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const labels = labelsInput
      .split(',')
      .map((l) => l.trim().toLowerCase())
      .filter(Boolean);

    const newTicket = createTicket({
      title: title.trim(),
      description: description.trim(),
      type,
      priority,
      status: status || 'TO_DO',
      assigneeId: assigneeId || null,
      dueAt: dueAt ? new Date(dueAt + 'T17:00:00Z').toISOString() : null,
      storyPoints: storyPoints ? parseInt(storyPoints, 10) : null,
      estimatedEffort: estimatedEffort.trim() || null,
      labels,
    });

    onClose();
    setSelectedTicketId(newTicket.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-2xs">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-bold">
              <GoogleIcon name="add" size={14} />
            </div>
            <h3 className="font-bold text-slate-800 text-xs">Create Issue</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
          >
            <GoogleIcon name="close" size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          {/* Project & Type */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                Project *
              </label>
              <select
                value={activeProject?.id || ''}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 font-medium text-xs"
              >
                {workspaceProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.key})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                Issue Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TicketType)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 font-medium capitalize text-xs"
              >
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="story">Story</option>
                <option value="epic">Epic</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fix BLE connection timeout"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the objective, reproduction steps, or specifications..."
              className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.status}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium capitalize"
              >
                <option value="highest">Highest</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="lowest">Lowest</option>
              </select>
            </div>
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
              >
                <option value="">Unassigned</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
              >
              </input>
            </div>
          </div>

          {/* Effort & Labels */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Labels (comma separated)
              </label>
              <input
                type="text"
                value={labelsInput}
                onChange={(e) => setLabelsInput(e.target.value)}
                placeholder="android, bug, bluetooth"
                className="w-full border border-slate-200 rounded-lg p-2 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Story Points / Effort
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={storyPoints}
                  onChange={(e) => setStoryPoints(e.target.value)}
                  placeholder="Points (e.g. 3)"
                  className="w-1/2 border border-slate-200 rounded-lg p-2 text-xs"
                />
                <input
                  type="text"
                  value={estimatedEffort}
                  onChange={(e) => setEstimatedEffort(e.target.value)}
                  placeholder="Effort (e.g. 4h)"
                  className="w-1/2 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded shadow-2xs disabled:opacity-50 transition-colors"
            >
              Create Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
