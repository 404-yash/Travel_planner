// Helpers that let a traveller take the trip OUT of the website: calendar file + WhatsApp message.
// India has no daylight saving, so IST is a fixed UTC+05:30 and the conversion below is exact.

export interface TripLeg { mode: string; operator: string; name: string; from: string; to: string; departureTime: string; arrivalTime: string; }
export interface TripInfo { bookingRef: string; origin: string; destination: string; legs: TripLeg[]; }

/** "2026-11-21 18:30" (IST) -> "20261121T130000Z" (UTC) */
export function istToIcsUtc(local: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(local.trim());
  if (!m) throw new Error(`Bad date-time: ${local}`);
  const [, y, mo, d, h, mi] = m.map(Number);
  const utc = new Date(Date.UTC(y, mo - 1, d, h, mi) - (5 * 60 + 30) * 60_000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${utc.getUTCFullYear()}${p(utc.getUTCMonth() + 1)}${p(utc.getUTCDate())}T${p(utc.getUTCHours())}${p(utc.getUTCMinutes())}00Z`;
}

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

/** One calendar event per leg, each with a 60-minute reminder. */
export function buildIcs(t: TripInfo, now: Date = new Date()): string {
  const stamp = istToIcsUtc(
    new Date(now.getTime() + (5 * 60 + 30) * 60_000).toISOString().slice(0, 16).replace('T', ' '));
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Journey//Trip//EN', 'CALSCALE:GREGORIAN'];
  t.legs.forEach((l, i) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${t.bookingRef}-${i + 1}@journey.app`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${istToIcsUtc(l.departureTime)}`,
      `DTEND:${istToIcsUtc(l.arrivalTime)}`,
      `SUMMARY:${esc(`${l.mode} ${l.from} to ${l.to} (${t.bookingRef})`)}`,
      `DESCRIPTION:${esc(`${l.operator} ${l.name}. Booking ${t.bookingRef}.`)}`,
      `LOCATION:${esc(l.from)}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Time to leave', 'TRIGGER:-PT60M', 'END:VALARM',
      'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

export function whatsappLink(t: TripInfo): string {
  const body = [`My trip ${t.origin} to ${t.destination} (ref ${t.bookingRef})`,
    ...t.legs.map((l, i) => `${i + 1}. ${l.mode} ${l.from} ${l.departureTime.slice(11)} to ${l.to} ${l.arrivalTime.slice(11)}`)].join('\n');
  return `https://wa.me/?text=${encodeURIComponent(body)}`;
}
