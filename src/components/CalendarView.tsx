import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Ticket } from '../types';
import { TicketTypeBadge, PriorityBadge } from './TicketBadge';
import { GoogleIcon } from './GoogleIcon';

export const CalendarView: React.FC<{ onOpenCreateTicket: () => void }> = ({
  onOpenCreateTicket,
}) => {
  const { tickets, projects, setSelectedTicketId, calendarConnections } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month & total days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Map tickets to days of the current month
  const ticketsByDay: Record<number, Ticket[]> = {};
  tickets.forEach((t) => {
    if (t.dueAt) {
      const d = new Date(t.dueAt);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!ticketsByDay[day]) ticketsByDay[day] = [];
        ticketsByDay[day].push(t);
      }
    }
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-2.75rem)] overflow-hidden bg-white">
      {/* Calendar Header */}
      <div className="px-3 py-1.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <GoogleIcon name="calendar_today" size={16} className="text-blue-600" />
            <span>{monthName}</span>
          </h2>
          <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded p-0.5 shadow-2xs">
            <button
              onClick={prevMonth}
              className="p-0.5 text-slate-600 hover:bg-slate-100 rounded"
              title="Previous Month"
            >
              <GoogleIcon name="chevron_left" size={14} />
            </button>
            <button
              onClick={goToToday}
              className="px-1.5 py-0.2 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 rounded"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-0.5 text-slate-600 hover:bg-slate-100 rounded"
              title="Next Month"
            >
              <GoogleIcon name="chevron_right" size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Google Calendar Sync Active
            </span>
          </div>
          <button
            onClick={onOpenCreateTicket}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs"
          >
            <GoogleIcon name="add" size={12} />
            <span>Schedule Ticket</span>
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/60 text-slate-500 text-[10px] font-bold text-center py-1 uppercase tracking-wider">
        {weekDays.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto divide-x divide-y divide-slate-100 bg-slate-50/30">
        {/* Leading empty cells */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-slate-50/50 p-1 text-slate-300 text-xs min-h-[75px]" />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNumber = idx + 1;
          const dayTickets = ticketsByDay[dayNumber] || [];
          const isToday =
            new Date().getFullYear() === year &&
            new Date().getMonth() === month &&
            new Date().getDate() === dayNumber;

          return (
            <div
              key={dayNumber}
              className={`p-1 min-h-[75px] flex flex-col justify-between hover:bg-blue-50/30 transition-colors ${
                isToday ? 'bg-blue-50/40 font-bold' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`w-5 h-5 flex items-center justify-center rounded-full text-[11px] ${
                    isToday ? 'bg-blue-600 text-white font-bold' : 'text-slate-700 font-semibold'
                  }`}
                >
                  {dayNumber}
                </span>
                {dayTickets.length > 0 && (
                  <span className="text-[9px] text-slate-400 font-medium">{dayTickets.length} tasks</span>
                )}
              </div>

              {/* Day Tickets List */}
              <div className="space-y-0.5 overflow-y-auto max-h-[70px]">
                {dayTickets.map((t) => {
                  const proj = projects.find((p) => p.id === t.projectId);
                  const ticketKey = proj ? `${proj.key}-${t.ticketNumber}` : `TKT-${t.ticketNumber}`;

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`p-0.5 px-1 rounded text-[10px] font-medium border truncate cursor-pointer transition-all hover:scale-[1.01] shadow-2xs ${
                        t.status === 'DONE'
                          ? 'bg-slate-100 text-slate-500 border-slate-200 line-through'
                          : 'bg-white text-slate-800 border-blue-200 hover:border-blue-400'
                      }`}
                      title={`${ticketKey}: ${t.title}`}
                    >
                      <span className="font-mono text-[9px] font-bold text-blue-600 mr-1">{ticketKey}</span>
                      <span>{t.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
