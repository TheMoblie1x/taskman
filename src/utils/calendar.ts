import { Ticket, Project } from '../types';

export function formatGCalDate(dateString: string, durationMinutes = 60): { start: string; end: string } {
  const date = new Date(dateString);
  const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
  
  const toGCalString = (d: Date) => {
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  };

  const start = toGCalString(date);
  const endDate = new Date(date.getTime() + durationMinutes * 60 * 1000);
  const end = toGCalString(endDate);

  return { start, end };
}

export function generateGoogleCalendarUrl(ticket: Ticket, project?: Project): string {
  const ticketKey = project ? `${project.key}-${ticket.ticketNumber}` : `TICKET-${ticket.ticketNumber}`;
  const title = `[${ticketKey}] ${ticket.title}`;
  
  const targetDate = ticket.dueAt || ticket.startAt || new Date().toISOString();
  const { start, end } = formatGCalDate(targetDate);
  
  const details = [
    `Ticket: ${ticketKey}`,
    `Priority: ${ticket.priority.toUpperCase()}`,
    `Status: ${ticket.status}`,
    ticket.assigneeId ? `Assignee ID: ${ticket.assigneeId}` : '',
    '',
    'Description:',
    ticket.description,
    '',
    `Manage ticket in Kanban Board: ${window.location.origin}`,
  ].filter(Boolean).join('\n');

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', title);
  url.searchParams.set('dates', `${start}/${end}`);
  url.searchParams.set('details', details);
  url.searchParams.set('location', 'Kanban Platform Workspace');

  return url.toString();
}

export function generateOutlookCalendarUrl(ticket: Ticket, project?: Project): string {
  const ticketKey = project ? `${project.key}-${ticket.ticketNumber}` : `TICKET-${ticket.ticketNumber}`;
  const title = `[${ticketKey}] ${ticket.title}`;
  
  const targetDate = ticket.dueAt || ticket.startAt || new Date().toISOString();
  const startDate = new Date(targetDate);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const details = [
    `Ticket: ${ticketKey}`,
    `Priority: ${ticket.priority.toUpperCase()}`,
    `Status: ${ticket.status}`,
    '',
    ticket.description,
  ].join('\n');

  const url = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
  url.searchParams.set('subject', title);
  url.searchParams.set('startdt', startDate.toISOString());
  url.searchParams.set('enddt', endDate.toISOString());
  url.searchParams.set('body', details);
  url.searchParams.set('location', 'Kanban Platform');

  return url.toString();
}

export function downloadICSFile(ticket: Ticket, project?: Project): void {
  const ticketKey = project ? `${project.key}-${ticket.ticketNumber}` : `TICKET-${ticket.ticketNumber}`;
  const title = `[${ticketKey}] ${ticket.title}`;
  const targetDate = ticket.dueAt || ticket.startAt || new Date().toISOString();
  const { start, end } = formatGCalDate(targetDate);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Collaborative Kanban Platform//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${ticket.id}@kanban.app`,
    `DTSTAMP:${formatGCalDate(new Date().toISOString()).start}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title.replace(/,/g, '\\,')}`,
    `DESCRIPTION:${ticket.description.replace(/\n/g, '\\n')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${ticketKey}_calendar_event.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
