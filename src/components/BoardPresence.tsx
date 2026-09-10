import React from 'react';
import { User } from '../types';

interface BoardPresenceProps {
  /** Everyone who can open this board (non-guest workspace members + this project's shares). */
  accessMembers: User[];
  /** Subset currently viewing the board, by live heartbeat. */
  viewers: User[];
  /** Opens the Share modal to manage who has access. */
  onManageAccess: () => void;
}

const AVATAR_LIMIT = 3;

/**
 * Board-toolbar cluster: a stacked avatar count of who has access (click to manage) and, when
 * anyone else is looking at the board right now, a pulsing "N here" live signal. Avatars of
 * people who are both members and currently viewing get an emerald ring.
 */
export const BoardPresence: React.FC<BoardPresenceProps> = ({ accessMembers, viewers, onManageAccess }) => {
  const viewerIds = new Set(viewers.map((v) => v.id));
  const shown = accessMembers.slice(0, AVATAR_LIMIT);
  const overflow = accessMembers.length - shown.length;
  const accessLabel = `${accessMembers.length} ${accessMembers.length === 1 ? 'person has' : 'people have'} access — click to manage`;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onManageAccess}
        title={accessLabel}
        aria-label={accessLabel}
        className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="flex -space-x-1.5">
          {shown.map((u) => (
            <img
              key={u.id}
              src={u.avatarUrl}
              alt={u.name}
              title={u.name}
              className={`w-5 h-5 rounded-full object-cover ring-2 ${
                viewerIds.has(u.id) ? 'ring-emerald-400' : 'ring-white dark:ring-slate-800'
              }`}
            />
          ))}
          {overflow > 0 && (
            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-800 text-[9px] font-bold text-slate-500 dark:text-slate-300 flex items-center justify-center">
              +{overflow}
            </span>
          )}
        </div>
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{accessMembers.length}</span>
      </button>

      {viewers.length > 0 && (
        <span
          title={`${viewers.map((v) => v.name).join(', ')} ${viewers.length === 1 ? 'is' : 'are'} viewing now`}
          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {viewers.length} here
        </span>
      )}
    </div>
  );
};
