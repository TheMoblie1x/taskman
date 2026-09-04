import React from 'react';
import { GoogleIcon } from './GoogleIcon';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'C', description: 'Create new issue' },
    { key: '/', description: 'Focus search bar' },
    { key: 'Esc', description: 'Close drawer or dialog' },
    { key: '1', description: 'Switch to Kanban Board view' },
    { key: '2', description: 'Switch to List view' },
    { key: '3', description: 'Switch to Calendar view' },
    { key: '4', description: 'Switch to My Tasks view' },
    { key: '?', description: 'Show keyboard shortcuts' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <GoogleIcon name="keyboard_command_key" size={16} className="text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <GoogleIcon name="close" size={20} />
          </button>
        </div>

        <div className="p-5 space-y-2 text-xs">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
              <span className="text-slate-600">{s.description}</span>
              <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono font-bold text-slate-700 text-[11px] shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
