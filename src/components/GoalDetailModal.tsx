import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GoalHealth } from '../types';
import { GoogleIcon } from './GoogleIcon';
import {
  calculateGoalProgress,
  daysRemaining,
  isGoalProgressDerived,
  GOAL_HEALTH_COLOR,
  GOAL_HEALTH_LABEL,
} from '../utils/goalUtils';

interface GoalDetailModalProps {
  goalId: string | null;
  onClose: () => void;
}

const HEALTH_OPTIONS: GoalHealth[] = ['on_track', 'at_risk', 'behind', 'completed', 'overdue'];

export const GoalDetailModal: React.FC<GoalDetailModalProps> = ({ goalId, onClose }) => {
  const {
    workspaceGoals,
    workspaceTickets,
    projects,
    updateGoal,
    deleteGoal,
    addGoalMilestone,
    toggleGoalMilestone,
    deleteGoalMilestone,
    addGoalCheckIn,
    linkTicketToGoal,
    unlinkTicketFromGoal,
    currentUser,
    setSelectedTicketId,
  } = useApp();

  const [newMilestone, setNewMilestone] = useState('');
  const [linkTicketId, setLinkTicketId] = useState('');
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkInProgress, setCheckInProgress] = useState('');
  const [checkInNotes, setCheckInNotes] = useState('');
  const [checkInBlockers, setCheckInBlockers] = useState('');
  const [checkInNextStep, setCheckInNextStep] = useState('');

  const goal = workspaceGoals.find((g) => g.id === goalId);
  if (!goal) return null;

  const progress = calculateGoalProgress(goal, workspaceTickets);
  const days = daysRemaining(goal.targetDate);
  const isOverdue = days < 0 && goal.status !== 'completed';
  const project = goal.projectId ? projects.find((p) => p.id === goal.projectId) : null;
  const linkedTickets = workspaceTickets.filter((t) => goal.linkedTicketIds.includes(t.id));
  const linkableTickets = workspaceTickets.filter((t) => !goal.linkedTicketIds.includes(t.id));

  const isDerived = isGoalProgressDerived(goal);

  const handleAddMilestone = () => {
    if (!newMilestone.trim()) return;
    addGoalMilestone(goal.id, newMilestone.trim());
    setNewMilestone('');
  };

  const handleCheckInSubmit = () => {
    addGoalCheckIn(goal.id, {
      progressValue: checkInProgress ? Number(checkInProgress) : progress,
      notes: checkInNotes.trim(),
      blockers: checkInBlockers.trim() || undefined,
      nextStep: checkInNextStep.trim() || undefined,
    });
    setCheckInOpen(false);
    setCheckInProgress('');
    setCheckInNotes('');
    setCheckInBlockers('');
    setCheckInNextStep('');
  };

  const handleDelete = () => {
    if (confirm(`Delete goal "${goal.title}"? This cannot be undone.`)) {
      deleteGoal(goal.id);
      onClose();
    }
  };

  const handleComplete = () => {
    updateGoal(goal.id, { status: 'completed', health: 'completed', completedAt: new Date().toISOString() }, 'Marked as completed');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-start justify-between gap-2 bg-slate-50/70">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <GoogleIcon name="flag" size={13} className="text-blue-600 shrink-0" />
              {project && <span className="text-[10px] font-semibold text-slate-500 truncate">{project.name}</span>}
            </div>
            <h3 className="font-bold text-slate-800 text-sm leading-snug">{goal.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded shrink-0" title="Close">
            <GoogleIcon name="close" size={18} />
          </button>
        </div>

        <div className="p-5 text-xs space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-700">Progress</span>
              <select
                value={goal.health}
                onChange={(e) => updateGoal(goal.id, { health: e.target.value as GoalHealth }, 'Health manually updated')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${GOAL_HEALTH_COLOR[goal.health]}`}
              >
                {HEALTH_OPTIONS.map((h) => (
                  <option key={h} value={h}>{GOAL_HEALTH_LABEL[h]}</option>
                ))}
              </select>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  goal.health === 'behind' || goal.health === 'overdue' ? 'bg-rose-500' : goal.health === 'at_risk' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
              <span>{goal.currentValue} / {goal.targetValue} {goal.unit} {isDerived && '(from milestones/tickets)'}</span>
              <span className="font-semibold">{progress}%</span>
            </div>
          </div>

          {/* Specific / Measurement / Why */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Start</div>
              <div className="text-slate-700 font-medium">{new Date(goal.startDate).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Deadline</div>
              <div className={`font-medium ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                {new Date(goal.targetDate).toLocaleDateString()} {isOverdue ? `(${Math.abs(days)}d overdue)` : `(${days}d left)`}
              </div>
            </div>
          </div>

          {goal.description && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Specific</div>
              <p className="text-slate-600 leading-relaxed">{goal.description}</p>
            </div>
          )}

          {goal.purpose && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Why</div>
              <p className="text-slate-600 leading-relaxed italic">"{goal.purpose}"</p>
            </div>
          )}

          {/* Milestones */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Milestones ({goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length})
            </div>
            <div className="space-y-1">
              {goal.milestones.map((m) => (
                <div key={m.id} className="flex items-center gap-2 group">
                  <button
                    onClick={() => toggleGoalMilestone(goal.id, m.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      m.completed ? 'bg-emerald-500 border-emerald-600 text-white' : 'border-slate-300 hover:border-emerald-500'
                    }`}
                  >
                    {m.completed && <GoogleIcon name="check" size={11} weight={700} />}
                  </button>
                  <span className={`flex-1 ${m.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{m.title}</span>
                  <button
                    onClick={() => deleteGoalMilestone(goal.id, m.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity"
                  >
                    <GoogleIcon name="close" size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 mt-2">
              <input
                type="text"
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone()}
                placeholder="Add a milestone..."
                className="flex-1 border border-slate-200 rounded-lg p-1.5 text-xs"
              />
              <button onClick={handleAddMilestone} className="px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold">
                <GoogleIcon name="add" size={13} />
              </button>
            </div>
          </div>

          {/* Linked Work */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Linked Work ({linkedTickets.length})</div>
            <div className="space-y-1">
              {linkedTickets.map((t) => (
                <div key={t.id} className="flex items-center gap-2 group p-1.5 rounded hover:bg-slate-50">
                  <GoogleIcon name={t.status === 'DONE' ? 'check_circle' : 'radio_button_unchecked'} size={13} className={t.status === 'DONE' ? 'text-emerald-600' : 'text-slate-300'} />
                  <button
                    onClick={() => { setSelectedTicketId(t.id); onClose(); }}
                    className="flex-1 text-left text-slate-700 hover:text-blue-600 truncate"
                  >
                    {t.title}
                  </button>
                  <button
                    onClick={() => unlinkTicketFromGoal(goal.id, t.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity"
                  >
                    <GoogleIcon name="close" size={12} />
                  </button>
                </div>
              ))}
              {linkedTickets.length === 0 && <p className="text-slate-400 italic">No tickets linked yet.</p>}
            </div>
            {linkableTickets.length > 0 && (
              <div className="flex gap-1.5 mt-2">
                <select
                  value={linkTicketId}
                  onChange={(e) => setLinkTicketId(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs"
                >
                  <option value="">Link a ticket...</option>
                  {linkableTickets.map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
                <button
                  onClick={() => { if (linkTicketId) { linkTicketToGoal(goal.id, linkTicketId); setLinkTicketId(''); } }}
                  disabled={!linkTicketId}
                  className="px-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-lg font-semibold"
                >
                  <GoogleIcon name="link" size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Check-ins */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-ins</span>
              <button onClick={() => setCheckInOpen((v) => !v)} className="text-blue-600 font-semibold flex items-center gap-1">
                <GoogleIcon name="add" size={12} /> Add Check-in
              </button>
            </div>

            {checkInOpen && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 mb-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Progress ({goal.unit || '%'})</label>
                  <input
                    type="number"
                    value={checkInProgress}
                    onChange={(e) => setCheckInProgress(e.target.value)}
                    placeholder={String(goal.currentValue)}
                    disabled={isDerived}
                    className="w-full border border-slate-200 rounded p-1.5 text-xs disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">What changed?</label>
                  <textarea rows={2} value={checkInNotes} onChange={(e) => setCheckInNotes(e.target.value)} className="w-full border border-slate-200 rounded p-1.5 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">What's blocking progress?</label>
                  <input type="text" value={checkInBlockers} onChange={(e) => setCheckInBlockers(e.target.value)} className="w-full border border-slate-200 rounded p-1.5 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Next step</label>
                  <input type="text" value={checkInNextStep} onChange={(e) => setCheckInNextStep(e.target.value)} className="w-full border border-slate-200 rounded p-1.5 text-xs" />
                </div>
                <button onClick={handleCheckInSubmit} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
                  Save Check-in
                </button>
              </div>
            )}

            <div className="space-y-2">
              {[...goal.checkIns].reverse().map((c) => (
                <div key={c.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    <span className="font-semibold text-slate-600">{c.progressValue}{goal.unit === '%' ? '%' : ` ${goal.unit}`}</span>
                  </div>
                  {c.notes && <p className="text-slate-700">{c.notes}</p>}
                  {c.blockers && <p className="text-amber-700 mt-0.5">Blocker: {c.blockers}</p>}
                  {c.nextStep && <p className="text-blue-700 mt-0.5">Next: {c.nextStep}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Activity</div>
            <div className="space-y-1.5">
              {[...goal.activity].reverse().slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-start justify-between text-[11px]">
                  <span className="text-slate-600">{a.action}</span>
                  <span className="text-slate-400 shrink-0 ml-2">{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50/60">
          <button onClick={handleDelete} className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold flex items-center gap-1">
            <GoogleIcon name="delete" size={13} /> Delete
          </button>
          {goal.status !== 'completed' && (
            <button onClick={handleComplete} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1">
              <GoogleIcon name="task_alt" size={13} /> Mark Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
