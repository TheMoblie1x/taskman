import React, { useEffect, useState } from 'react';
import { Board, ShareLink, Ticket } from '../types';
import { isFirebaseConfigured, signInGuest } from '../lib/firebase';
import * as repo from '../data/firestoreRepository';
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

export const ShareGuestApp: React.FC<{ token: string }> = ({ token }) => {
  const [status, setStatus] = useState<Status>('loading');
  const [board, setBoard] = useState<Board | null>(null);
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setStatus('invalid');
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const link = await repo.getShareLinkByToken(token);
        if (!link || !link.isActive) {
          if (!cancelled) setStatus('invalid');
          return;
        }

        const guest = await signInGuest();
        if (!guest) {
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
                    <div key={ticket.id} className="bg-white border border-slate-200 rounded p-2.5 space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <GoogleIcon name={TYPE_ICON[ticket.type]} size={13} />
                        <span className="text-[10px] font-mono">#{ticket.ticketNumber}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 leading-snug">{ticket.title}</p>
                      <div className="flex items-center justify-between pt-0.5">
                        <span className={`text-[10px] font-semibold ${PRIORITY_COLOR[ticket.priority]}`}>
                          {PRIORITY_LABEL[ticket.priority]}
                        </span>
                        {canEdit && (
                          <select
                            value={ticket.status}
                            onChange={(e) => moveTicket(ticket, e.target.value)}
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
                    </div>
                  ))}
                  {colTickets.length === 0 && <p className="text-[10px] text-slate-400 text-center py-3">No tickets</p>}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
