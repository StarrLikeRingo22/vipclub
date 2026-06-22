// iCalendar (.ics) generation — works with Apple Calendar, Outlook, Google,
// and Android (most mail apps surface .ics as "Add to calendar").

export interface CalEvent {
  uid: string;
  start: Date;
  durationMin: number;
  title: string;
  description: string;
  location: string;
  organizerName: string;
  organizerEmail: string;
  attendeeEmail?: string | null;
  method?: "PUBLISH" | "REQUEST" | "CANCEL"; // CANCEL removes it from the calendar
  sequence?: number;                          // bump on each update so clients refresh
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// UTC stamp: YYYYMMDDTHHMMSSZ
export function icsDate(d: Date): string {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

// RFC5545 line folding at 75 octets.
function fold(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let rest = line;
  chunks.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 74) {
    chunks.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  if (rest.length) chunks.push(" " + rest);
  return chunks.join("\r\n");
}

export function buildIcs(ev: CalEvent): string {
  const end = new Date(ev.start.getTime() + ev.durationMin * 60000);
  const method = ev.method ?? "PUBLISH";
  const cancelled = method === "CANCEL";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VIP Club//Booking//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${method}`,
    "BEGIN:VEVENT",
    `UID:${ev.uid}`,
    `SEQUENCE:${ev.sequence ?? 0}`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(ev.start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${esc(cancelled ? "CANCELLED: " + ev.title : ev.title)}`,
    `DESCRIPTION:${esc(ev.description)}`,
    `LOCATION:${esc(ev.location)}`,
    `ORGANIZER;CN=${esc(ev.organizerName)}:mailto:${ev.organizerEmail}`,
    ...(ev.attendeeEmail ? [`ATTENDEE;CN=Guest;RSVP=TRUE:mailto:${ev.attendeeEmail}`] : []),
    `STATUS:${cancelled ? "CANCELLED" : "CONFIRMED"}`,
    ...(cancelled
      ? []
      : ["BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:Reminder", "END:VALARM"]),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n");
}
