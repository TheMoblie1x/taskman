import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { GoogleIcon } from './GoogleIcon';
import { renderMarkdown } from '../utils/markdown';

const DEFAULT_ICON = '📄';

export const DocsView: React.FC = () => {
  const { workspaceDocPages, workspaceProjects, createDocPage, updateDocPage, deleteDocPage } = useApp();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'edit' | 'preview'>('preview');
  const [titleDraft, setTitleDraft] = useState('');
  const [contentDraft, setContentDraft] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('');

  const pages = projectFilter ? workspaceDocPages.filter((d) => d.projectId === projectFilter) : workspaceDocPages;
  const sortedPages = [...pages].sort((a, b) => a.title.localeCompare(b.title));
  const selected = workspaceDocPages.find((d) => d.id === selectedId) || null;

  // Keep the draft fields in sync when switching pages (but not on every keystroke — this
  // effect only fires when the selected page id itself changes).
  useEffect(() => {
    if (selected) {
      setTitleDraft(selected.title);
      setContentDraft(selected.content);
      setMode('preview');
    }
  }, [selected?.id]);

  const handleCreate = () => {
    const page = createDocPage({ title: 'Untitled Page', projectId: projectFilter || null, icon: DEFAULT_ICON });
    setSelectedId(page.id);
    setMode('edit');
  };

  const handleSaveTitle = () => {
    if (!selected) return;
    const trimmed = titleDraft.trim() || 'Untitled Page';
    if (trimmed !== selected.title) updateDocPage(selected.id, { title: trimmed });
  };

  const handleSaveContent = () => {
    if (!selected) return;
    if (contentDraft !== selected.content) updateDocPage(selected.id, { content: contentDraft });
  };

  const handleDelete = () => {
    if (!selected) return;
    if (confirm(`Delete "${selected.title}"? This cannot be undone.`)) {
      deleteDocPage(selected.id);
      setSelectedId(null);
    }
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-2.75rem)] overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Page list */}
      <div className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Docs</h2>
            <button
              onClick={handleCreate}
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
              title="New Page"
            >
              <GoogleIcon name="add" size={16} />
            </button>
          </div>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="w-full text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-600 dark:text-slate-300"
          >
            <option value="">All projects</option>
            {workspaceProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {sortedPages.length === 0 ? (
            <div className="p-4 text-center text-[11px] text-slate-400 italic">No pages yet.</div>
          ) : (
            sortedPages.map((page) => (
              <button
                key={page.id}
                onClick={() => setSelectedId(page.id)}
                className={`w-full text-left px-3 py-1.5 flex items-center gap-2 text-xs transition-colors ${
                  page.id === selectedId
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="shrink-0">{page.icon || DEFAULT_ICON}</span>
                <span className="truncate">{page.title}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-center px-6">
            <div>
              <GoogleIcon name="description" size={32} className="text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Select a page, or create a new one to start writing.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
              <input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={handleSaveTitle}
                className="flex-1 min-w-0 text-sm font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 -mx-1"
              />
              <div className="flex items-center gap-1 shrink-0">
                <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[11px] font-semibold">
                  <button
                    onClick={() => setMode('edit')}
                    className={`px-2 py-0.5 rounded transition-all ${mode === 'edit' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      handleSaveContent();
                      setMode('preview');
                    }}
                    className={`px-2 py-0.5 rounded transition-all ${mode === 'preview' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    Preview
                  </button>
                </div>
                <button
                  onClick={handleDelete}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                  title="Delete page"
                >
                  <GoogleIcon name="delete" size={15} />
                </button>
              </div>
            </div>

            <div className="px-6 py-1.5 border-b border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 flex items-center gap-1.5">
              <GoogleIcon name="history" size={11} />
              Updated {new Date(selected.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {selected.projectId && workspaceProjects.find((p) => p.id === selected.projectId) && (
                <>
                  <span>·</span>
                  <span>{workspaceProjects.find((p) => p.id === selected.projectId)?.name}</span>
                </>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {mode === 'edit' ? (
                <textarea
                  value={contentDraft}
                  onChange={(e) => setContentDraft(e.target.value)}
                  onBlur={handleSaveContent}
                  placeholder="Write in Markdown — headers, **bold**, lists, `code`, links..."
                  className="w-full h-full min-h-[60vh] p-6 text-xs font-mono leading-relaxed bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none resize-none"
                />
              ) : (
                <div
                  className="prose-docs max-w-3xl mx-auto p-6 text-xs leading-relaxed text-slate-700 dark:text-slate-300"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.content) }}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
