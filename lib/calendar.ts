// "Add to calendar" deep links. Google works great on Android & web;
// Outlook link covers Windows/Outlook users. Apple/iOS uses the .ics file.

import { icsDate } from "./ics";

export interface CalLinkInput {
  title: string;
  start: Date;
  durationMin: number;
  details: string;
  location: string;
}

export function googleCalendarUrl(i: CalLinkInput): string {
  const end = new Date(i.start.getTime() + i.durationMin * 60000);
  const dates = `${icsDate(i.start)}/${icsDate(end)}`;
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: i.title,
    dates,
    details: i.details,
    location: i.location,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function outlookCalendarUrl(i: CalLinkInput): string {
  const end = new Date(i.start.getTime() + i.durationMin * 60000);
  const p = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: i.title,
    startdt: i.start.toISOString(),
    enddt: end.toISOString(),
    body: i.details,
    location: i.location,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${p.toString()}`;
}
