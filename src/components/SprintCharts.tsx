import React from 'react';
import { BurndownPoint, VelocityBar, Segment, formatDay } from '../utils/sprintMetrics';

// Small hand-rolled SVG/flex charts — the app carries no charting dependency and these stay
// deliberately minimal. All are theme-aware: axis lines/text use currentColor (set by a
// text-slate-* class on the wrapper), data series use fixed semantic colors.

export const ChartCard: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({
  title,
  hint,
  children,
}) => (
  <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 p-3 break-inside-avoid">
    <div className="flex items-baseline justify-between mb-2">
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</h4>
      {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
    </div>
    {children}
  </div>
);

const PAD = { l: 26, r: 8, t: 10, b: 18 };
const W = 320;
const H = 150;

export const BurndownChart: React.FC<{ data: BurndownPoint[] }> = ({ data }) => {
  if (data.length < 2) {
    return <p className="text-xs text-slate-400 py-8 text-center">Not enough sprint days to plot.</p>;
  }
  const maxY = Math.max(1, ...data.map((d) => d.ideal), ...data.map((d) => d.remaining ?? 0));
  const x = (i: number) => PAD.l + (i / (data.length - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v / maxY) * (H - PAD.t - PAD.b);

  const idealPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.ideal)}`).join(' ');
  const actual = data.filter((d) => d.remaining !== null);
  const actualPath = actual.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(data.indexOf(d))},${y(d.remaining as number)}`).join(' ');
  const gridVals = [0, maxY / 2, maxY];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full text-slate-400" role="img" aria-label="Burndown chart">
      {gridVals.map((v, i) => (
        <g key={i}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity={0.2} />
          <text x={PAD.l - 4} y={y(v) + 3} textAnchor="end" fontSize={8} fill="currentColor">
            {Math.round(v)}
          </text>
        </g>
      ))}
      {[0, Math.floor((data.length - 1) / 2), data.length - 1].map((i) => (
        <text key={i} x={x(i)} y={H - 4} textAnchor="middle" fontSize={8} fill="currentColor">
          {formatDay(data[i].day)}
        </text>
      ))}
      <path d={idealPath} fill="none" stroke="currentColor" strokeOpacity={0.5} strokeDasharray="3 3" strokeWidth={1.5} />
      <path d={actualPath} fill="none" stroke="#2563eb" strokeWidth={2} />
      {actual.map((d) => (
        <circle key={d.day} cx={x(data.indexOf(d))} cy={y(d.remaining as number)} r={2} fill="#2563eb" />
      ))}
      <g fontSize={8} fill="currentColor">
        <rect x={PAD.l} y={0} width={8} height={2} fill="#2563eb" />
        <text x={PAD.l + 12} y={4}>Remaining</text>
        <rect x={PAD.l + 62} y={0} width={8} height={2} fill="currentColor" fillOpacity={0.5} />
        <text x={PAD.l + 74} y={4}>Ideal</text>
      </g>
    </svg>
  );
};

export const VelocityChart: React.FC<{ bars: VelocityBar[] }> = ({ bars }) => {
  if (bars.length === 0) {
    return <p className="text-xs text-slate-400 py-8 text-center">No completed sprints yet.</p>;
  }
  const maxY = Math.max(1, ...bars.map((b) => Math.max(b.committed, b.completed)));
  const slot = (W - PAD.l - PAD.r) / bars.length;
  const barW = Math.min(18, slot / 3);
  const y = (v: number) => PAD.t + (1 - v / maxY) * (H - PAD.t - PAD.b);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full text-slate-400" role="img" aria-label="Velocity chart">
      {[0, maxY / 2, maxY].map((v, i) => (
        <g key={i}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity={0.2} />
          <text x={PAD.l - 4} y={y(v) + 3} textAnchor="end" fontSize={8} fill="currentColor">
            {Math.round(v)}
          </text>
        </g>
      ))}
      {bars.map((b, i) => {
        const cx = PAD.l + i * slot + slot / 2;
        return (
          <g key={b.sprintId}>
            <rect x={cx - barW - 1} y={y(b.committed)} width={barW} height={y(0) - y(b.committed)} fill="#93c5fd" rx={1} />
            <rect x={cx + 1} y={y(b.completed)} width={barW} height={y(0) - y(b.completed)} fill="#2563eb" rx={1} />
            <text x={cx} y={H - 4} textAnchor="middle" fontSize={7} fill="currentColor">
              {b.name.length > 10 ? b.name.slice(0, 9) + '…' : b.name}
            </text>
          </g>
        );
      })}
      <g fontSize={8} fill="currentColor">
        <rect x={PAD.l} y={0} width={8} height={4} fill="#93c5fd" />
        <text x={PAD.l + 12} y={4}>Committed</text>
        <rect x={PAD.l + 66} y={0} width={8} height={4} fill="#2563eb" />
        <text x={PAD.l + 78} y={4}>Completed</text>
      </g>
    </svg>
  );
};

export const SegmentBars: React.FC<{ segments: Segment[]; dotOf?: (key: string) => string }> = ({
  segments,
  dotOf,
}) => {
  if (segments.length === 0) {
    return <p className="text-xs text-slate-400 py-6 text-center">No tickets to break down.</p>;
  }
  const max = Math.max(1, ...segments.map((s) => s.points));
  return (
    <div className="space-y-1.5">
      {segments.map((s) => (
        <div key={s.key} className="flex items-center gap-2 text-xs">
          <div className="w-24 shrink-0 flex items-center gap-1.5 truncate text-slate-600 dark:text-slate-300">
            {dotOf && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotOf(s.key)}`} />}
            <span className="truncate">{s.label}</span>
          </div>
          <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500 dark:bg-blue-600 rounded"
              style={{ width: `${(s.points / max) * 100}%` }}
            />
          </div>
          <span className="w-14 shrink-0 text-right tabular-nums text-slate-500 dark:text-slate-400">
            {s.points} pt{s.points === 1 ? '' : 's'}
          </span>
        </div>
      ))}
    </div>
  );
};
