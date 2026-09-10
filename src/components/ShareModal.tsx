import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShareAccess, SharePermission } from '../types';
import { GoogleIcon } from './GoogleIcon';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ShareScope = 'project' | 'workspace';

const ACCESS_LABEL: Record<ShareAccess, string> = { editor: 'Can edit', viewer: 'View only' };

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    activeProject,
    activeBoard,
    activeWorkspace,
    workspaceMembers,
    shareWorkspace,
    updateMemberAccess,
    removeMember,
    workspaceProjectMembers,
    shareProject,
    updateProjectMemberAccess,
    removeProjectMember,
    shareLinks,
    createShareLink,
    revokeShareLink,
    isGuestViewer,
    setIsGuestViewer,
  } = useApp();

  const [scope, setScope] = useState<ShareScope>(activeProject ? 'project' : 'workspace');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteAccess, setInviteAccess] = useState<ShareAccess>('editor');
  const [linkPermission, setLinkPermission] = useState<SharePermission>('editor');
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  if (!isOpen) return null;

  const currentBoardShare = shareLinks.find((s) => s.boardId === (activeBoard?.id || '') && s.isActive);

  // BASE_URL (e.g. "/Collab/") is where this build is actually mounted (see vite.config.ts) —
  // the link must include it or it 404s once the app is served from under that path.
  const shareUrl = currentBoardShare
    ? `${window.location.origin}${import.meta.env.BASE_URL}share/${currentBoardShare.token}`
    : '';

  const wsMembers = workspaceMembers.filter((m) => m.workspaceId === activeWorkspace.id);
  const projMembers = activeProject
    ? workspaceProjectMembers.filter((pm) => pm.projectId === activeProject.id)
    : [];

  const scopeName = scope === 'project' ? activeProject?.name ?? 'this project' : activeWorkspace.name;

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;
    if (scope === 'project') {
      if (!activeProject) return;
      shareProject(activeProject.id, email, inviteAccess);
    } else {
      shareWorkspace(email, inviteAccess);
    }
    setInviteEmail('');
    setInviteSuccess(true);
    setTimeout(() => setInviteSuccess(false), 3000);
  };

  const handleGenerateLink = () => {
    if (!activeBoard) return;
    createShareLink(activeBoard.id, linkPermission);
  };

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const scopeTab = (value: ShareScope, label: string, disabled = false) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setScope(value)}
      className={`flex-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        scope === value ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-2xs">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold shadow-2xs">
              <GoogleIcon name="share" size={14} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-xs">Share "{scopeName}"</h3>
              <p className="text-[10px] text-slate-500">Invite people by email with view or edit access</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded">
            <GoogleIcon name="close" size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs flex-1 min-h-0 overflow-y-auto">
          {/* Scope toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md">
            {scopeTab('project', activeProject ? `Project · ${activeProject.name}` : 'This project', !activeProject)}
            {scopeTab('workspace', `Workspace · ${activeWorkspace.name}`)}
          </div>

          {/* 1. Invite by email */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <GoogleIcon name="mail" size={14} className="text-blue-600" />
              <span>Invite via email</span>
            </h4>

            <form onSubmit={handleInviteSubmit} className="space-y-1.5">
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="flex-1 border border-slate-200 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <select
                  value={inviteAccess}
                  onChange={(e) => setInviteAccess(e.target.value as ShareAccess)}
                  className="border border-slate-200 rounded px-2 py-1.5 bg-slate-50 font-medium text-slate-700 text-xs"
                >
                  <option value="editor">Can edit</option>
                  <option value="viewer">View only</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-2xs transition-colors text-xs"
                >
                  Share
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                {scope === 'project'
                  ? 'They get access to this project only. If they are not in the workspace yet, they are added as a guest.'
                  : 'They get access to every project and board in this workspace.'}
              </p>
              {inviteSuccess && (
                <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <GoogleIcon name="check" size={12} />
                  <span>{scopeName} shared with that email.</span>
                </div>
              )}
            </form>
          </div>

          {/* 2. People with access */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <GoogleIcon name="group" size={14} className="text-blue-600" />
              <span>People with access</span>
            </h4>

            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {scope === 'workspace'
                ? wsMembers.map((m) => {
                    const isOwner = m.role === 'owner';
                    const isSelf = m.user.id === currentUser.id;
                    return (
                      <div key={m.id} className="p-2 flex items-center gap-2">
                        <img src={m.user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-800 truncate flex items-center gap-1.5">
                            {m.user.name}
                            {isSelf && (
                              <span className="text-[9px] bg-blue-100 text-blue-700 px-1 rounded font-semibold">You</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{m.user.email}</div>
                        </div>
                        {isOwner ? (
                          <span className="text-[10px] font-semibold text-slate-500 px-1.5">Owner</span>
                        ) : (
                          <select
                            value={m.role === 'guest' ? 'viewer' : 'editor'}
                            onChange={(e) => updateMemberAccess(m.user.id, e.target.value as ShareAccess)}
                            className="border border-slate-200 rounded px-1.5 py-1 bg-slate-50 font-medium text-slate-600 text-[11px]"
                          >
                            <option value="editor">Can edit</option>
                            <option value="viewer">View only</option>
                          </select>
                        )}
                        {!isOwner && !isSelf && (
                          <button
                            onClick={() => removeMember(m.user.id)}
                            title="Remove access"
                            className="p-1 text-slate-300 hover:text-rose-600 shrink-0"
                          >
                            <GoogleIcon name="close" size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })
                : projMembers.length === 0
                ? (
                  <div className="p-3 text-[11px] text-slate-400">
                    No one is shared on this project directly yet. Workspace members already have{' '}
                    {ACCESS_LABEL.editor.toLowerCase()} access.
                  </div>
                )
                : projMembers.map((pm) => (
                    <div key={pm.id} className="p-2 flex items-center gap-2">
                      <img src={pm.user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-800 truncate">{pm.user.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {pm.user.email}
                          {pm.status === 'invited' && ' · invited'}
                        </div>
                      </div>
                      <select
                        value={pm.access}
                        onChange={(e) =>
                          activeProject && updateProjectMemberAccess(activeProject.id, pm.user.id, e.target.value as ShareAccess)
                        }
                        className="border border-slate-200 rounded px-1.5 py-1 bg-slate-50 font-medium text-slate-600 text-[11px]"
                      >
                        <option value="editor">Can edit</option>
                        <option value="viewer">View only</option>
                      </select>
                      <button
                        onClick={() => activeProject && removeProjectMember(activeProject.id, pm.user.id)}
                        title="Remove access"
                        className="p-1 text-slate-300 hover:text-rose-600 shrink-0"
                      >
                        <GoogleIcon name="close" size={14} />
                      </button>
                    </div>
                  ))}
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* 3. Public Share Link */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <GoogleIcon name="link" size={14} className="text-blue-600" />
              <span>Shareable Board Link</span>
            </h4>

            {currentBoardShare ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-mono text-slate-600 truncate select-all"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded flex items-center gap-1 transition-colors shrink-0 text-xs"
                  >
                    {copiedLink ? (
                      <>
                        <GoogleIcon name="check" size={12} className="text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <GoogleIcon name="content_copy" size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">Permission:</span>
                    <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded font-medium capitalize">
                      {currentBoardShare.permission === 'editor' ? 'Can Edit' : 'View Only'}
                    </span>
                  </div>
                  <button
                    onClick={() => revokeShareLink(currentBoardShare.id)}
                    className="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium"
                  >
                    <GoogleIcon name="delete" size={12} />
                    <span>Revoke link</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded border border-slate-200/80 space-y-2">
                <p className="text-slate-600 text-xs">
                  Generate a non-guessable link with token-based access. Anyone with this link can view or edit this board without requiring an enterprise account.
                </p>

                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="sharePerm"
                      checked={linkPermission === 'editor'}
                      onChange={() => setLinkPermission('editor')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-slate-700">Can edit</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="sharePerm"
                      checked={linkPermission === 'viewer'}
                      onChange={() => setLinkPermission('viewer')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-slate-700">Can view only</span>
                  </label>
                </div>

                <button
                  onClick={handleGenerateLink}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-2xs transition-colors text-xs"
                >
                  Create Share Link
                </button>
              </div>
            )}
          </div>

          <div className="h-px bg-slate-100" />

          {/* 4. Live Preview as Guest Toggle */}
          <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded flex items-center justify-between">
            <div>
              <div className="font-bold text-amber-900 text-xs">Simulate Guest / Viewer Mode</div>
              <div className="text-[10px] text-amber-700">
                Experience the board as an unauthenticated guest or view-only link recipient.
              </div>
            </div>
            <button
              onClick={() => {
                setIsGuestViewer(!isGuestViewer);
                onClose();
              }}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                isGuestViewer
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              {isGuestViewer ? 'Exit View-Only' : 'Test View-Only'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
