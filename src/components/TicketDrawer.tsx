import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { TicketPriority, TicketType, User } from '../types';
import { TicketTypeBadge, PriorityBadge } from './TicketBadge';
import {
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  downloadICSFile,
} from '../utils/calendar';
import { GoogleIcon } from './GoogleIcon';

export const TicketDrawer: React.FC = () => {
  const {
    selectedTicket,
    setSelectedTicketId,
    activeProject,
    activeBoard,
    allUsers,
    currentUser,
    updateTicket,
    deleteTicket,
    moveTicket,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    addComment,
    addAttachment,
    syncCalendarEvent,
    userCanEdit,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [commentText, setCommentText] = useState('');
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newLabelInput, setNewLabelInput] = useState('');
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTicketId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedTicketId]);

  if (!selectedTicket) return null;

  const ticketKey = activeProject
    ? `${activeProject.key}-${selectedTicket.ticketNumber}`
    : `TKT-${selectedTicket.ticketNumber}`;

  const columns = activeBoard?.columns || [];
  const assignee = allUsers.find((u) => u.id === selectedTicket.assigneeId);
  const reporter = allUsers.find((u) => u.id === selectedTicket.reporterId) || currentUser;

  const completedSubtasks = selectedTicket.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = selectedTicket.subtasks.length;
  const subtaskPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(selectedTicket.id, commentText.trim());
    setCommentText('');
    setShowMentionMenu(false);
  };

  const handleInsertMention = (userName: string) => {
    setCommentText((prev) => `${prev}@${userName.replace(/\s+/g, '')} `);
    setShowMentionMenu(false);
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(selectedTicket.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const handleAddChecklistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    addChecklistItem(selectedTicket.id, newChecklistText.trim());
    setNewChecklistText('');
  };

  const handleAddLabelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelInput.trim()) return;
    const tag = newLabelInput.trim().toLowerCase();
    if (!selectedTicket.labels.includes(tag)) {
      updateTicket(
        selectedTicket.id,
        { labels: [...selectedTicket.labels, tag] },
        `added label "${tag}"`
      );
    }
    setNewLabelInput('');
    setShowLabelInput(false);
  };

  const handleRemoveLabel = (tagToRemove: string) => {
    updateTicket(
      selectedTicket.id,
      { labels: selectedTicket.labels.filter((l) => l !== tagToRemove) },
      `removed label "${tagToRemove}"`
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      addAttachment(selectedTicket.id, {
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
      });
    }
  };

  const handleSyncCalendarNow = () => {
    setIsSyncingCalendar(true);
    setTimeout(() => {
      syncCalendarEvent(selectedTicket.id, 'google');
      setIsSyncingCalendar(false);
    }, 600);
  };

  const copyTicketLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/ticket/${ticketKey}`);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs transition-opacity"
        onClick={() => setSelectedTicketId(null)}
      />

      {/* Slide-over Drawer Panel */}
      <div
        id="ticket-details-drawer"
        className="relative w-full max-w-2xl lg:max-w-3xl bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-200 transition-colors"
      >
        {/* Top Header */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/80">
          <div className="flex items-center gap-2">
            <TicketTypeBadge type={selectedTicket.type} />
            <button
              onClick={copyTicketLink}
              className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors"
              title="Click to copy ticket key"
            >
              <span>{ticketKey}</span>
              {copiedKey && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans">Copied!</span>}
            </button>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-[11px] text-slate-400">v{selectedTicket.version}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Delete button */}
            {userCanEdit && (
              <button
                onClick={() => {
                  if (confirm(`Delete issue ${ticketKey}? This action cannot be undone.`)) {
                    deleteTicket(selectedTicket.id);
                  }
                }}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                title="Delete Ticket"
              >
                <GoogleIcon name="delete" size={14} />
              </button>
            )}

            {/* Close button */}
            <button
              id="close-ticket-drawer-btn"
              onClick={() => setSelectedTicketId(null)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded transition-colors"
              title="Close (Esc)"
            >
              <GoogleIcon name="close" size={16} />
            </button>
          </div>
        </div>

        {/* Drawer Body: 2-column layout on desktop */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          {/* Main Left Pane: Title, Description, Subtasks, Checklists, Attachments, Comments */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Title */}
            <div>
              <input
                type="text"
                value={selectedTicket.title}
                readOnly={!userCanEdit}
                onChange={(e) => updateTicket(selectedTicket.id, { title: e.target.value })}
                className="w-full text-base font-bold text-slate-900 dark:text-slate-100 border-b border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-none px-1 py-0.5 rounded transition-all bg-transparent"
                placeholder="Issue Title..."
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={selectedTicket.description}
                readOnly={!userCanEdit}
                onChange={(e) => updateTicket(selectedTicket.id, { description: e.target.value })}
                placeholder="Add a detailed description, reproduction steps, or context..."
                rows={3}
                className="w-full text-xs text-slate-700 p-2.5 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed transition-all resize-y"
              />
            </div>

            {/* Subtasks Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <GoogleIcon name="checklist" size={14} className="text-blue-600" />
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Subtasks</span>
                  {totalSubtasks > 0 && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      ({completedSubtasks}/{totalSubtasks})
                    </span>
                  )}
                </div>
                {totalSubtasks > 0 && (
                  <span className="text-[11px] font-bold text-slate-600">{subtaskPercentage}%</span>
                )}
              </div>

              {/* Progress bar */}
              {totalSubtasks > 0 && (
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${subtaskPercentage}%` }}
                  />
                </div>
              )}

              {/* Subtasks list */}
              <div className="space-y-1">
                {selectedTicket.subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors group"
                  >
                    <label className="flex items-center gap-2 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sub.completed}
                        disabled={!userCanEdit}
                        onChange={() => toggleSubtask(selectedTicket.id, sub.id)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span
                        className={`text-xs ${
                          sub.completed ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {sub.title}
                      </span>
                    </label>
                    {userCanEdit && (
                      <button
                        onClick={() => deleteSubtask(selectedTicket.id, sub.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-600 rounded transition-all"
                        title="Delete subtask"
                      >
                        <GoogleIcon name="delete" size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add subtask input */}
              {userCanEdit && (
                <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Add a subtask (e.g. Implement retry mechanism)..."
                    className="flex-1 text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newSubtaskTitle.trim()}
                    className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg disabled:opacity-40 transition-colors flex items-center gap-1"
                  >
                    <GoogleIcon name="add" size={14} />
                    <span>Add</span>
                  </button>
                </form>
              )}
            </div>

            {/* Lightweight Checklist Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Release Checklist
                </span>
              </div>
              <div className="space-y-1">
                {selectedTicket.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 text-xs text-slate-700 group"
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        disabled={!userCanEdit}
                        onChange={() => toggleChecklistItem(selectedTicket.id, item.id)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className={item.completed ? 'line-through text-slate-400' : ''}>
                        {item.text}
                      </span>
                    </label>
                    {userCanEdit && (
                      <button
                        onClick={() => deleteChecklistItem(selectedTicket.id, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-500"
                      >
                        <GoogleIcon name="delete" size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {userCanEdit && (
                <form onSubmit={handleAddChecklistSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    placeholder="Add checklist item..."
                    className="flex-1 text-xs px-2.5 py-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newChecklistText.trim()}
                    className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded disabled:opacity-40"
                  >
                    Add
                  </button>
                </form>
              )}
            </div>

            {/* Attachments Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <GoogleIcon name="attach_file" size={16} className="text-slate-500" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Attachments ({selectedTicket.attachments.length})
                  </span>
                </div>
                {userCanEdit && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <GoogleIcon name="add" size={12} />
                    Attach File
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedTicket.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <GoogleIcon name="description" size={16} className="text-blue-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 truncate" title={att.fileName}>
                          {att.fileName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {Math.round(att.size / 1024)} KB • {att.uploadedBy.name}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Simulating file download for ${att.fileName}`)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                      title="Download file"
                    >
                      <GoogleIcon name="download" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity & Comments Tabs */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'comments'
                      ? 'text-blue-600 border-b-2 border-blue-600 -mb-2 pb-2'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <GoogleIcon name="chat_bubble" size={14} />
                  <span>Comments ({selectedTicket.comments.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'activity'
                      ? 'text-blue-600 border-b-2 border-blue-600 -mb-2 pb-2'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <GoogleIcon name="history" size={14} />
                  <span>Activity History ({selectedTicket.activity.length})</span>
                </button>
              </div>

              {activeTab === 'comments' ? (
                <div className="space-y-4">
                  {/* Comments list */}
                  <div className="space-y-3">
                    {selectedTicket.comments.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">No comments yet.</div>
                    ) : (
                      selectedTicket.comments.map((comm) => (
                        <div key={comm.id} className="flex gap-3 text-xs">
                          <img
                            src={comm.user.avatarUrl}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 mt-0.5"
                          />
                          <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-800">{comm.user.name}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(comm.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                              {comm.content}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add comment box with @mention */}
                  {userCanEdit && (
                    <form onSubmit={handleAddCommentSubmit} className="space-y-2">
                      <div className="relative">
                        <textarea
                          value={commentText}
                          onChange={(e) => {
                            setCommentText(e.target.value);
                            if (e.target.value.endsWith('@')) {
                              setShowMentionMenu(true);
                            }
                          }}
                          placeholder="Write a comment... (Type @ to mention team members)"
                          rows={2}
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />

                        {/* Mentions Menu */}
                        {showMentionMenu && (
                          <div className="absolute left-0 bottom-full mb-1 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
                              Mention Team Member
                            </div>
                            {allUsers.map((u) => (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => handleInsertMention(u.name)}
                                className="w-full text-left px-2 py-1 text-xs hover:bg-slate-50 flex items-center gap-2"
                              >
                                <img src={u.avatarUrl} alt="" className="w-4 h-4 rounded-full" />
                                <span className="font-medium text-slate-700">{u.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setShowMentionMenu(!showMentionMenu)}
                          className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1"
                        >
                          <GoogleIcon name="alternate_email" size={14} />
                          <span>Mention</span>
                        </button>
                        <button
                          type="submit"
                          disabled={!commentText.trim()}
                          className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-2xs disabled:opacity-40 flex items-center gap-1.5 transition-colors"
                        >
                          <GoogleIcon name="send" size={12} />
                          <span>Comment</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                /* Activity History Timeline */
                <div className="space-y-3">
                  {selectedTicket.activity.map((act) => (
                    <div key={act.id} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <img
                        src={act.userAvatar}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5 border border-slate-200"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-slate-800">{act.userName} </span>
                        <span>{act.action}</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(act.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Metadata Panel */}
          <div className="w-full md:w-64 bg-slate-50/70 dark:bg-slate-850/80 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 p-3.5 space-y-3 shrink-0 text-xs">
            {/* Status */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                Status
              </label>
              <select
                value={selectedTicket.status}
                disabled={!userCanEdit}
                onChange={(e) => moveTicket(selectedTicket.id, e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded p-1.5 focus:ring-1 focus:ring-blue-500"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.status}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                Priority
              </label>
              <select
                value={selectedTicket.priority}
                disabled={!userCanEdit}
                onChange={(e) =>
                  updateTicket(
                    selectedTicket.id,
                    { priority: e.target.value as TicketPriority },
                    `changed priority to ${e.target.value}`
                  )
                }
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded p-1.5 focus:ring-1 focus:ring-blue-500 capitalize"
              >
                <option value="highest">Highest</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="lowest">Lowest</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                Assignee
              </label>
              <select
                value={selectedTicket.assigneeId || ''}
                disabled={!userCanEdit}
                onChange={(e) =>
                  updateTicket(
                    selectedTicket.id,
                    { assigneeId: e.target.value || null },
                    `assigned to ${allUsers.find((u) => u.id === e.target.value)?.name || 'unassigned'}`
                  )
                }
                className="w-full text-xs bg-white border border-slate-200 rounded p-1.5 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                Due Date
              </label>
              <input
                type="date"
                value={
                  selectedTicket.dueAt
                    ? new Date(selectedTicket.dueAt).toISOString().split('T')[0]
                    : ''
                }
                disabled={!userCanEdit}
                onChange={(e) =>
                  updateTicket(
                    selectedTicket.id,
                    {
                      dueAt: e.target.value
                        ? new Date(e.target.value + 'T17:00:00Z').toISOString()
                        : null,
                    },
                    `updated due date to ${e.target.value}`
                  )
                }
                className="w-full text-xs bg-white border border-slate-200 rounded p-1.5 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Story Points / Effort */}
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Story Points
                </label>
                <input
                  type="number"
                  value={selectedTicket.storyPoints ?? ''}
                  disabled={!userCanEdit}
                  onChange={(e) =>
                    updateTicket(selectedTicket.id, {
                      storyPoints: e.target.value ? parseInt(e.target.value, 10) : null,
                    })
                  }
                  placeholder="3"
                  className="w-full text-xs bg-white border border-slate-200 rounded p-1.5 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Effort
                </label>
                <input
                  type="text"
                  value={selectedTicket.estimatedEffort || ''}
                  disabled={!userCanEdit}
                  onChange={(e) =>
                    updateTicket(selectedTicket.id, { estimatedEffort: e.target.value })
                  }
                  placeholder="6h, 2d..."
                  className="w-full text-xs bg-white border border-slate-200 rounded p-1.5 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Labels */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Labels
                </label>
                {userCanEdit && (
                  <button
                    onClick={() => setShowLabelInput(!showLabelInput)}
                    className="text-[10px] text-blue-600 hover:underline"
                  >
                    + Add
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mb-1.5">
                {selectedTicket.labels.map((lbl) => (
                  <span
                    key={lbl}
                    className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] bg-slate-200/80 text-slate-700 font-medium"
                  >
                    <span>{lbl}</span>
                    {userCanEdit && (
                      <button
                        onClick={() => handleRemoveLabel(lbl)}
                        className="hover:text-rose-600"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {showLabelInput && (
                <form onSubmit={handleAddLabelSubmit} className="flex gap-1">
                  <input
                    type="text"
                    value={newLabelInput}
                    onChange={(e) => setNewLabelInput(e.target.value)}
                    placeholder="New tag..."
                    autoFocus
                    className="flex-1 text-xs px-2 py-0.5 border border-slate-200 rounded bg-white"
                  />
                  <button
                    type="submit"
                    className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded font-medium"
                  >
                    Save
                  </button>
                </form>
              )}
            </div>

            {/* Calendar Integration Widget (PRD Section 25-28) */}
            <div className="p-2.5 bg-white rounded border border-blue-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                  <GoogleIcon name="auto_awesome" size={12} className="text-blue-600" />
                  Calendar Integration
                </span>
                {selectedTicket.calendarEvent && (
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                    Synced
                  </span>
                )}
              </div>

              {selectedTicket.calendarEvent ? (
                <div className="space-y-1 text-[10px] text-slate-600 border-t border-slate-100 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Provider:</span>
                    <span className="font-semibold text-slate-700 capitalize">
                      {selectedTicket.calendarEvent.provider} Calendar
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target:</span>
                    <span className="text-slate-700">{selectedTicket.calendarEvent.calendarName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Event ID:</span>
                    <span className="font-mono text-[9px] text-slate-500 truncate max-w-[100px]">
                      {selectedTicket.calendarEvent.externalEventId}
                    </span>
                  </div>

                  <button
                    onClick={handleSyncCalendarNow}
                    disabled={isSyncingCalendar}
                    className="w-full mt-1.5 py-1 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded flex items-center justify-center gap-1 text-xs transition-colors"
                  >
                    <GoogleIcon name="refresh" size={12} className={`${isSyncingCalendar ? 'animate-spin' : ''}`} />
                    <span>{isSyncingCalendar ? 'Synchronizing...' : 'Sync Now'}</span>
                  </button>
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 leading-snug">
                  Add this ticket with its deadline to your Google or Outlook calendar for 2-way tracking.
                </p>
              )}

              {/* Action Buttons for Google Calendar, Outlook, and ICS */}
              <div className="space-y-1 pt-0.5">
                <a
                  href={generateGoogleCalendarUrl(selectedTicket, activeProject || undefined)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => syncCalendarEvent(selectedTicket.id, 'google')}
                  className="w-full py-1 px-2 text-xs rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between transition-colors shadow-2xs"
                >
                  <span className="flex items-center gap-1.5">
                    <GoogleIcon name="calendar_today" size={12} className="text-blue-600" />
                    Google Calendar
                  </span>
                  <GoogleIcon name="open_in_new" size={10} className="text-slate-400" />
                </a>

                <a
                  href={generateOutlookCalendarUrl(selectedTicket, activeProject || undefined)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => syncCalendarEvent(selectedTicket.id, 'microsoft')}
                  className="w-full py-1 px-2 text-xs rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between transition-colors shadow-2xs"
                >
                  <span className="flex items-center gap-1.5">
                    <GoogleIcon name="calendar_today" size={12} className="text-sky-600" />
                    Microsoft Outlook
                  </span>
                  <GoogleIcon name="open_in_new" size={10} className="text-slate-400" />
                </a>

                <button
                  onClick={() => downloadICSFile(selectedTicket, activeProject || undefined)}
                  className="w-full py-0.5 px-1.5 text-[10px] text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1"
                >
                  <GoogleIcon name="download" size={10} />
                  <span>Download .ICS file</span>
                </button>
              </div>
            </div>

            {/* Reporter & Metadata */}
            <div className="pt-2 border-t border-slate-200 space-y-1 text-[10px] text-slate-400">
              <div className="flex justify-between">
                <span>Reporter:</span>
                <span className="text-slate-600 font-medium">{reporter.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="text-slate-600">
                  {new Date(selectedTicket.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Updated:</span>
                <span className="text-slate-600">
                  {new Date(selectedTicket.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
