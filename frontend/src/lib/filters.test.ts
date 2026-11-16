import assert from 'node:assert/strict';
import { defaultFilters, fromQuery, toQuery, toSearchParams, nextSaturday, formatDuration } from './filters.ts';

const today = new Date(2026, 10, 15); // Sun 15 Nov 2026
assert.equal(nextSaturday(today), '2026-11-21');
assert.equal(nextSaturday(new Date(2026, 10, 21)), '2026-11-21');           // Saturday stays Saturday
assert.equal(nextSaturday(new Date(2026, 11, 31, 23, 30)), '2027-01-02');    // year rollover, late evening (no UTC drift)

const d = defaultFilters(today);
assert.equal(toQuery(d, today).toString(), 'from=Nanded&to=Prayagraj&date=2026-11-21');   // defaults stay short
const f = { ...d, origin: 'Pune', destination: 'Delhi', sort: 'FASTEST' as const, modes: ['TRAIN' as const, 'FLIGHT' as const], maxFare: 6000, passengers: 3, maxLegs: 3, window: 'MORNING' };
const round = fromQuery(toQuery(f, today), today);
assert.deepEqual(round, f);                                                    // URL round-trip is lossless
const junk = fromQuery(new URLSearchParams('hops=99&sort=DROP&modes=CAR&date=tomorrow&pax=-2&budget=abc'), today);
assert.deepEqual(junk, { ...d, maxFare: undefined });                         // junk input falls back to defaults
assert.deepEqual(toSearchParams(f).allowedModes, ['TRAIN', 'FLIGHT']);
assert.equal(formatDuration(45), '45m'); assert.equal(formatDuration(390), '6h 30m'); assert.equal(formatDuration(1500), '1d 1h'); assert.equal(formatDuration(120), '2h');
console.log('filters: all assertions passed');
