import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GoalMeasurementType } from '../types';
import { GoogleIcon } from './GoogleIcon';
import { GOAL_MEASUREMENT_OPTIONS, computeSmartChecks, computeSmartScore } from '../utils/goalUtils';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (goalId: string) => void;
}

const STEPS = ['Specific', 'Measurable', 'Relevant', 'Time-bound', 'Achievable', 'Review'];

const todayISO = () => new Date().toISOString().slice(0, 10);

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { createGoal, workspaceProjects } = useApp();

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [measurementType, setMeasurementType] = useState<GoalMeasurementType>('percentage');
  const [targetValue, setTargetValue] = useState('100');
  const [unit, setUnit] = useState('%');
  const [milestoneTitles, setMilestoneTitles] = useState<string[]>(['']);
  const [purpose, setPurpose] = useState('');
  const [projectId, setProjectId] = useState('');
  const [startDate, setStartDate] = useState(todayISO());
  const [targetDate, setTargetDate] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('');

  const reset = () => {
    setStep(0);
    setTitle('');
    setDescription('');
    setMeasurementType('percentage');
    setTargetValue('100');
    setUnit('%');
    setMilestoneTitles(['']);
    setPurpose('');
    setProjectId('');
    setStartDate(todayISO());
    setTargetDate('');
    setHoursPerWeek('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  const numericTargetValue = measurementType === 'binary' ? 1 : measurementType === 'milestones'
    ? Math.max(1, milestoneTitles.filter((m) => m.trim()).length)
    : Number(targetValue) || 0;

  const smartChecks = computeSmartChecks({
    title,
    purpose,
    measurementType,
    targetValue: numericTargetValue,
    timeDedicatedHoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : null,
    startDate,
    targetDate,
  });
  const smartScore = computeSmartScore(smartChecks);

  const pace = (() => {
    if (!targetDate) return null;
    const weeksRemaining = Math.max(0.1, (new Date(targetDate).getTime() - Date.now()) / (7 * 86400000));
    const remaining = numericTargetValue;
    return { weeksRemaining: weeksRemaining.toFixed(1), requiredPace: (remaining / weeksRemaining).toFixed(1) };
  })();

  const canAdvance = () => {
    if (step === 0) return title.trim().length > 0;
    if (step === 1) return measurementType === 'binary' || measurementType === 'milestones' || numericTargetValue > 0;
    if (step === 3) return !!targetDate;
    return true;
  };

  const handleSubmit = () => {
    const goal = createGoal({
      title: title.trim(),
      description: description.trim(),
      purpose: purpose.trim(),
      measurementType,
      targetValue: numericTargetValue,
      unit: measurementType === 'binary' ? '' : measurementType === 'milestones' ? 'milestones' : unit.trim(),
      startDate,
      targetDate,
      timeDedicatedHoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : null,
      projectId: projectId || null,
      milestoneTitles,
      smartScore,
    });
    reset();
    onCreated(goal.id);
  };

  const updateMilestone = (i: number, val: string) => {
    setMilestoneTitles((prev) => prev.map((m, idx) => (idx === i ? val : m)));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold">
              <GoogleIcon name="flag" size={14} />
            </div>
            <h3 className="font-bold text-slate-800 text-xs">New SMART Goal</h3>
          </div>
          <button onClick={handleClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded" title="Close">
            <GoogleIcon name="close" size={16} />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-5 pt-3 flex items-center gap-1">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full h-1 rounded-full ${i <= step ? 'bg-blue-600' : 'bg-slate-150'}`}
                style={{ backgroundColor: i <= step ? undefined : '#e2e8f0' }}
              />
              <span className={`text-[9px] font-semibold ${i === step ? 'text-blue-600' : 'text-slate-400'}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 text-xs space-y-3 min-h-[260px] max-h-[60vh] overflow-y-auto">
          {step === 0 && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  What exactly do you want to achieve? *
                </label>
                <input
                  autoFocus
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ship Android v2.0 with stable BLE and Passkey auth"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Be concrete. "Get better at Android" is vague — "Build and ship a production-quality sample app using Clean Architecture" is specific.
                </p>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any additional context or scope..."
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  How will you measure success?
                </label>
                <select
                  value={measurementType}
                  onChange={(e) => {
                    const mt = e.target.value as GoalMeasurementType;
                    setMeasurementType(mt);
                    setUnit(GOAL_MEASUREMENT_OPTIONS.find((o) => o.value === mt)?.unitPlaceholder || '');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  {GOAL_MEASUREMENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {measurementType === 'milestones' ? (
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Milestones</label>
                  <div className="space-y-1.5">
                    {milestoneTitles.map((m, i) => (
                      <input
                        key={i}
                        type="text"
                        value={m}
                        onChange={(e) => updateMilestone(i, e.target.value)}
                        placeholder={`Milestone ${i + 1}`}
                        className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => setMilestoneTitles((prev) => [...prev, ''])}
                      className="text-blue-600 font-semibold flex items-center gap-1"
                    >
                      <GoogleIcon name="add" size={12} /> Add milestone
                    </button>
                  </div>
                </div>
              ) : measurementType === 'binary' ? (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-500">
                  This goal will be tracked as simply <strong>Complete</strong> or <strong>Not Complete</strong> — no numeric target needed.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Target</label>
                    <input
                      type="number"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Unit</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder={GOAL_MEASUREMENT_OPTIONS.find((o) => o.value === measurementType)?.unitPlaceholder}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Why does this goal matter?
                </label>
                <textarea
                  autoFocus
                  rows={3}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Prepare for senior/staff-level opportunities."
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Linked Project (optional)</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  <option value="">No project</option>
                  {workspaceProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Start *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Target *</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  How much time can you dedicate per week?
                </label>
                <input
                  type="number"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>
              {pace && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-slate-600">
                  <div className="flex justify-between"><span>Target</span><span className="font-semibold text-slate-800">{numericTargetValue} {unit}</span></div>
                  <div className="flex justify-between"><span>Time remaining</span><span className="font-semibold text-slate-800">{pace.weeksRemaining} weeks</span></div>
                  <div className="flex justify-between"><span>Required pace</span><span className="font-semibold text-blue-600">{pace.requiredPace} / week</span></div>
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                {smartChecks.map((c) => (
                  <div key={c.key} className="flex items-center gap-1.5">
                    <GoogleIcon
                      name={c.passed ? 'check_circle' : 'warning'}
                      size={13}
                      className={c.passed ? 'text-emerald-600' : 'text-amber-500'}
                    />
                    <span className={c.passed ? 'text-slate-700' : 'text-slate-500'}>{c.label}</span>
                  </div>
                ))}
                <div className="pt-1.5 mt-1.5 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-700">SMART Score</span>
                  <span className="font-bold text-blue-600">{smartScore} / 5</span>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 space-y-1 text-slate-600">
                <div className="font-bold text-slate-800">{title || 'Untitled goal'}</div>
                {purpose && <div className="text-[11px] italic">"{purpose}"</div>}
                <div className="text-[11px]">Target: {numericTargetValue} {unit} by {targetDate || '—'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50/60">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-3 py-1.5 text-slate-600 font-semibold rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              disabled={!canAdvance()}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-semibold rounded-lg flex items-center gap-1"
            >
              Next <GoogleIcon name="arrow_forward" size={13} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !targetDate}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-semibold rounded-lg flex items-center gap-1"
            >
              <GoogleIcon name="flag" size={13} /> Create Goal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
