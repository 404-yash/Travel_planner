import assert from 'node:assert/strict';
import { istToIcsUtc, buildIcs, whatsappLink } from './trip.ts';

assert.equal(istToIcsUtc('2026-11-21 18:30'), '20261121T130000Z');
assert.equal(istToIcsUtc('2026-11-21 02:15'), '20261120T204500Z');          // crosses midnight backwards
assert.equal(istToIcsUtc('2027-01-01 03:00'), '20261231T213000Z');          // crosses the year
assert.throws(() => istToIcsUtc('tomorrow'));

const trip = { bookingRef: 'JNY-AB23CD', origin: 'Nanded', destination: 'Prayagraj', legs: [
  { mode: 'TRAIN', operator: 'Rail Connect', name: 'Manmad Express, 71402', from: 'Nanded', to: 'Manmad', departureTime: '2026-11-21 15:20', arrivalTime: '2026-11-21 20:50' },
  { mode: 'TRAIN', operator: 'Rail Connect', name: 'Ganga Link', from: 'Manmad', to: 'Prayagraj', departureTime: '2026-11-21 21:35', arrivalTime: '2026-11-22 14:35' }] };
const ics = buildIcs(trip, new Date('2026-11-15T10:00:00Z'));
assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 2);
assert.ok(ics.includes('DTSTART:20261121T095000Z') && ics.includes('DTEND:20261122T090500Z'));
assert.ok(ics.includes('DESCRIPTION:Rail Connect Manmad Express\\, 71402'));    // comma escaped
assert.ok(ics.includes('TRIGGER:-PT60M') && ics.endsWith('END:VCALENDAR\r\n'));
const wa = decodeURIComponent(whatsappLink(trip).split('text=')[1]);
assert.ok(wa.includes('JNY-AB23CD') && wa.includes('1. TRAIN Nanded 15:20 to Manmad 20:50'));
console.log('trip: all assertions passed');
