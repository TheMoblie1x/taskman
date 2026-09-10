import React, { useEffect, useState } from 'react';
import { Board, ShareLink, Ticket } from '../types';
import { isFirebaseConfigured, signInGuest } from '../lib/firebase';
import * as repo from '../data/firestoreRepository';
import { statusColor } from '../utils/statusColor';
import { GoogleIcon } from './GoogleIcon';

/**
 * The entire experience for someone who opens a /share/:token link with no account — rendered
 * standalone by main.tsx, never through AppProvider/AuthGate. Kept deliberately separate from
 * the authenticated app (rather than threading a "guest mode" through AppContext's much larger
 * workspace/project/member model) so a share-link visitor can't reach anything beyond the one
 * board their link names, and so this narrow path can't regress the authenticated product.
 */

type Status = 'loading' | 'invalid' | 'ready';

const PRIORITY_LABEL: Record<Ticket['priority'], string> = {
  highest: 'Highest',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  lowest: 'Lowest',
};

const PRIORITY_COLOR: Record<Ticket['priority'], string> = {
  highest: 'text-rose-600',
  high: 'text-orange-600',
  medium: 'text-amber-600',
  low: 'text-sky-600',
  lowest: 'text-slate-400',
};

const TYPE_ICON: Record<Ticket['type'], string> = {
  task: 'check_circle',
  bug: 'bug_report',
  feature: 'auto_awesome',
  story: 'menu_book',
  epic: 'bolt',
};

const formatDate = (iso?: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const ShareGuestApp: React.FC<{ token: string }> = ({ token }) => {
  const [status, setStatus] = useState<Status>('loading');
  const [board, setBoard] = useState<Board | null>(null);
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setStatus('invalid');
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        // Sign in (even anonymously) before the very first shareLinks read — Firestore rules
        // require request.auth to be non-null for that lookup, and there's no guestSessions doc
        // yet to satisfy the alternative "already a guest for this board" check.
        const guest = await signInGuest();
        if (!guest) {
          if (!cancelled) setStatus('invalid');
          return;
        }

        const link = await repo.getShareLinkByToken(token);
        if (!link || !link.isActive) {
          if (!cancelled) setStatus('invalid');
          return;
        }

        await repo.createGuestSession(guest.uid, {
          token,
          boardId: link.boardId,
          permission: link.permission,
        });

        const boardDoc = await repo.getBoardById(link.boardId);
        if (!boardDoc) {
          if (!cancelled) setStatus('invalid');
          return;
        }
        if (cancelled) return;

        setShareLink(link);
        setBoard(boardDoc);
        unsubscribe = repo.subscribeBoardTickets(link.boardId, setTickets, () => {
          if (!cancelled) setStatus('invalid');
        });
        setStatus('ready');
      } catch (e) {
        console.error('Failed to resolve share link:', e);
        if (!cancelled) setStatus('invalid');
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [token]);

  useEffect(() => {
    if (!selectedTicketId) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelectedTicketId(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedTicketId]);

  const canEdit = shareLink?.permission === 'editor';

  const moveTicket = (ticket: Ticket, targetStatus: string) => {
    if (!canEdit || targetStatus === ticket.status) return;
    setTickets((prev) => prev.map((t) => (t.id === ticket.id ? { ...t, status: targetStatus } : t)));
    repo
      .updateTicketDoc(ticket.id, { status: targetStatus, updatedAt: new Date().toISOString(), version: ticket.version + 1 })
      .catch((e) => console.error('Failed to move ticket:', e));
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <GoogleIcon name="progress_activity" size={28} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (status === 'invalid' || !board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-sm w-full bg-white border border-slate-200 rounded-lg shadow-xl p-6 text-center space-y-2">
          <GoogleIcon name="link_off" size={32} className="text-slate-400 mx-auto" />
          <h1 className="font-bold text-slate-800">This link isn't working</h1>
          <p className="text-sm text-slate-500">
            It may have been revoked, or the link is incomplete. Ask whoever shared it for a new one.
          </p>
        </div>
      </div>
    );
  }

  const columns = [...board.columns].sort((a, b) => a.position - b.position);
  const selectedTicket = selectedTicketId ? tickets.find((t) => t.id === selectedTicketId) ?? null : null;
  const statusName = (statusKey: string) => columns.find((c) => c.status === statusKey)?.name ?? statusKey;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="px-4 py-2.5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center shrink-0">
            <GoogleIcon name="dashboard" size={14} />
          </div>
          <h1 className="font-bold text-slate-800 text-sm truncate">{board.name}</h1>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
            canEdit ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {canEdit ? 'Can edit · shared link' : 'View only · shared link'}
        </span>
      </header>

      <main className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-3 h-full min-w-max">
          {columns.map((col) => {
            const colTickets = tickets
              .filter((t) => t.status === col.status)
              .sort((a, b) => a.position - b.position);
            return (
              <div key={col.id} className="w-72 shrink-0 flex flex-col bg-slate-100/70 rounded-lg border border-slate-200">
                <div className="px-3 py-2 flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wide">
                  <span>{col.name}</span>
                  <span className="text-slate-400 font-medium">{colTickets.length}</span>
                </div>
                <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto">
                  {colTickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className="w-full text-left bg-white border border-slate-200 rounded p-2.5 space-y-1.5 shadow-2xs hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <GoogleIcon name={TYPE_ICON[ticket.type]} size={13} />
                        <span className="text-[10px] font-mono">#{ticket.ticketNumber}</span>
                        <span
                          title={statusName(ticket.status)}
                          className={`ml-auto w-1.5 h-1.5 rounded-full shrink-0 ${statusColor(ticket.status, statusName(ticket.status)).dot}`}
                        />
                      </div>
                      <p className="text-xs font-medium text-slate-800 leading-snug">{ticket.title}</p>
                      <div className="flex items-center justify-between pt-0.5">
                        <span className={`text-[10px] font-semibold ${PRIORITY_COLOR[ticket.priority]}`}>
                          {PRIORITY_LABEL[ticket.priority]}
                        </span>
                        {canEdit && (
                          <select
                            value={ticket.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              moveTicket(ticket, e.target.value);
                            }}
                            className="text-[10px] border border-slate-200 rounded px-1 py-0.5 bg-slate-50 text-slate-600"
                          >
                            {columns.map((c) => (
                              <option key={c.id} value={c.status}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </button>
                  ))}
                  {colTickets.length === 0 && <p className="text-[10px] text-slate-400 text-center py-3">No tickets</p>}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => setSelectedTicketId(null)}
          />
          <aside className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 text-slate-400">
                <GoogleIcon name={TYPE_ICON[selectedTicket.type]} size={14} />
                <span className="text-[11px] font-mono">#{selectedTicket.ticketNumber}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {selectedTicket.type}
                </span>
              </div>
              <button
                onClick={() => setSelectedTicketId(null)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                aria-label="Close"
              >
                <GoogleIcon name="close" size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-sm">
              <h2 className="font-bold text-slate-900 leading-snug">{selectedTicket.title}</h2>

              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded inline-flex items-center gap-1 ${
                    statusColor(selectedTicket.status, statusName(selectedTicket.status)).pill
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      statusColor(selectedTicket.status, statusName(selectedTicket.status)).dot
                    }`}
                  />
                  {statusName(selectedTicket.status)}
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-50 ${PRIORITY_COLOR[selectedTicket.priority]}`}
                >
                  {PRIORITY_LABEL[selectedTicket.priority]} priority
                </span>
                {selectedTicket.labels.map((l) => (
                  <span key={l} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                    {l}
                  </span>
                ))}
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</p>
                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.description?.trim() || 'No description provided.'}
                </p>
              </div>

              {(() => {
                const meta: [string, string][] = [];
                const start = formatDate(selectedTicket.startAt);
                const due = formatDate(selectedTicket.dueAt);
                if (start) meta.push(['Start', start]);
                if (due) meta.push(['Due', due]);
                if (selectedTicket.estimatedEffort) meta.push(['Estimate', selectedTicket.estimatedEffort]);
                if (selectedTicket.storyPoints != null) meta.push(['Story points', String(selectedTicket.storyPoints)]);
                return meta.length ? (
                  <div className="grid grid-cols-2 gap-2">
                    {meta.map(([k, v]) => (
                      <div key={k} className="bg-slate-50 rounded p-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{k}</p>
                        <p className="text-xs text-slate-700 font-medium">{v}</p>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}

              {selectedTicket.subtasks.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Subtasks · {selectedTicket.subtasks.filter((s) => s.completed).length}/{selectedTicket.subtasks.length}
                  </p>
                  {selectedTicket.subtasks.map((s) => (
                    <div key={s.id} className="flex items-center gap-1.5 text-xs text-slate-700">
                      <GoogleIcon
                        name={s.completed ? 'check_circle' : 'radio_button_unchecked'}
                        size={14}
                        className={s.completed ? 'text-emerald-500' : 'text-slate-300'}
                      />
                      <span className={s.completed ? 'line-through text-slate-400' : ''}>{s.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedTicket.checklist.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Checklist · {selectedTicket.checklist.filter((c) => c.completed).length}/{selectedTicket.checklist.length}
                  </p>
                  {selectedTicket.checklist.map((c) => (
                    <div key={c.id} className="flex items-center gap-1.5 text-xs text-slate-700">
                      <GoogleIcon
                        name={c.completed ? 'check_box' : 'check_box_outline_blank'}
                        size={14}
                        className={c.completed ? 'text-emerald-500' : 'text-slate-300'}
                      />
                      <span className={c.completed ? 'line-through text-slate-400' : ''}>{c.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedTicket.comments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Comments · {selectedTicket.comments.length}
                  </p>
                  {selectedTicket.comments.map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <img src={c.user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">{c.user.name}</span>
                          {formatDate(c.createdAt) && <span> · {formatDate(c.createdAt)}</span>}
                        </p>
                        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedTicket.attachments.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Attachments · {selectedTicket.attachments.length}
                  </p>
                  {selectedTicket.attachments.map((a) => (
                    <a
                      key={a.id}
                      href={a.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                    >
                      <GoogleIcon name="attach_file" size={13} />
                      <span className="truncate">{a.fileName}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-2 border-t border-slate-200 text-[10px] text-slate-400 shrink-0">
              {canEdit ? 'Shared link · you can move this task from the board' : 'View only · shared link'}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
