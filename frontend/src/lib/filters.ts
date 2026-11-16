// Single source of truth for the search form. Lives in the URL, so a search can be
// shared, bookmarked, and the browser Back button works.

export type Mode = 'BUS' | 'TRAIN' | 'FLIGHT';
export type SortKey =
  | 'CHEAPEST' | 'FASTEST' | 'BALANCED' | 'GREENEST'
  | 'FEWEST_TRANSFERS' | 'WAITING_TIME' | 'LOWEST_RISK';

export interface Filters {
  origin: string;
  destination: string;
  date: string;          // yyyy-mm-dd
  sort: SortKey;
  maxLegs: number;
  modes: Mode[];
  window: string;        // ANY | MORNING | AFTERNOON | EVENING | NIGHT
  maxFare?: number;
  passengers: number;
}

export interface RouteSearchParams {   // same shape the backend already accepts
  origin: string; destination: string; date: string; strategy: string;
  maxLegs: number; allowedModes: string[]; departureWindow: string; maxFare?: number;
}

const ALL_MODES: Mode[] = ['BUS', 'TRAIN', 'FLIGHT'];
const SORTS: SortKey[] = ['CHEAPEST', 'FASTEST', 'BALANCED', 'GREENEST', 'FEWEST_TRANSFERS', 'WAITING_TIME', 'LOWEST_RISK'];
const WINDOWS = ['ANY', 'MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'];

const pad = (n: number) => String(n).padStart(2, '0');
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Next Saturday (or today if it already is Saturday). Local time, so no UTC off-by-one. */
export function nextSaturday(today: Date = new Date()): string {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7));
  return toISO(d);
}

export const defaultFilters = (today: Date = new Date()): Filters => ({
  origin: 'Nanded', destination: 'Prayagraj', date: nextSaturday(today),
  sort: 'BALANCED', maxLegs: 2, modes: [...ALL_MODES], window: 'ANY', passengers: 1,
});

const int = (v: string | null, min: number, max: number, fallback: number) => {
  const n = v == null ? NaN : parseInt(v, 10);
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
};

export function fromQuery(q: URLSearchParams, today: Date = new Date()): Filters {
  const d = defaultFilters(today);
  const sort = (q.get('sort') || '').toUpperCase() as SortKey;
  const modes = (q.get('modes') || '').split(',').filter((m): m is Mode => (ALL_MODES as string[]).includes(m));
  const date = q.get('date') || '';
  const win = (q.get('when') || '').toUpperCase();
  return {
    origin: q.get('from') || d.origin,
    destination: q.get('to') || d.destination,
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : d.date,
    sort: SORTS.includes(sort) ? sort : d.sort,
    maxLegs: int(q.get('hops'), 1, 4, d.maxLegs),
    modes: modes.length ? modes : d.modes,
    window: WINDOWS.includes(win) ? win : d.window,
    maxFare: q.get('budget') ? int(q.get('budget'), 1, 1_000_000, 0) || undefined : undefined,
    passengers: int(q.get('pax'), 1, 9, 1),
  };
}

/** Only non-default values go in the URL, to keep links short. */
export function toQuery(f: Filters, today: Date = new Date()): URLSearchParams {
  const d = defaultFilters(today);
  const q = new URLSearchParams({ from: f.origin, to: f.destination, date: f.date });
  if (f.sort !== d.sort) q.set('sort', f.sort);
  if (f.maxLegs !== d.maxLegs) q.set('hops', String(f.maxLegs));
  if (f.modes.length !== ALL_MODES.length) q.set('modes', f.modes.join(','));
  if (f.window !== 'ANY') q.set('when', f.window);
  if (f.maxFare) q.set('budget', String(f.maxFare));
  if (f.passengers > 1) q.set('pax', String(f.passengers));
  return q;
}

export const toSearchParams = (f: Filters): RouteSearchParams => ({
  origin: f.origin, destination: f.destination, date: f.date, strategy: f.sort,
  maxLegs: f.maxLegs, allowedModes: f.modes, departureWindow: f.window, maxFare: f.maxFare,
});

/** Human text for a duration in minutes: "6h 30m", "45m", "2d 3h". */
export function formatDuration(min: number): string {
  if (min < 60) return `${min}m`;
  if (min >= 1440) { const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60); return h ? `${d}d ${h}h` : `${d}d`; }
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
